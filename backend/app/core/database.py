"""
Database configuration and session management for SQLAlchemy 2.
"""

from sqlalchemy import create_engine, event
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


@event.listens_for(LocalSession, "before_commit")
def before_commit_listener(session):
    session._changes = {
        "new": list(session.new),
        "dirty": list(session.dirty),
        "deleted": list(session.deleted)
    }

@event.listens_for(LocalSession, "after_commit")
def after_commit_listener(session):
    """Automatically sync newly inserted, modified, or deleted models to MongoDB Atlas."""
    try:
        from app.core.mongodb import mongodb_manager
        if not mongodb_manager.is_connected:
            return
            
        changes = getattr(session, "_changes", None)
        if not changes:
            return
            
        for obj in changes["new"]:
            try:
                mongodb_manager.save_model_to_mongodb(obj)
            except Exception:
                pass
        for obj in changes["dirty"]:
            try:
                mongodb_manager.save_model_to_mongodb(obj)
            except Exception:
                pass
        for obj in changes["deleted"]:
            try:
                mongodb_manager.delete_model_from_mongodb(obj)
            except Exception:
                pass
    except Exception:
        pass


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
