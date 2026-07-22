from datetime import datetime
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.auth import UserModel
from app.models.task import (
    TaskModel, TaskVersionHistory, Checklist, ChecklistItem,
    Comment, EmojiReaction, TaskHistory, ActivityTimeline, CustomFieldValue
)
from app.models.kanban import BoardColumn
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskResponse,
    ChecklistCreate, ChecklistResponse, ChecklistItemCreate, ChecklistItemResponse,
    CommentCreate, CommentResponse
)
from app.schemas.common import PaginatedResponse
from app.sockets.manager import socket_manager

router = APIRouter(prefix="/tasks", tags=["Task & Subtask Management"])


@router.get("", response_model=PaginatedResponse[TaskResponse])
def list_tasks(
    project_id: Optional[int] = Query(None),
    assignee_id: Optional[int] = Query(None),
    sprint_id: Optional[int] = Query(None),
    column_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    parent_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Retrieve filtered and paginated list of tasks across enterprise projects."""
    query = db.query(TaskModel)
    if project_id is not None:
        query = query.filter(TaskModel.project_id == project_id)
    if assignee_id is not None:
        query = query.filter(TaskModel.assignee_id == assignee_id)
    if sprint_id is not None:
        query = query.filter(TaskModel.sprint_id == sprint_id)
    if column_id is not None:
        query = query.filter(TaskModel.column_id == column_id)
    if status_filter is not None:
        query = query.filter(TaskModel.status == status_filter.upper())
    if parent_id is not None:
        query = query.filter(TaskModel.parent_id == parent_id)
    else:
        # By default when not querying subtasks explicitly, show top-level items or all
        pass

    total_count = query.count()
    items = query.order_by(TaskModel.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    total_pages = (total_count + page_size - 1) // page_size

    return PaginatedResponse(
        status="success",
        total_count=total_count,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        items=items
    )


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_in: TaskCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Create a new task, assign default board column if needed, and emit real-time event."""
    target_column_id = task_in.column_id
    if not target_column_id and task_in.project_id:
        first_col = db.query(BoardColumn).filter(BoardColumn.project_id == task_in.project_id).order_by(BoardColumn.position.asc()).first()
        if first_col:
            target_column_id = first_col.id

    db_task = TaskModel(
        user_id=current_user.id,
        reporter_id=current_user.id,
        assignee_id=task_in.assignee_id or current_user.id,
        project_id=task_in.project_id,
        column_id=target_column_id,
        sprint_id=task_in.sprint_id,
        parent_id=task_in.parent_id,
        title=task_in.title,
        description=task_in.description,
        priority=task_in.priority or "MEDIUM",
        severity=task_in.severity or "MINOR",
        story_points=task_in.story_points or 0,
        estimated_hours=task_in.estimated_hours or 0.0,
        due_date=task_in.due_date,
        start_date=task_in.start_date,
        end_date=task_in.end_date,
        status="TODO"
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    # Save custom field values if provided
    for cf in task_in.custom_fields:
        val = CustomFieldValue(task_id=db_task.id, field_id=cf.field_id, value_text=cf.value_text)
        db.add(val)

    # Record creation timeline & history
    timeline = ActivityTimeline(
        task_id=db_task.id,
        event_type="CREATED",
        description=f"Task created by {current_user.username}"
    )
    history = TaskHistory(
        task_id=db_task.id,
        actor_id=current_user.id,
        change_summary="Initial creation"
    )
    db.add(timeline)
    db.add(history)
    db.commit()
    db.refresh(db_task)

    # Broadcast WebSocket update
    if db_task.project_id:
        await socket_manager.broadcast_to_room(
            f"project_{db_task.project_id}",
            "task:created",
            {"task_id": db_task.id, "title": db_task.title, "column_id": db_task.column_id}
        )

    return db_task


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Retrieve full detail view of a task including comments and checklists."""
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Update task fields, track version diffs, and notify watchers."""
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_update.model_dump(exclude_unset=True)
    for field, new_val in update_data.items():
        old_val = getattr(task, field, None)
        if old_val != new_val:
            # Record version diff for key text properties
            if field in ["title", "description", "priority", "status"]:
                vh = TaskVersionHistory(
                    task_id=task.id,
                    user_id=current_user.id,
                    field_name=field,
                    old_value=str(old_val),
                    new_value=str(new_val)
                )
                db.add(vh)
                timeline = ActivityTimeline(
                    task_id=task.id,
                    event_type="UPDATED",
                    description=f"Updated {field} from {old_val} to {new_val}"
                )
                db.add(timeline)
            setattr(task, field, new_val)

    if task_update.status == "DONE" or task_update.is_completed is True:
        task.is_completed = True
        task.status = "DONE"

    db.commit()
    db.refresh(task)

    if task.project_id:
        await socket_manager.broadcast_to_room(
            f"project_{task.project_id}",
            "task:updated",
            {"task_id": task.id, "status": task.status, "column_id": task.column_id}
        )

    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> None:
    """Delete a task and its subtasks."""
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    project_id = task.project_id
    db.delete(task)
    db.commit()

    if project_id:
        await socket_manager.broadcast_to_room(f"project_{project_id}", "task:deleted", {"task_id": task_id})


@router.post("/{task_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def add_comment(
    task_id: int,
    comment_in: CommentCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Add a rich text/markdown comment on a task."""
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    comment = Comment(task_id=task_id, user_id=current_user.id, content=comment_in.content)
    db.add(comment)
    
    timeline = ActivityTimeline(
        task_id=task_id,
        event_type="COMMENTED",
        description=f"{current_user.username} commented on the task"
    )
    db.add(timeline)
    db.commit()
    db.refresh(comment)

    if task.project_id:
        await socket_manager.broadcast_to_room(
            f"project_{task.project_id}",
            "task:commented",
            {"task_id": task_id, "comment_id": comment.id, "author": current_user.username}
        )

    return comment


@router.post("/{task_id}/comments/{comment_id}/reactions", response_model=CommentResponse)
def toggle_comment_reaction(
    task_id: int,
    comment_id: int,
    emoji: str = Query(..., description="Emoji string to react or toggle"),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Toggle emoji reaction on a comment."""
    existing = db.query(EmojiReaction).filter(
        EmojiReaction.comment_id == comment_id,
        EmojiReaction.user_id == current_user.id,
        EmojiReaction.emoji == emoji
    ).first()

    if existing:
        db.delete(existing)
    else:
        db.add(EmojiReaction(comment_id=comment_id, user_id=current_user.id, emoji=emoji))

    db.commit()
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    return comment


@router.post("/{task_id}/checklists", response_model=ChecklistResponse, status_code=status.HTTP_201_CREATED)
def create_checklist(
    task_id: int,
    checklist_in: ChecklistCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Add a checklist group to a task."""
    chk = Checklist(task_id=task_id, title=checklist_in.title)
    db.add(chk)
    db.commit()
    db.refresh(chk)

    for item_in in checklist_in.items:
        item = ChecklistItem(checklist_id=chk.id, content=item_in.content, assignee_id=item_in.assignee_id)
        db.add(item)
    db.commit()
    db.refresh(chk)
    return chk
