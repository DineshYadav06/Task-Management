from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_current_user_optional
from app.models.auth import UserModel
from app.models.project import Project, Milestone, Roadmap, Release, BudgetTrack, RiskTrack
from app.models.kanban import BoardColumn
from app.schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectResponse,
    MilestoneCreate, MilestoneResponse, HealthScoreResponse
)
from app.services.project_health import ProjectHealthEvaluator

router = APIRouter(prefix="/projects", tags=["Project & Strategic Management"])


@router.get("", response_model=List[ProjectResponse])
def list_projects(
    workspace_id: int = None,
    current_user: Optional[UserModel] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Any:
    """List all projects across workspace or organization."""
    query = db.query(Project)
    if workspace_id:
        query = query.filter(Project.workspace_id == workspace_id)
    return query.all()


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    proj_in: ProjectCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Create a new project and initialize default Kanban columns based on chosen template."""
    if db.query(Project).filter(Project.workspace_id == proj_in.workspace_id, Project.key == proj_in.key).first():
        raise HTTPException(status_code=400, detail="Project key already exists in this workspace")

    proj = Project(
        workspace_id=proj_in.workspace_id,
        name=proj_in.name,
        key=proj_in.key.upper(),
        description=proj_in.description,
        start_date=proj_in.start_date,
        end_date=proj_in.end_date
    )
    db.add(proj)
    db.commit()
    db.refresh(proj)

    # Initialize default Agile/Scrum columns automatically
    default_columns = ["Backlog", "To Do", "In Progress", "Code Review", "Done"]
    for i, col_name in enumerate(default_columns, 1):
        col = BoardColumn(project_id=proj.id, name=col_name, position=i, wip_limit=5 if col_name == "In Progress" else 0)
        db.add(col)

    # Initialize budget and risk placeholder tracks
    db.add(BudgetTrack(project_id=proj.id, allocated_budget=50000.0, currency="USD"))
    db.commit()
    db.refresh(proj)

    return proj


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    current_user: Optional[UserModel] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Any:
    """Retrieve comprehensive project details including columns and milestones."""
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return proj


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    proj_update: ProjectUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Update project status or metadata."""
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    for field, value in proj_update.model_dump(exclude_unset=True).items():
        setattr(proj, field, value)

    db.commit()
    db.refresh(proj)
    return proj


@router.get("/{project_id}/health", response_model=HealthScoreResponse)
def get_or_evaluate_project_health(
    project_id: int,
    current_user: Optional[UserModel] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Any:
    """Evaluate or fetch live heuristic & AI health score for a project."""
    eval_result = ProjectHealthEvaluator.evaluate(db, project_id)
    return {
        "id": 1,
        "project_id": project_id,
        "score": eval_result["score"],
        "summary_reason": eval_result["summary_reason"],
        "evaluated_at": eval_result["evaluated_at"]
    }


@router.post("/{project_id}/milestones", response_model=MilestoneResponse, status_code=status.HTTP_201_CREATED)
def create_milestone(
    project_id: int,
    ms_in: MilestoneCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Add a new target deadline milestone to a project."""
    ms = Milestone(project_id=project_id, **ms_in.model_dump())
    db.add(ms)
    db.commit()
    db.refresh(ms)
    return ms
