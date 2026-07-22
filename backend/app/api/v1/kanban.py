from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_current_user_optional
from app.models.auth import UserModel
from app.models.kanban import BoardColumn
from app.models.task import TaskModel, ActivityTimeline
from app.schemas.kanban import ColumnCreate, ColumnUpdate, BoardColumnResponse, TaskMoveRequest
from app.schemas.common import StandardResponse
from app.sockets.manager import socket_manager

router = APIRouter(prefix="/kanban", tags=["Kanban Board & Drag-and-Drop Operations"])


@router.get("/columns", response_model=List[BoardColumnResponse])
def list_board_columns(
    project_id: int,
    current_user: Optional[UserModel] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Any:
    """List all Kanban columns for a project ordered by swimlane position."""
    columns = db.query(BoardColumn).filter(BoardColumn.project_id == project_id).order_by(BoardColumn.position.asc()).all()
    return columns


@router.post("/columns", response_model=BoardColumnResponse, status_code=status.HTTP_201_CREATED)
def create_board_column(
    col_in: ColumnCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Create a new Kanban board swimlane/column."""
    col = BoardColumn(**col_in.model_dump())
    db.add(col)
    db.commit()
    db.refresh(col)
    return col


@router.put("/columns/{column_id}", response_model=BoardColumnResponse)
def update_board_column(
    column_id: int,
    col_update: ColumnUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Update column name, ordering position, or WIP limit."""
    col = db.query(BoardColumn).filter(BoardColumn.id == column_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="Column not found")

    for field, value in col_update.model_dump(exclude_unset=True).items():
        setattr(col, field, value)

    db.commit()
    db.refresh(col)
    return col


@router.post("/move", response_model=StandardResponse)
async def move_task_card(
    move_req: TaskMoveRequest,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Handle drag-and-drop card movement across Kanban columns and sprints.
    Enforces WIP limits if configured and broadcasts WebSocket update.
    """
    task = db.query(TaskModel).filter(TaskModel.id == move_req.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    target_col = db.query(BoardColumn).filter(BoardColumn.id == move_req.target_column_id).first()
    if not target_col:
        raise HTTPException(status_code=404, detail="Target column not found")

    # Enforce WIP limit
    if target_col.wip_limit > 0 and task.column_id != target_col.id:
        current_wip = db.query(TaskModel).filter(TaskModel.column_id == target_col.id).count()
        if current_wip >= target_col.wip_limit:
            raise HTTPException(
                status_code=400,
                detail=f"WIP limit ({target_col.wip_limit}) reached for column '{target_col.name}'"
            )

    old_column_name = task.column.name if task.column else "Backlog"
    task.column_id = target_col.id
    if move_req.target_sprint_id is not None:
        task.sprint_id = move_req.target_sprint_id

    # Sync task status according to column name
    col_name_upper = target_col.name.upper()
    if "DONE" in col_name_upper or "COMPLETED" in col_name_upper:
        task.status = "DONE"
        task.is_completed = True
    elif "PROGRESS" in col_name_upper:
        task.status = "IN_PROGRESS"
    elif "REVIEW" in col_name_upper:
        task.status = "REVIEW"
    elif "TODO" in col_name_upper or "TO DO" in col_name_upper:
        task.status = "TODO"

    timeline = ActivityTimeline(
        task_id=task.id,
        event_type="MOVED_COLUMN",
        description=f"Moved card from {old_column_name} to {target_col.name}"
    )
    db.add(timeline)
    db.commit()

    if task.project_id:
        await socket_manager.broadcast_to_room(
            f"project_{task.project_id}",
            "task:moved",
            {
                "task_id": task.id,
                "target_column_id": target_col.id,
                "target_column_name": target_col.name,
                "status": task.status
            }
        )

    return StandardResponse(status="success", message=f"Task moved to {target_col.name}")
