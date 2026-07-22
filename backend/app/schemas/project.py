from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.kanban import BoardColumnResponse


class MilestoneCreate(BaseModel):
    title: str
    description: Optional[str] = None
    target_date: datetime


class MilestoneResponse(BaseModel):
    id: int
    project_id: int
    title: str
    description: Optional[str] = None
    target_date: datetime
    is_completed: bool
    model_config = ConfigDict(from_attributes=True)


class RoadmapResponse(BaseModel):
    id: int
    project_id: int
    title: str
    quarter: str
    start_date: datetime
    end_date: datetime
    progress_percentage: float
    model_config = ConfigDict(from_attributes=True)


class ReleaseResponse(BaseModel):
    id: int
    project_id: int
    version_tag: str
    release_date: datetime
    status: str
    notes: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class BudgetResponse(BaseModel):
    id: int
    project_id: int
    allocated_budget: float
    spent_budget: float
    currency: str
    model_config = ConfigDict(from_attributes=True)


class RiskResponse(BaseModel):
    id: int
    project_id: int
    risk_title: str
    severity: str
    status: str
    mitigation_plan: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class HealthScoreResponse(BaseModel):
    id: int
    project_id: int
    score: float
    summary_reason: Optional[str] = None
    evaluated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ProjectCreate(BaseModel):
    workspace_id: int
    name: str
    key: str
    description: Optional[str] = None
    template_name: Optional[str] = "Agile"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class ProjectResponse(BaseModel):
    id: int
    workspace_id: int
    name: str
    key: str
    description: Optional[str] = None
    status: str
    health_score: float
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime
    columns: List[BoardColumnResponse] = []
    milestones: List[MilestoneResponse] = []
    roadmaps: List[RoadmapResponse] = []
    releases: List[ReleaseResponse] = []
    budgets: List[BudgetResponse] = []
    risks: List[RiskResponse] = []
    model_config = ConfigDict(from_attributes=True)
