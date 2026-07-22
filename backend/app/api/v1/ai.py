from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.auth import UserModel
from app.models.task import TaskModel
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["AI Copilot & Smart Features"])


class TaskSummaryRequest(BaseModel):
    task_id: int


class SuggestPriorityRequest(BaseModel):
    title: str
    description: str


class GenerateDescriptionRequest(BaseModel):
    draft_notes: str


class DuplicateCheckRequest(BaseModel):
    title: str
    project_id: int = None


@router.post("/summarize-task", response_model=Dict[str, Any])
def summarize_task_endpoint(
    req: TaskSummaryRequest,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Summarize task notes and comments into executive bullet points."""
    task = db.query(TaskModel).filter(TaskModel.id == req.task_id).first()
    if not task:
        return {"summary": "Task not found", "provider": "Error"}

    comments = [c.content for c in task.comments]
    return AIService.summarize_task(task.title, task.description or "", comments)


@router.post("/suggest-priority", response_model=Dict[str, str])
def suggest_priority_endpoint(
    req: SuggestPriorityRequest,
    current_user: UserModel = Depends(get_current_user)
) -> Dict[str, str]:
    """Recommend priority and severity levels based on keyword heuristics/LLM."""
    return AIService.suggest_priority_and_severity(req.title, req.description)


@router.post("/generate-description", response_model=Dict[str, str])
def generate_description_endpoint(
    req: GenerateDescriptionRequest,
    current_user: UserModel = Depends(get_current_user)
) -> Dict[str, str]:
    """Expand rough developer notes into structured markdown task specification."""
    return AIService.generate_description(req.draft_notes)


@router.post("/detect-duplicates", response_model=Dict[str, Any])
def detect_duplicates_endpoint(
    req: DuplicateCheckRequest,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Find existing tasks with similar titles to prevent duplication."""
    query = db.query(TaskModel)
    if req.project_id:
        query = query.filter(TaskModel.project_id == req.project_id)
    existing = [{"id": t.id, "title": t.title} for t in query.all()]
    duplicates = AIService.detect_duplicates(req.title, existing)
    return {"status": "success", "potential_duplicates": duplicates}
