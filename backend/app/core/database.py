"""
Database configuration and session management for SQLAlchemy 2.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Create declarative base for all models
Base = declarative_base()

# Configure engine arguments based on dialect
connect_args = {}
if settings.DB_CONNECTION.startswith("sqlite"):
    connect_args["check_same_thread"] = False

# Create database engine
engine = create_engine(
    settings.DB_CONNECTION,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    connect_args=connect_args
)

# Create session factory
LocalSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """
    Dependency for getting a database session inside FastAPI route handlers.
    Ensures rollback on exceptions and automatic closure.
    """
    session = LocalSession()
    try:
        yield session
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
