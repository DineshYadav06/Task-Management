from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class ColumnCreate(BaseModel):
    project_id: int
    name: str
    position: int
    wip_limit: Optional[int] = 0


class ColumnUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[int] = None
    wip_limit: Optional[int] = None


class BoardColumnResponse(BaseModel):
    id: int
    project_id: int
    name: str
    position: int
    wip_limit: int
    model_config = ConfigDict(from_attributes=True)


class TaskMoveRequest(BaseModel):
    task_id: int
    target_column_id: int
    target_sprint_id: Optional[int] = None
    new_position: Optional[int] = 0
