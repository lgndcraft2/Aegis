from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
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
    type = Column(String) # "PAYROLL" or "PROCUREMENT"
    amount = Column(Float)
    date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="PENDING") # PENDING, HELD, CLEARED, INTERCEPTED
    
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=True)
    
    employee = relationship("Employee", back_populates="transactions")
    vendor = relationship("Vendor", back_populates="transactions")
    
    # AEGIS Scoring
    aegis_score = Column(Integer, nullable=True)
    verdict = Column(String, nullable=True) # CLEAR, REVIEW, HOLD
    
class FraudAlert(Base):
    __tablename__ = "fraud_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    cycle_id = Column(String, index=True)
    entity_type = Column(String) # EMPLOYEE, VENDOR, TRANSACTION
    entity_id = Column(String)
    signal_name = Column(String)
    description = Column(String)
    severity = Column(String) # HIGH, MEDIUM, LOW
    created_at = Column(DateTime, default=datetime.utcnow)
