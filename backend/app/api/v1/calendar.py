from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.auth import UserModel
from app.models.task import TaskModel
from app.models.project import Milestone

router = APIRouter(prefix="/calendar", tags=["Calendar & Timeline View"])


@router.get("/events")
def get_calendar_events(
    project_id: int = Query(None),
    user_id: int = Query(None),
    start: str = Query(None, description="ISO start date bound"),
    end: str = Query(None, description="ISO end date bound"),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Retrieve formatted calendar events (Tasks + Milestones) compatible with
    FullCalendar and React Calendar.
    """
    query = db.query(TaskModel)
    if project_id:
        query = query.filter(TaskModel.project_id == project_id)
    if user_id:
        query = query.filter(TaskModel.assignee_id == user_id)
    
    tasks = query.all()
    events = []

    priority_colors = {
        "LOW": "#10B981",       # Green
        "MEDIUM": "#3B82F6",    # Blue
        "HIGH": "#F59E0B",      # Amber/Yellow
        "URGENT": "#EF4444"     # Red
    }

    for t in tasks:
        event_start = t.start_date or t.due_date or t.created_at
        event_end = t.end_date or t.due_date or event_start
        if not event_start:
            continue

        events.append({
            "id": f"task_{t.id}",
            "resourceId": str(t.project_id or "general"),
            "title": f"[{t.priority}] {t.title}",
            "start": event_start.isoformat(),
            "end": event_end.isoformat(),
            "allDay": True,
            "backgroundColor": priority_colors.get(t.priority, "#6366F1"),
            "borderColor": priority_colors.get(t.priority, "#6366F1"),
            "extendedProps": {
                "task_id": t.id,
                "status": t.status,
                "priority": t.priority,
                "story_points": t.story_points
            }
        })

    if project_id:
        milestones = db.query(Milestone).filter(Milestone.project_id == project_id).all()
        for ms in milestones:
            events.append({
                "id": f"ms_{ms.id}",
                "title": f"🏆 Milestone: {ms.title}",
                "start": ms.target_date.isoformat(),
                "allDay": True,
                "backgroundColor": "#8B5CF6",  # Purple
                "borderColor": "#7C3AED",
                "extendedProps": {
                    "is_milestone": True,
                    "milestone_id": ms.id,
                    "completed": ms.is_completed
                }
            })

    return events
