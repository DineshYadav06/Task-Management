from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class BurndownPoint(BaseModel):
    date_point: datetime
    remaining_story_points: int
    ideal_remaining: float
    model_config = ConfigDict(from_attributes=True)


class VelocityMetric(BaseModel):
    committed_points: int
    completed_points: int
    model_config = ConfigDict(from_attributes=True)


class SprintCreate(BaseModel):
    project_id: int
    name: str
    goal: Optional[str] = None
    start_date: datetime
    end_date: datetime


class SprintUpdate(BaseModel):
    name: Optional[str] = None
    goal: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class SprintResponse(BaseModel):
    id: int
    project_id: int
    name: str
    goal: Optional[str] = None
    start_date: datetime
    end_date: datetime
    status: str
    burndown_points: List[BurndownPoint] = []
    velocity_metrics: Optional[VelocityMetric] = None
    model_config = ConfigDict(from_attributes=True)
