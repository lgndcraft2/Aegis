import io
import json
import uuid
import asyncio
import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, BackgroundTasks, UploadFile, File, Depends, Query
from fastapi.responses import Response
import pandas as pd
from sqlalchemy.orm import Session

from backend.database import get_db, SessionLocal
from backend.models import Employee, Vendor, SurveillanceCycle, FraudAlert, Transaction
from backend.services.synthetic_data import generate_synthetic_data, generate_edge_case_data
from backend.services.payroll_engine import analyze_payroll
from backend.services.procurement_engine import analyze_procurement
from backend.services.collusion_engine import generate_collusion_graph
from backend.services.squad_client import squad_client
from backend.services.audit import log_event
from backend.services.pdf_report import generate_cycle_pdf
from backend.ws_manager import manager

logger = logging.getLogger("aegis.orchestration")

router = APIRouter(tags=["orchestration"])

# ──────────────────────────────────────────────
#  CSV Upload Endpoints
# ──────────────────────────────────────────────

PAYROLL_REQUIRED_COLS = [
    "employee_id", "name", "department", "grade_level",
    "salary_account", "bvn", "employment_date",
]

VENDOR_REQUIRED_COLS = [
    "vendor_id", "name", "registration_address",
    "director_name", "settlement_account", "bvn", "registration_date",
]


@router.post("/upload/payroll")
async def upload_payroll(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload a payroll CSV file. Parses, validates, and persists employee records to the database.
    
    Required columns: employee_id, name, department, grade_level, salary_account, bvn, employment_date
    Optional columns: has_service_record, absences_ytd
    """
    job_id = f"JOB_{uuid.uuid4().hex[:8].upper()}"

    # Read and parse CSV
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        # Normalize column names: strip whitespace and lowercase
        df.columns = [col.strip().lower() for col in df.columns]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    # Validate required columns
    missing = [col for col in PAYROLL_REQUIRED_COLS if col not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {missing}. Got: {list(df.columns)}",
        )

    rows_imported = 0
    rows_skipped = 0
    errors = []

    for idx, row in df.iterrows():
        try:
            emp_id = str(row["employee_id"]).strip()

            # Upsert: update if exists, create if not
            existing = db.query(Employee).filter(Employee.employee_id == emp_id).first()

            emp_data = {
                "employee_id": emp_id,
                "name": str(row["name"]),
                "department": str(row["department"]),
                "grade_level": str(row["grade_level"]),
                "salary_account": str(row["salary_account"]),
                "bvn": str(row["bvn"]),
                "employment_date": pd.to_datetime(row["employment_date"], errors="coerce"),
                "has_service_record": bool(row.get("has_service_record", True)),
                "absences_ytd": int(row.get("absences_ytd", 0)),
            }

            if existing:
                for key, val in emp_data.items():
                    setattr(existing, key, val)
            else:
                db.add(Employee(**emp_data))

            rows_imported += 1
        except Exception as e:
            rows_skipped += 1
            errors.append({"row": idx, "error": str(e)})

    db.commit()

    # Audit log
    log_event(
        db=db,
        cycle_id=None,
        event_type="UPLOAD",
        entity_type="PAYROLL",
        entity_id=job_id,
        details={
            "filename": file.filename,
            "rows_imported": rows_imported,
            "rows_skipped": rows_skipped,
            "total_rows": len(df),
        },
    )

    logger.info(f"Payroll upload {job_id}: {rows_imported} imported, {rows_skipped} skipped")

    return {
        "job_id": job_id,
        "status": "Uploaded",
        "rows_imported": rows_imported,
        "rows_skipped": rows_skipped,
        "errors": errors[:10],  # Cap error reporting
    }


@router.post("/upload/vendors")
async def upload_vendors(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload a vendor register CSV file. Parses, validates, and persists vendor records to the database.
    
    Required columns: vendor_id, name, registration_address, director_name, settlement_account, bvn, registration_date
    """
    job_id = f"JOB_{uuid.uuid4().hex[:8].upper()}"

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        # Normalize column names: strip whitespace and lowercase
        df.columns = [col.strip().lower() for col in df.columns]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    missing = [col for col in VENDOR_REQUIRED_COLS if col not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {missing}. Got: {list(df.columns)}",
        )

    rows_imported = 0
    rows_skipped = 0
    errors = []

    for idx, row in df.iterrows():
        try:
            vnd_id = str(row["vendor_id"]).strip()

            existing = db.query(Vendor).filter(Vendor.vendor_id == vnd_id).first()

            vnd_data = {
                "vendor_id": vnd_id,
                "name": str(row["name"]),
                "registration_address": str(row["registration_address"]),
                "director_name": str(row["director_name"]),
                "settlement_account": str(row["settlement_account"]),
                "bvn": str(row["bvn"]),
                "registration_date": pd.to_datetime(row["registration_date"], errors="coerce"),
            }

            if existing:
                for key, val in vnd_data.items():
                    setattr(existing, key, val)
            else:
                db.add(Vendor(**vnd_data))

            rows_imported += 1
        except Exception as e:
            rows_skipped += 1
            errors.append({"row": idx, "error": str(e)})

    db.commit()

    log_event(
        db=db,
        cycle_id=None,
        event_type="UPLOAD",
        entity_type="VENDOR",
        entity_id=job_id,
        details={
            "filename": file.filename,
            "rows_imported": rows_imported,
            "rows_skipped": rows_skipped,
            "total_rows": len(df),
        },
    )

    logger.info(f"Vendor upload {job_id}: {rows_imported} imported, {rows_skipped} skipped")

    return {
        "job_id": job_id,
        "status": "Uploaded",
        "rows_imported": rows_imported,
        "rows_skipped": rows_skipped,
        "errors": errors[:10],
    }


# ──────────────────────────────────────────────
#  Surveillance Pipeline
# ──────────────────────────────────────────────

def _employees_from_db(db: Session) -> list[dict]:
    """Load all employees from database as list of dicts."""
    employees = db.query(Employee).all()
    return [
        {
            "employee_id": e.employee_id,
            "name": e.name,
            "department": e.department,
            "grade_level": e.grade_level,
            "salary_account": e.salary_account,
            "bvn": e.bvn,
            "employment_date": e.employment_date.strftime("%Y-%m-%d") if e.employment_date else None,
            "has_service_record": e.has_service_record,
            "absences_ytd": e.absences_ytd or 0,
        }
        for e in employees
    ]


def _vendors_from_db(db: Session) -> list[dict]:
    """Load all vendors from database as list of dicts."""
    vendors = db.query(Vendor).all()
    return [
        {
            "vendor_id": v.vendor_id,
            "name": v.name,
            "registration_address": v.registration_address,
            "director_name": v.director_name,
            "settlement_account": v.settlement_account,
            "bvn": v.bvn,
            "registration_date": v.registration_date.strftime("%Y-%m-%d") if v.registration_date else None,
        }
        for v in vendors
    ]


async def run_pipeline(cycle_id: str, employees: list, vendors: list, source: str):
    """
    Core surveillance pipeline. Runs all three engines, creates Squad VAs for holds,
    persists results and alerts to database, and broadcasts WebSocket progress.
    """
    db = SessionLocal()
    try:
        # Update cycle status
        cycle = db.query(SurveillanceCycle).filter(SurveillanceCycle.cycle_id == cycle_id).first()
        if cycle:
            cycle.status = "RUNNING"
            cycle.total_employees = len(employees)
            cycle.total_vendors = len(vendors)
            db.commit()

        log_event(db, cycle_id, "ANALYSIS_START", details={
            "employees": len(employees), "vendors": len(vendors), "source": source,
        })

        await manager.broadcast({"cycle_id": cycle_id, "stage": "Starting", "progress": 10})
        await asyncio.sleep(1)

        # ── Payroll Analysis ──
        await manager.broadcast({"cycle_id": cycle_id, "stage": "Analyzing Payroll", "progress": 30})
        emp_df, emp_alerts = analyze_payroll(pd.DataFrame(employees), cycle_id)
        scored_employees = emp_df.to_dict(orient="records")

        # Persist payroll alerts
        for alert in emp_alerts:
            db.add(FraudAlert(
                cycle_id=cycle_id,
                entity_type=alert["entity_type"],
                entity_id=alert["entity_id"],
                signal_name=alert["signal_name"],
                description=alert["description"],
                severity=alert["severity"],
            ))
        db.commit()

        log_event(db, cycle_id, "PAYROLL_COMPLETE", details={
            "scored": len(scored_employees),
            "alerts": len(emp_alerts),
        })
        await asyncio.sleep(1)

        # ── Procurement Analysis ──
        await manager.broadcast({"cycle_id": cycle_id, "stage": "Analyzing Procurement", "progress": 60})
        vnd_df, vnd_alerts = analyze_procurement(pd.DataFrame(vendors), cycle_id)
        scored_vendors = vnd_df.to_dict(orient="records")

        for alert in vnd_alerts:
            db.add(FraudAlert(
                cycle_id=cycle_id,
                entity_type=alert["entity_type"],
                entity_id=alert["entity_id"],
                signal_name=alert["signal_name"],
                description=alert["description"],
                severity=alert["severity"],
            ))
        db.commit()

        log_event(db, cycle_id, "PROCUREMENT_COMPLETE", details={
            "scored": len(scored_vendors),
            "alerts": len(vnd_alerts),
        })
        await asyncio.sleep(1)

        # ── Collusion Detection ──
        await manager.broadcast({"cycle_id": cycle_id, "stage": "Detecting Collusion", "progress": 85})
        graph_elements, coll_alerts = generate_collusion_graph(emp_df, vnd_df, cycle_id)

        for alert in coll_alerts:
            db.add(FraudAlert(
                cycle_id=cycle_id,
                entity_type=alert["entity_type"],
                entity_id=alert["entity_id"],
                signal_name=alert["signal_name"],
                description=alert["description"],
                severity=alert["severity"],
            ))
        db.commit()

        log_event(db, cycle_id, "COLLUSION_COMPLETE", details={
            "graph_nodes": sum(1 for e in graph_elements if "source" not in e.get("data", {})),
            "graph_edges": sum(1 for e in graph_elements if "source" in e.get("data", {})),
            "alerts": len(coll_alerts),
        })

        all_alerts = emp_alerts + vnd_alerts + coll_alerts

        # ── Squad Interception ──
        await manager.broadcast({"cycle_id": cycle_id, "stage": "Squad Interception", "progress": 95})
        intercepted_amount = 0.0
        held_accounts = []

        for alert in all_alerts:
            if alert.get("severity") in ["HIGH", "CRITICAL"]:
                entity_id = alert["entity_id"]
                entity_type = alert["entity_type"]
                amt = 250000.0 if entity_type == "EMPLOYEE" else 4500000.0

                # Create a real Squad Virtual Account for the hold
                va_result = squad_client.create_virtual_account(
                    customer_identifier=f"AEGIS_{cycle_id}_{entity_id}",
                    business_name=f"AEGIS Hold — {entity_id}",
                )

                va_number = va_result.get("data", {}).get("virtual_account_number", "N/A")

                # Create transaction record linked to the VA
                tx = Transaction(
                    transaction_id=f"TX_{uuid.uuid4().hex[:8].upper()}",
                    type="PAYROLL" if entity_type == "EMPLOYEE" else "PROCUREMENT",
                    amount=amt,
                    status="HELD",
                    cycle_id=cycle_id,
                    aegis_score=0,
                    verdict="HOLD",
                    squad_va_number=va_number,
                    squad_tx_ref=va_result.get("data", {}).get("customer_identifier"),
                )
                db.add(tx)

                held_accounts.append({
                    "entity_id": entity_id,
                    "entity_type": entity_type,
                    "amount": amt,
                    "va_number": va_number,
                    "squad_response": va_result,
                })

                intercepted_amount += amt

                log_event(db, cycle_id, "SQUAD_VA_CREATED", entity_type=entity_type, entity_id=entity_id, details={
                    "va_number": va_number,
                    "amount": amt,
                    "simulated": va_result.get("simulated", False),
                })

        db.commit()

        # Bill audit fee
        billing = squad_client.bill_audit_fee(cycle_id, len(employees) + len(vendors))
        log_event(db, cycle_id, "SQUAD_BILLING", details=billing)

        # ── Store results ──
        summary = {
            "total_employees": len(employees),
            "total_vendors": len(vendors),
            "total_alerts": len(all_alerts),
            "critical_alerts": len([a for a in all_alerts if a.get("severity") == "CRITICAL"]),
            "high_alerts": len([a for a in all_alerts if a.get("severity") == "HIGH"]),
            "intercepted_amount": intercepted_amount,
            "held_accounts": len(held_accounts),
            "billing": billing,
        }

        if cycle:
            cycle.status = "COMPLETED"
            cycle.completed_at = datetime.utcnow()
            cycle.total_alerts = len(all_alerts)
            cycle.total_intercepted_amount = intercepted_amount
            cycle.result_employees = json.dumps(scored_employees, default=str)
            cycle.result_vendors = json.dumps(scored_vendors, default=str)
            cycle.result_graph = json.dumps(graph_elements, default=str)
            cycle.result_summary = json.dumps(summary, default=str)
            db.commit()

        log_event(db, cycle_id, "CYCLE_COMPLETE", details=summary)

        await manager.broadcast({"cycle_id": cycle_id, "stage": "Completed", "progress": 100})
        logger.info(f"Cycle {cycle_id} completed: {len(all_alerts)} alerts, ₦{intercepted_amount:,.2f} intercepted")

    except Exception as e:
        logger.error(f"Pipeline error for cycle {cycle_id}: {e}", exc_info=True)
        log_event(db, cycle_id, "ERROR", details={"error": str(e)}, severity="ERROR")

        cycle = db.query(SurveillanceCycle).filter(SurveillanceCycle.cycle_id == cycle_id).first()
        if cycle:
            cycle.status = "FAILED"
            db.commit()

        await manager.broadcast({"cycle_id": cycle_id, "stage": "Error", "message": str(e)})
    finally:
        db.close()


@router.post("/run-surveillance")
async def run_surveillance(
    background_tasks: BackgroundTasks,
    source: str = Query("auto", description="Data source: 'uploaded', 'synthetic', or 'auto'"),
    db: Session = Depends(get_db),
):
    """
    Run a full surveillance cycle.
    
    - source='uploaded': Use employee/vendor data from the database (uploaded via CSV)
    - source='synthetic': Generate fresh synthetic data with 3 planted fraud rings
    - source='auto' (default): Use uploaded data if it exists in DB, otherwise synthetic
    """
    cycle_id = f"CYC_{uuid.uuid4().hex[:8].upper()}"

    # Determine data source
    if source == "auto":
        emp_count = db.query(Employee).count()
        vnd_count = db.query(Vendor).count()
        if emp_count > 0 and vnd_count > 0:
            source = "uploaded"
            logger.info(f"Auto-detected uploaded data: {emp_count} employees, {vnd_count} vendors")
        else:
            source = "synthetic"
            logger.info("No uploaded data found, using synthetic data")

    if source == "uploaded":
        employees = _employees_from_db(db)
        vendors = _vendors_from_db(db)
        if not employees or not vendors:
            raise HTTPException(
                status_code=400,
                detail="No uploaded data found. Upload payroll and vendor CSVs first, or use source='synthetic'.",
            )
    else:
        employees, vendors = generate_synthetic_data()

    # Create cycle record
    cycle = SurveillanceCycle(
        cycle_id=cycle_id,
        status="PENDING",
        source=source.upper(),
        started_at=datetime.utcnow(),
        total_employees=len(employees),
        total_vendors=len(vendors),
    )
    db.add(cycle)
    db.commit()

    background_tasks.add_task(run_pipeline, cycle_id, employees, vendors, source)

    return {
        "cycle_id": cycle_id,
        "source": source,
        "employees": len(employees),
        "vendors": len(vendors),
    }


# ──────────────────────────────────────────────
#  Results & Squad Accounts
# ──────────────────────────────────────────────

@router.get("/results/{cycle_id}")
async def get_results(cycle_id: str, db: Session = Depends(get_db)):
    """Retrieve the full results of a completed surveillance cycle from the database."""
    cycle = db.query(SurveillanceCycle).filter(SurveillanceCycle.cycle_id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")

    if cycle.status == "RUNNING":
        return {"status": "RUNNING", "cycle_id": cycle_id, "message": "Pipeline still in progress"}

    if cycle.status == "FAILED":
        return {"status": "FAILED", "cycle_id": cycle_id}

    return {
        "status": cycle.status,
        "cycle_id": cycle_id,
        "source": cycle.source,
        "started_at": cycle.started_at.isoformat() if cycle.started_at else None,
        "completed_at": cycle.completed_at.isoformat() if cycle.completed_at else None,
        "employees": json.loads(cycle.result_employees) if cycle.result_employees else [],
        "vendors": json.loads(cycle.result_vendors) if cycle.result_vendors else [],
        "graph": json.loads(cycle.result_graph) if cycle.result_graph else {},
        "summary": json.loads(cycle.result_summary) if cycle.result_summary else {},
    }


@router.get("/squad/accounts/{cycle_id}")
async def get_squad_accounts(cycle_id: str, db: Session = Depends(get_db)):
    """Retrieve all Squad Virtual Accounts holding intercepted funds for a cycle."""
    held_txs = (
        db.query(Transaction)
        .filter(Transaction.cycle_id == cycle_id, Transaction.status.in_(["HELD", "RELEASED"]))
        .all()
    )

    held_accounts = [
        {
            "transaction_id": tx.transaction_id,
            "type": tx.type,
            "amount": tx.amount,
            "verdict": tx.verdict,
            "status": tx.status,
            "va_number": tx.squad_va_number,
            "squad_ref": tx.squad_tx_ref,
        }
        for tx in held_txs
    ]

    total = sum(tx.amount for tx in held_txs)

    return {
        "cycle_id": cycle_id,
        "held_accounts": held_accounts,
        "total_intercepted": total,
        "count": len(held_accounts),
    }


# ──────────────────────────────────────────────
#  Demo Scenario Loader
# ──────────────────────────────────────────────

@router.post("/demo/load-scenario/{n}")
async def load_scenario(n: int, db: Session = Depends(get_db)):
    """
    Load a pre-seeded demo scenario (1, 2, or 3) into the database.
    Clears existing data and seeds with scenario-specific synthetic data.
    """
    if n not in (1, 2, 3):
        raise HTTPException(status_code=400, detail="Scenario must be 1, 2, or 3")

    # Clear existing data
    db.query(Employee).delete()
    db.query(Vendor).delete()
    db.commit()

    # Generate synthetic data (same base, but we can vary the seed)
    employees, vendors = generate_synthetic_data()

    # Scenario variations:
    if n == 1:
        # "Ghost Fleet" — full dataset with all 3 fraud rings
        scenario_name = "The Ghost Fleet"
    elif n == 2:
        # "Edge Cases" — clean data + false-positive archetypes, no fraud rings
        employees, vendors, fp_explanations = generate_edge_case_data()
        scenario_name = "Edge Cases (false positive test)"
    else:
        # "Deep Network" — full fraud rings + false-positive archetypes mixed in
        from backend.services.synthetic_data import generate_false_positive_entities
        fp_emps, fp_vnds, _ = generate_false_positive_entities()
        employees.extend(fp_emps)
        vendors.extend(fp_vnds)
        scenario_name = "Deep Network (fraud + edge cases)"

    # Persist to DB
    for emp in employees:
        db.add(Employee(
            employee_id=emp["employee_id"],
            name=emp["name"],
            department=emp["department"],
            grade_level=emp["grade_level"],
            salary_account=emp["salary_account"],
            bvn=emp["bvn"],
            employment_date=pd.to_datetime(emp["employment_date"], errors="coerce"),
            has_service_record=emp.get("has_service_record", True),
            absences_ytd=emp.get("absences_ytd", 0),
        ))

    for vnd in vendors:
        db.add(Vendor(
            vendor_id=vnd["vendor_id"],
            name=vnd["name"],
            registration_address=vnd["registration_address"],
            director_name=vnd["director_name"],
            settlement_account=vnd["settlement_account"],
            bvn=vnd["bvn"],
            registration_date=pd.to_datetime(vnd["registration_date"], errors="coerce"),
        ))

    db.commit()

    log_event(db, None, "UPLOAD", entity_type="DEMO", entity_id=f"scenario_{n}", details={
        "scenario": n,
        "scenario_name": scenario_name,
        "employees": len(employees),
        "vendors": len(vendors),
    })

    return {
        "status": f"Scenario {n} loaded",
        "scenario_name": scenario_name,
        "employees": len(employees),
        "vendors": len(vendors),
    }


# ──────────────────────────────────────────────
#  PDF Report Export
# ──────────────────────────────────────────────

@router.get("/report/{cycle_id}")
async def download_report(cycle_id: str, db: Session = Depends(get_db)):
    """
    Generate and download an EFCC-formatted PDF surveillance report for a cycle.
    Returns application/pdf with Content-Disposition attachment header.
    """
    cycle = db.query(SurveillanceCycle).filter(SurveillanceCycle.cycle_id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")

    if cycle.status != "COMPLETED":
        raise HTTPException(status_code=400, detail=f"Cycle is {cycle.status}, not COMPLETED")

    employees = json.loads(cycle.result_employees) if cycle.result_employees else []
    vendors = json.loads(cycle.result_vendors) if cycle.result_vendors else []
    summary = json.loads(cycle.result_summary) if cycle.result_summary else {}
    graph_data = json.loads(cycle.result_graph) if cycle.result_graph else []

    # Extract cluster info from graph data for the report
    clusters = []
    seen_orchestrators = set()
    for el in graph_data:
        d = el.get("data", {})
        if d.get("is_orchestrator") and d.get("id") not in seen_orchestrators:
            seen_orchestrators.add(d["id"])
            clusters.append({
                "cluster_id": d.get("cluster", "RING_?"),
                "entity_count": "—",
                "is_cross_domain": True,
                "orchestrator": d.get("id", "N/A"),
                "orchestrator_betweenness": d.get("betweenness_centrality", 0),
            })

    # Fetch alerts from DB
    alerts_db = db.query(FraudAlert).filter(FraudAlert.cycle_id == cycle_id).all()
    alert_dicts = [
        {
            "entity_id": a.entity_id,
            "entity_type": a.entity_type,
            "severity": a.severity,
            "signal_name": a.signal_name,
            "description": a.description,
        }
        for a in alerts_db
    ]

    pdf_bytes = generate_cycle_pdf(
        cycle_id=cycle_id,
        status=cycle.status,
        source=cycle.source or "N/A",
        started_at=cycle.started_at.isoformat() if cycle.started_at else None,
        completed_at=cycle.completed_at.isoformat() if cycle.completed_at else None,
        employees=employees,
        vendors=vendors,
        alerts=alert_dicts,
        summary=summary,
        graph_clusters=clusters,
    )

    filename = f"AEGIS_Report_{cycle_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ──────────────────────────────────────────────
#  Data Retrieval Endpoints
# ──────────────────────────────────────────────

@router.get("/alerts/{cycle_id}")
async def get_alerts(cycle_id: str, db: Session = Depends(get_db)):
    """Retrieve all fraud alerts for a cycle."""
    alerts = db.query(FraudAlert).filter(FraudAlert.cycle_id == cycle_id).all()
    return {
        "cycle_id": cycle_id,
        "alerts": [
            {
                "cycle_id": alert.cycle_id,
                "entity_type": alert.entity_type,
                "entity_id": alert.entity_id,
                "signal_name": alert.signal_name,
                "description": alert.description,
                "severity": alert.severity,
            }
            for alert in alerts
        ],
    }


@router.get("/employees")
async def get_employees(db: Session = Depends(get_db)):
    """Retrieve all employees in the database."""
    employees = db.query(Employee).all()
    return {
        "employees": [
            {
                "employee_id": emp.employee_id,
                "name": emp.name,
                "department": emp.department,
                "grade_level": emp.grade_level,
                "salary_account": emp.salary_account,
                "bvn": emp.bvn,
                "employment_date": emp.employment_date.isoformat() if emp.employment_date else None,
                "has_service_record": emp.has_service_record,
                "absences_ytd": emp.absences_ytd or 0,
            }
            for emp in employees
        ],
    }


@router.get("/vendors")
async def get_vendors(db: Session = Depends(get_db)):
    """Retrieve all vendors in the database."""
    vendors = db.query(Vendor).all()
    return {
        "vendors": [
            {
                "vendor_id": vnd.vendor_id,
                "name": vnd.name,
                "registration_address": vnd.registration_address,
                "director_name": vnd.director_name,
                "settlement_account": vnd.settlement_account,
                "bvn": vnd.bvn,
                "registration_date": vnd.registration_date.isoformat() if vnd.registration_date else None,
            }
            for vnd in vendors
        ],
    }

@router.post("/squad/release/{transaction_id}")
async def release_squad_transaction(transaction_id: str, db: Session = Depends(get_db)):
    """Release a held transaction by updating its status in the DB."""
    # Find the transaction by either transaction_id or squad_ref since frontend uses squad_ref as entity_id
    tx = db.query(Transaction).filter(
        (Transaction.transaction_id == transaction_id) | 
        (Transaction.squad_tx_ref == transaction_id)
    ).first()
    
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    tx.status = "RELEASED"
    tx.verdict = "CLEAR"
    
    # Attempt to trigger the actual Squad Fund Transfer if configured
    try:
        # Fetch beneficiary details
        beneficiary_name = "Unknown"
        beneficiary_account = "Unknown"
        
        if tx.type == "PAYROLL":
            emp = db.query(Employee).filter(Employee.id == tx.employee_id).first()
            if emp:
                beneficiary_name = emp.name
                beneficiary_account = emp.salary_account
        else:
            vnd = db.query(Vendor).filter(Vendor.id == tx.vendor_id).first()
            if vnd:
                beneficiary_name = vnd.name
                beneficiary_account = vnd.settlement_account

        # Initiate transfer via Squad
        # Note: In a real NIP environment, bank_code would be stored in the DB.
        # For this integration, we'll use a placeholder or parse from account if possible.
        squad_resp = squad_client.initiate_transfer(
            amount_kobo=int(tx.amount * 100),
            bank_code="000000", # Squad Sandbox placeholder
            account_number=beneficiary_account,
            account_name=beneficiary_name,
            remark=f"AEGIS RELEASE: {tx.transaction_id}"
        )
        
        # Log the release event with Squad response
        log_event(
            db,
            cycle_id=tx.cycle_id,
            event_type="SQUAD_TRANSFER",
            entity_type=tx.type,
            entity_id=tx.transaction_id,
            details={
                "action": "FUNDS_RELEASED", 
                "amount": tx.amount, 
                "squad_va": tx.squad_va_number,
                "squad_transfer_id": squad_resp.get("data", {}).get("transaction_reference", "N/A"),
                "status": squad_resp.get("message", "Success")
            },
            severity="INFO",
        )
    except Exception as squad_err:
        logger.error(f"Squad transfer failed for {tx.transaction_id}: {squad_err}")
        # We still commit the DB change as the 'intent' was to release
        log_event(db, tx.cycle_id, "ERROR", entity_id=tx.transaction_id, details={"error": str(squad_err)})

    db.commit()
    
    return {"success": True, "message": "Funds released and Squad transfer initiated", "transaction_id": tx.transaction_id}

