from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from backend.database import Base
from datetime import datetime


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True)
    name = Column(String)
    department = Column(String)
    grade_level = Column(String)
    salary_account = Column(String)
    bvn = Column(String, index=True)
    employment_date = Column(DateTime)
    latest_payment_date = Column(DateTime)

    # Behavioral flags
    has_service_record = Column(Boolean, default=True)
    absences_ytd = Column(Integer, default=0)

    transactions = relationship("Transaction", back_populates="employee")


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(String, unique=True, index=True)
    name = Column(String)
    registration_address = Column(String)
    director_name = Column(String)
    settlement_account = Column(String)
    bvn = Column(String, index=True)
    registration_date = Column(DateTime)

    transactions = relationship("Transaction", back_populates="vendor")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True, index=True)
    type = Column(String)  # "PAYROLL" or "PROCUREMENT"
    amount = Column(Float)
    date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="PENDING")  # PENDING, HELD, CLEARED, INTERCEPTED

    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=True)
    cycle_id = Column(String, ForeignKey("surveillance_cycles.cycle_id"), nullable=True)

    employee = relationship("Employee", back_populates="transactions")
    vendor = relationship("Vendor", back_populates="transactions")

    # AEGIS Scoring
    aegis_score = Column(Integer, nullable=True)
    verdict = Column(String, nullable=True)  # CLEAR, REVIEW, HOLD

    # Squad Integration
    squad_va_number = Column(String, nullable=True)
    squad_tx_ref = Column(String, nullable=True)


class SurveillanceCycle(Base):
    __tablename__ = "surveillance_cycles"

    id = Column(Integer, primary_key=True, index=True)
    cycle_id = Column(String, unique=True, index=True)
    status = Column(String, default="PENDING")  # PENDING, RUNNING, COMPLETED, FAILED
    source = Column(String, default="SYNTHETIC")  # UPLOADED, SYNTHETIC, DEMO

    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    total_employees = Column(Integer, default=0)
    total_vendors = Column(Integer, default=0)
    total_alerts = Column(Integer, default=0)
    total_intercepted_amount = Column(Float, default=0.0)

    # Result cache (JSON text for quick retrieval without re-querying)
    result_employees = Column(Text, nullable=True)
    result_vendors = Column(Text, nullable=True)
    result_graph = Column(Text, nullable=True)
    result_summary = Column(Text, nullable=True)

    alerts = relationship("FraudAlert", back_populates="cycle")
    audit_logs = relationship("AuditLog", back_populates="cycle")


class FraudAlert(Base):
    __tablename__ = "fraud_alerts"

    id = Column(Integer, primary_key=True, index=True)
    cycle_id = Column(String, ForeignKey("surveillance_cycles.cycle_id"), index=True)
    entity_type = Column(String)  # EMPLOYEE, VENDOR, TRANSACTION
    entity_id = Column(String)
    signal_name = Column(String)
    description = Column(String)
    severity = Column(String)  # CRITICAL, HIGH, MEDIUM, LOW
    created_at = Column(DateTime, default=datetime.utcnow)

    cycle = relationship("SurveillanceCycle", back_populates="alerts")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    cycle_id = Column(String, ForeignKey("surveillance_cycles.cycle_id"), nullable=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String)  # UPLOAD, ANALYSIS_START, PAYROLL_COMPLETE, PROCUREMENT_COMPLETE,
    # COLLUSION_COMPLETE, INTERCEPTION, SQUAD_VA_CREATED, SQUAD_TRANSFER,
    # SQUAD_BILLING, CYCLE_COMPLETE, WEBHOOK_RECEIVED, ERROR
    entity_type = Column(String, nullable=True)  # EMPLOYEE, VENDOR, TRANSACTION, CYCLE
    entity_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)  # JSON string for structured details
    severity = Column(String, default="INFO")  # INFO, WARNING, ERROR, CRITICAL

    cycle = relationship("SurveillanceCycle", back_populates="audit_logs")
