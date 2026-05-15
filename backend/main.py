import logging
import sys

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.database import init_db, get_db
from backend.ws_manager import manager
from backend.services.audit import get_cycle_history, get_all_cycles

# ── Configure structured logging ──
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)-24s | %(levelname)-7s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("aegis")

app = FastAPI(
    title="AEGIS MVP API",
    description="Autonomous Economic Guardian and Interception System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Startup: initialize database tables ──
@app.on_event("startup")
async def startup_event():
    logger.info("AEGIS starting up — initializing database...")
    init_db()
    logger.info("AEGIS API ready")


# ── WebSocket endpoint ──
@app.websocket("/stream/{cycle_id}")
async def websocket_endpoint(websocket: WebSocket, cycle_id: str):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; actual broadcasts happen from orchestration
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ── Import and include routers ──
from backend.routers import orchestration, intelligence, webhooks

app.include_router(orchestration.router)
app.include_router(intelligence.router)
app.include_router(webhooks.router)


# ── Root endpoint ──
@app.get("/")
def read_root():
    return {
        "message": "AEGIS API is running",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "upload_payroll": "POST /upload/payroll",
            "upload_vendors": "POST /upload/vendors",
            "run_surveillance": "POST /run-surveillance",
            "results": "GET /results/{cycle_id}",
            "squad_accounts": "GET /squad/accounts/{cycle_id}",
            "demo_scenario": "POST /demo/load-scenario/{n}",
            "cycles": "GET /cycles",
            "audit_trail": "GET /audit/{cycle_id}",
            "websocket": "WS /stream/{cycle_id}",
            "webhook_squad": "POST /webhooks/squad",
        },
    }


# ── Audit & Cycle History Endpoints ──
@app.get("/cycles")
def list_cycles(db: Session = Depends(get_db)):
    """List all surveillance cycles with status and summary stats."""
    return {"cycles": get_all_cycles(db)}


@app.get("/audit/{cycle_id}")
def get_audit_trail(cycle_id: str, db: Session = Depends(get_db)):
    """Get the full audit trail for a surveillance cycle — every event, ordered by time."""
    events = get_cycle_history(db, cycle_id)
    if not events:
        return {"cycle_id": cycle_id, "events": [], "message": "No audit events found for this cycle"}
    return {"cycle_id": cycle_id, "events": events, "total": len(events)}
