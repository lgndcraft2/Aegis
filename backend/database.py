import os
import logging
from sqlalchemy import create_engine
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("aegis.database")

# We default to postgresql, but fallback to sqlite if URL is missing for easy local testing
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aegis.db")

# If it's sqlite, we need connect_args={"check_same_thread": False}
connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db():
    """Create all tables. Called on app startup."""
    from backend import models  # noqa: F401 — ensure all models are registered
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created / verified")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
