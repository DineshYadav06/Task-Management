from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_current_user_optional
from app.models.auth import UserModel
from app.models.task import TaskModel, Comment, TaskAttachment
from app.models.project import Project

router = APIRouter(prefix="/search", tags=["Global Enterprise Search"])


@router.get("/query", response_model=Dict[str, Any])
def global_search(
    q: str = Query(..., min_length=2, description="Search query string across tasks, projects, comments, and users"),
    current_user: Optional[UserModel] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Unified global search endpoint aggregating keyword matches across all key domain models.
    """
    search_pattern = f"%{q.lower()}%"

    # Tasks search
    tasks = db.query(TaskModel).filter(
        (TaskModel.title.ilike(search_pattern)) | (TaskModel.description.ilike(search_pattern))
    ).limit(10).all()

    # Projects search
    projects = db.query(Project).filter(
        (Project.name.ilike(search_pattern)) | (Project.key.ilike(search_pattern))
    ).limit(5).all()

    # Comments search
    comments = db.query(Comment).filter(
        Comment.content.ilike(search_pattern)
    ).limit(5).all()

    # Users search
    users = db.query(UserModel).filter(
        (UserModel.username.ilike(search_pattern)) | (UserModel.email.ilike(search_pattern)) | (UserModel.full_name.ilike(search_pattern))
    ).limit(5).all()

    return {
        "query": q,
        "results": {
            "tasks": [{"id": t.id, "title": t.title, "priority": t.priority, "status": t.status} for t in tasks],
            "projects": [{"id": p.id, "name": p.name, "key": p.key} for p in projects],
            "comments": [{"id": c.id, "task_id": c.task_id, "content_snippet": c.content[:80]} for c in comments],
            "users": [{"id": u.id, "username": u.username, "full_name": u.full_name, "avatar_url": u.avatar_url} for u in users]
        }
    }
