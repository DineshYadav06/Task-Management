from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.auth import UserModel
from app.models.team import Department, Team, TeamMember
from app.schemas.team import DepartmentCreate, DepartmentResponse, TeamCreate, TeamResponse, TeamMemberResponse

router = APIRouter(prefix="/teams", tags=["Department & Team Management"])


@router.get("/departments", response_model=List[DepartmentResponse])
def list_departments(
    org_id: int = None,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """List all departments within an organization."""
    query = db.query(Department)
    if org_id:
        query = query.filter(Department.organization_id == org_id)
    return query.all()


@router.post("/departments", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
    dept_in: DepartmentCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Create a new department."""
    dept = Department(**dept_in.model_dump())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


@router.get("", response_model=List[TeamResponse])
def list_teams(
    dept_id: int = None,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """List teams, optionally filtered by department."""
    query = db.query(Team)
    if dept_id:
        query = query.filter(Team.department_id == dept_id)
    return query.all()


@router.post("", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
def create_team(
    team_in: TeamCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Create a new team and add lead as first member."""
    team = Team(**team_in.model_dump())
    db.add(team)
    db.commit()
    db.refresh(team)

    if team_in.lead_user_id:
        member = TeamMember(team_id=team.id, user_id=team_in.lead_user_id, role_in_team="Lead")
        db.add(member)
        db.commit()
        db.refresh(team)

    return team


@router.get("/{team_id}/members", response_model=List[TeamMemberResponse])
def list_team_members(
    team_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get all members inside a team."""
    members = db.query(TeamMember).filter(TeamMember.team_id == team_id).all()
    return members
