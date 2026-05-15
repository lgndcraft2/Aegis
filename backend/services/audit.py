import json
import logging
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from backend.models import AuditLog, SurveillanceCycle

logger = logging.getLogger("aegis.audit")


def log_event(
    db: Session,
    cycle_id: Optional[str],
    event_type: str,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    details: Optional[dict] = None,
    severity: str = "INFO",
) -> AuditLog:
    """
    Write a structured event to the audit log.
    
    Event types:
        UPLOAD, ANALYSIS_START, PAYROLL_COMPLETE, PROCUREMENT_COMPLETE,
        COLLUSION_COMPLETE, INTERCEPTION, SQUAD_VA_CREATED, SQUAD_TRANSFER,
        SQUAD_BILLING, CYCLE_COMPLETE, WEBHOOK_RECEIVED, ERROR
    """
    entry = AuditLog(
        cycle_id=cycle_id,
        timestamp=datetime.utcnow(),
        event_type=event_type,
        entity_type=entity_type,
        entity_id=entity_id,
        details=json.dumps(details) if details else None,
        severity=severity,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    logger.info(
        f"[{severity}] {event_type} | cycle={cycle_id} | "
        f"entity={entity_type}/{entity_id} | {details}"
    )
    return entry


def get_cycle_history(db: Session, cycle_id: str) -> list[dict]:
    """Return the ordered event timeline for a surveillance cycle."""
    logs = (
        db.query(AuditLog)
        .filter(AuditLog.cycle_id == cycle_id)
        .order_by(AuditLog.timestamp.asc())
        .all()
    )
    return [
        {
            "id": log.id,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            "event_type": log.event_type,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": json.loads(log.details) if log.details else None,
            "severity": log.severity,
        }
        for log in logs
    ]


def get_all_cycles(db: Session) -> list[dict]:
    """Return all surveillance cycles with summary stats, most recent first."""
    cycles = (
        db.query(SurveillanceCycle)
        .order_by(SurveillanceCycle.started_at.desc())
        .all()
    )
    return [
        {
            "cycle_id": c.cycle_id,
            "status": c.status,
            "source": c.source,
            "started_at": c.started_at.isoformat() if c.started_at else None,
            "completed_at": c.completed_at.isoformat() if c.completed_at else None,
            "total_employees": c.total_employees,
            "total_vendors": c.total_vendors,
            "total_alerts": c.total_alerts,
            "total_intercepted_amount": c.total_intercepted_amount,
        }
        for c in cycles
    ]
