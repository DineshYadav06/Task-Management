from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.auth import UserModel
from app.models.sprint import Sprint, BurndownData, VelocityData
from app.schemas.sprint import SprintCreate, SprintUpdate, SprintResponse, BurndownPoint

router = APIRouter(prefix="/sprints", tags=["Agile Sprint & Burndown Management"])


@router.get("", response_model=List[SprintResponse])
def list_sprints(
    project_id: int = None,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """List sprints for a project."""
    query = db.query(Sprint)
    if project_id:
        query = query.filter(Sprint.project_id == project_id)
    return query.all()


@router.post("", response_model=SprintResponse, status_code=status.HTTP_201_CREATED)
def create_sprint(
    sprint_in: SprintCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Schedule a new Agile sprint."""
    sprint = Sprint(**sprint_in.model_dump())
    db.add(sprint)
    db.commit()
    db.refresh(sprint)

    # Initialize sample velocity baseline
    vel = VelocityData(sprint_id=sprint.id, committed_points=30, completed_points=0)
    db.add(vel)
    db.commit()
    db.refresh(sprint)

    return sprint


@router.put("/{sprint_id}", response_model=SprintResponse)
def update_sprint(
    sprint_id: int,
    sprint_update: SprintUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Update sprint goal or status (e.g. start or complete sprint)."""
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")

    for field, value in sprint_update.model_dump(exclude_unset=True).items():
        setattr(sprint, field, value)

    db.commit()
    db.refresh(sprint)
    return sprint


@router.get("/{sprint_id}/burndown", response_model=List[BurndownPoint])
def get_burndown_chart(
    sprint_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Fetch daily story point burndown chart data for ApexCharts/Recharts."""
    points = db.query(BurndownData).filter(BurndownData.sprint_id == sprint_id).all()
    return points
