"""
Top-level entrypoint proxy pointing to app.main:app.
Enables running `uvicorn main:app --reload` from `backend/` directory directly.
"""
from app.main import app

__all__ = ["app"]
