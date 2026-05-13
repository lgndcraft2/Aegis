from fastapi import APIRouter, HTTPException, BackgroundTasks, UploadFile, File
import uuid
import asyncio
from typing import Dict, Any
import pandas as pd
from backend.services.synthetic_data import generate_synthetic_data
from backend.services.payroll_engine import analyze_payroll
from backend.services.procurement_engine import analyze_procurement
from backend.services.collusion_engine import generate_collusion_graph
from backend.services.squad_client import squad_client
# Import manager from ws_manager to avoid circular import
from backend.ws_manager import manager

router = APIRouter(tags=["orchestration"])

# In-memory store for demo
cycle_store = {}

@router.post("/upload/payroll")
async def upload_payroll(file: UploadFile = File(None)):
    job_id = f"JOB_{uuid.uuid4().hex[:8].upper()}"
    return {"job_id": job_id, "status": "Uploaded"}

@router.post("/upload/vendors")
async def upload_vendors(file: UploadFile = File(None)):
    job_id = f"JOB_{uuid.uuid4().hex[:8].upper()}"
    return {"job_id": job_id, "status": "Uploaded"}

async def run_pipeline(cycle_id: str, employees: list, vendors: list):
    try:
        await manager.broadcast({"cycle_id": cycle_id, "stage": "Starting", "progress": 10})
        await asyncio.sleep(1)
        
        # Payroll
        await manager.broadcast({"cycle_id": cycle_id, "stage": "Analyzing Payroll", "progress": 30})
        emp_df, emp_alerts = analyze_payroll(pd.DataFrame(employees), cycle_id)
        scored_employees = emp_df.to_dict(orient="records")
        await asyncio.sleep(1)
        
        # Procurement
        await manager.broadcast({"cycle_id": cycle_id, "stage": "Analyzing Procurement", "progress": 60})
        vnd_df, vnd_alerts = analyze_procurement(pd.DataFrame(vendors), cycle_id)
        scored_vendors = vnd_df.to_dict(orient="records")
        await asyncio.sleep(1)
        
        # Collusion
        await manager.broadcast({"cycle_id": cycle_id, "stage": "Detecting Collusion", "progress": 85})
        graph_elements, coll_alerts = generate_collusion_graph(emp_df, vnd_df, cycle_id)
        
        all_alerts = emp_alerts + vnd_alerts + coll_alerts
        
        # Squad Interception
        await manager.broadcast({"cycle_id": cycle_id, "stage": "Squad Interception", "progress": 95})
        intercepted_amount = 0
        for alert in all_alerts:
            if alert.get("severity") in ["HIGH", "CRITICAL"]:
                # Mock amount
                amt = 250000.0 if alert["entity_type"] == "EMPLOYEE" else 4500000.0
                squad_client.create_virtual_account(alert["entity_id"], amt)
                intercepted_amount += amt
                
        squad_client.bill_audit_fee(cycle_id, len(employees) + len(vendors))
        
        cycle_store[cycle_id] = {
            "status": "COMPLETED",
            "employees": scored_employees,
            "vendors": scored_vendors,
            "graph": graph_elements,
            "summary": {
                "total_alerts": len(all_alerts),
                "intercepted_amount": intercepted_amount
            }
        }
        await manager.broadcast({"cycle_id": cycle_id, "stage": "Completed", "progress": 100})
        
    except Exception as e:
        await manager.broadcast({"cycle_id": cycle_id, "stage": "Error", "message": str(e)})

@router.post("/run-surveillance")
async def run_surveillance(background_tasks: BackgroundTasks):
    cycle_id = f"CYC_{uuid.uuid4().hex[:8].upper()}"
    
    # We use synthetic data for the pipeline demo
    e, v = generate_synthetic_data()
    
    cycle_store[cycle_id] = {"status": "RUNNING"}
    background_tasks.add_task(run_pipeline, cycle_id, e, v)
    
    return {"cycle_id": cycle_id}

@router.get("/results/{cycle_id}")
async def get_results(cycle_id: str):
    if cycle_id not in cycle_store:
        raise HTTPException(status_code=404, detail="Cycle not found")
    return cycle_store[cycle_id]

@router.get("/squad/accounts/{cycle_id}")
async def get_squad_accounts(cycle_id: str):
    # Returns all held accounts for simplicity
    total = sum([acc["amount"] for acc in squad_client.held_accounts.values()])
    return {
        "held_accounts": list(squad_client.held_accounts.items()),
        "total_intercepted": total
    }

@router.post("/demo/load-scenario/{n}")
async def load_scenario(n: int):
    # Just a stub to reset or prepare specific data if needed
    return {"status": f"Scenario {n} loaded"}
