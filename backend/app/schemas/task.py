from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict
from app.schemas.auth import UserResponse


class AttachmentResponse(BaseModel):
    id: int
    task_id: int
    uploader_id: Optional[int] = None
    filename: str
    file_url: str
    file_size_bytes: int
    file_type: str
    version: int
    uploaded_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ChecklistItemCreate(BaseModel):
    content: str
    assignee_id: Optional[int] = None


class ChecklistItemResponse(BaseModel):
    id: int
    checklist_id: int
    content: str
    is_completed: bool
    assignee_id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)


class ChecklistCreate(BaseModel):
    title: str = "Checklist"
    items: List[ChecklistItemCreate] = []


class ChecklistResponse(BaseModel):
    id: int
    task_id: int
    title: str
    items: List[ChecklistItemResponse] = []
    model_config = ConfigDict(from_attributes=True)


class EmojiReactionResponse(BaseModel):
    id: int
    comment_id: int
    user_id: int
    emoji: str
    model_config = ConfigDict(from_attributes=True)


class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    content: str
    created_at: datetime
    user: Optional[UserResponse] = None
    reactions: List[EmojiReactionResponse] = []
    model_config = ConfigDict(from_attributes=True)


class CustomFieldValueInput(BaseModel):
    field_id: int
    value_text: str


class CustomFieldValueResponse(BaseModel):
    id: int
    task_id: int
    field_id: int
    value_text: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: Optional[int] = None
    column_id: Optional[int] = None
    sprint_id: Optional[int] = None
    assignee_id: Optional[int] = None
    parent_id: Optional[int] = None
    priority: Optional[str] = "MEDIUM"
    severity: Optional[str] = "MINOR"
    story_points: Optional[int] = 0
    estimated_hours: Optional[float] = 0.0
    due_date: Optional[datetime] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    custom_fields: List[CustomFieldValueInput] = []


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    severity: Optional[str] = None
    story_points: Optional[int] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    assignee_id: Optional[int] = None
    column_id: Optional[int] = None
    sprint_id: Optional[int] = None
    due_date: Optional[datetime] = None
    is_completed: Optional[bool] = None


class TaskResponse(BaseModel):
    id: int
    user_id: int
    assignee_id: Optional[int] = None
    reporter_id: Optional[int] = None
    project_id: Optional[int] = None
    column_id: Optional[int] = None
    sprint_id: Optional[int] = None
    parent_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    is_completed: bool
    status: str
    priority: str
    severity: str
    story_points: int
    estimated_hours: float
    actual_hours: float
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    assignee: Optional[UserResponse] = None
    reporter: Optional[UserResponse] = None
    attachments: List[AttachmentResponse] = []
    checklists: List[ChecklistResponse] = []
    comments: List[CommentResponse] = []
    custom_field_values: List[CustomFieldValueResponse] = []
    model_config = ConfigDict(from_attributes=True)
