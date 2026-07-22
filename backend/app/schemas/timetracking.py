from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.auth import UserResponse


class TimerStartRequest(BaseModel):
    task_id: int
    description: Optional[str] = "Working on task"
    is_billable: Optional[bool] = True


class TimerStopRequest(BaseModel):
    time_log_id: int
    end_time: Optional[datetime] = None


class ManualTimeLogCreate(BaseModel):
    task_id: int
    start_time: datetime
    end_time: datetime
    description: Optional[str] = None
    is_billable: Optional[bool] = True


class TimeLogResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_hours: float
    description: Optional[str] = None
    is_billable: bool
    is_running: bool
    user: Optional[UserResponse] = None
    model_config = ConfigDict(from_attributes=True)
