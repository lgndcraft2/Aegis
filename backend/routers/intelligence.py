from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
from typing import List, Dict, Any
from backend.services.payroll_engine import analyze_payroll
from backend.services.procurement_engine import analyze_procurement
from backend.services.collusion_engine import generate_collusion_graph

router = APIRouter(prefix="/intelligence", tags=["intelligence"])

class EmployeePayload(BaseModel):
    cycle_id: str
    employees: List[Dict[str, Any]]

class VendorPayload(BaseModel):
    cycle_id: str
    vendors: List[Dict[str, Any]]

class CollusionPayload(BaseModel):
    cycle_id: str
    employees: List[Dict[str, Any]]
    vendors: List[Dict[str, Any]]

@router.post("/run-payroll-analysis")
async def run_payroll_analysis(payload: EmployeePayload):
    df = pd.DataFrame(payload.employees)
    scored_df, alerts = analyze_payroll(df, payload.cycle_id)
    return {"scored_employees": scored_df.to_dict(orient="records"), "alerts": alerts}

@router.post("/run-procurement-analysis")
async def run_procurement_analysis(payload: VendorPayload):
    df = pd.DataFrame(payload.vendors)
    scored_df, alerts = analyze_procurement(df, payload.cycle_id)
    return {"scored_vendors": scored_df.to_dict(orient="records"), "alerts": alerts}

@router.post("/run-collusion-graph")
async def run_collusion_graph(payload: CollusionPayload):
    emp_df = pd.DataFrame(payload.employees)
    vnd_df = pd.DataFrame(payload.vendors)
    graph_elements, alerts = generate_collusion_graph(emp_df, vnd_df, payload.cycle_id)
    return {"graph_elements": graph_elements, "alerts": alerts}

@router.post("/generate-audit-report")
async def generate_audit_report(cycle_id: str, alerts: List[Dict[str, Any]]):
    # Stub for EFCC/ICPC submission formatted report
    report = {
        "cycle_id": cycle_id,
        "total_flags": len(alerts),
        "critical_flags": len([a for a in alerts if a.get('severity') == 'CRITICAL']),
        "flags_detail": alerts,
        "status": "Ready for submission"
    }
    return report
