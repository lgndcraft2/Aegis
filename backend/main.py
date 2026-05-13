from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from backend.ws_manager import manager

app = FastAPI(title="AEGIS MVP API", description="Autonomous Economic Guardian and Interception System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket("/stream/{cycle_id}")
async def websocket_endpoint(websocket: WebSocket, cycle_id: str):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; actual broadcasts happen from orchestration
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


from backend.routers import orchestration, intelligence
app.include_router(orchestration.router)
app.include_router(intelligence.router)


@app.get("/")
def read_root():
    return {"message": "AEGIS API is running"}
