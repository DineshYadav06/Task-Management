from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class WorkspaceCreate(BaseModel):
    organization_id: int
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#6366F1"
    is_private: Optional[bool] = False


class WorkspaceAnalyticsResponse(BaseModel):
    total_projects: int
    completed_projects: int
    total_tasks: int
    completed_tasks: int
    overdue_tasks: int
    productivity_score: float
    last_updated: datetime
    model_config = ConfigDict(from_attributes=True)


class WorkspaceResponse(BaseModel):
    id: int
    organization_id: int
    name: str
    description: Optional[str] = None
    color: str
    is_private: bool
    created_at: datetime
    analytics: Optional[WorkspaceAnalyticsResponse] = None
    model_config = ConfigDict(from_attributes=True)
