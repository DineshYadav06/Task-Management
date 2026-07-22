from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.auth import UserResponse


class DepartmentCreate(BaseModel):
    organization_id: int
    name: str
    description: Optional[str] = None
    head_user_id: Optional[int] = None


class DepartmentResponse(BaseModel):
    id: int
    organization_id: int
    name: str
    description: Optional[str] = None
    head_user_id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)


class TeamCreate(BaseModel):
    department_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    lead_user_id: Optional[int] = None


class TeamMemberResponse(BaseModel):
    id: int
    team_id: int
    user: UserResponse
    role_in_team: str
    joined_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TeamResponse(BaseModel):
    id: int
    department_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    lead_user_id: Optional[int] = None
    created_at: datetime
    members: List[TeamMemberResponse] = []
    model_config = ConfigDict(from_attributes=True)
