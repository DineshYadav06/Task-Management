from datetime import datetime
from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_current_user_optional
from app.models.auth import UserModel
from app.models.timetracking import TimeLog, Timesheet
from app.models.task import TaskModel
from app.schemas.timetracking import (
    TimerStartRequest, TimerStopRequest, ManualTimeLogCreate, TimeLogResponse
)
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/timetracking", tags=["Time Tracking & Timesheet Reports"])


@router.post("/start", response_model=TimeLogResponse, status_code=status.HTTP_201_CREATED)
def start_timer(
    req: TimerStartRequest,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Start an active running time tracking stopwatch for a task."""
    running = db.query(TimeLog).filter(TimeLog.user_id == current_user.id, TimeLog.is_running == True).first()
    if running:
        raise HTTPException(status_code=400, detail=f"Timer already running on task ID {running.task_id}. Stop it first.")

    task = db.query(TaskModel).filter(TaskModel.id == req.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    log = TimeLog(
        task_id=req.task_id,
        user_id=current_user.id,
        start_time=datetime.utcnow(),
        description=req.description,
        is_billable=req.is_billable or True,
        is_running=True
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.post("/stop", response_model=TimeLogResponse)
def stop_timer(
    req: TimerStopRequest,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Stop an active running timer and record total duration in hours."""
    log = db.query(TimeLog).filter(TimeLog.id == req.time_log_id, TimeLog.user_id == current_user.id).first()
    if not log or not log.is_running:
        raise HTTPException(status_code=400, detail="Timer is not actively running")

    end_t = req.end_time or datetime.utcnow()
    log.end_time = end_t
    duration_seconds = (end_t - log.start_time).total_seconds()
    log.duration_hours = round(max(0.01, duration_seconds / 3600.0), 2)
    log.is_running = False

    # Also increment task actual_hours
    task = db.query(TaskModel).filter(TaskModel.id == log.task_id).first()
    if task:
        task.actual_hours = round((task.actual_hours or 0.0) + log.duration_hours, 2)

    db.commit()
    db.refresh(log)
    return log


@router.post("/manual", response_model=TimeLogResponse, status_code=status.HTTP_201_CREATED)
def add_manual_time_log(
    req: ManualTimeLogCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Manually log past work hours for a task."""
    duration_seconds = (req.end_time - req.start_time).total_seconds()
    if duration_seconds <= 0:
        raise HTTPException(status_code=400, detail="End time must be after start time")

    hours = round(duration_seconds / 3600.0, 2)
    log = TimeLog(
        task_id=req.task_id,
        user_id=current_user.id,
        start_time=req.start_time,
        end_time=req.end_time,
        duration_hours=hours,
        description=req.description,
        is_billable=req.is_billable or True,
        is_running=False
    )
    db.add(log)

    task = db.query(TaskModel).filter(TaskModel.id == req.task_id).first()
    if task:
        task.actual_hours = round((task.actual_hours or 0.0) + hours, 2)

    db.commit()
    db.refresh(log)
    return log


@router.get("/logs", response_model=List[TimeLogResponse])
def get_user_time_logs(
    task_id: int = Query(None),
    current_user: Optional[UserModel] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Any:
    """Get time tracking logs."""
    if not current_user:
        return []
    query = db.query(TimeLog).filter(TimeLog.user_id == current_user.id)
    if task_id:
        query = query.filter(TimeLog.task_id == task_id)
    return query.order_by(TimeLog.start_time.desc()).all()


@router.get("/timesheet", response_model=StandardResponse)
def get_weekly_timesheet(
    week_start: str = Query(..., description="ISO start date of the week"),
    current_user: Optional[UserModel] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Any:
    """Summarize user hours by task for a weekly timesheet report."""
    if not current_user:
        return StandardResponse(
            status="success",
            message="Timesheet report generated",
            data={"week_start": week_start, "total_hours": 0.0, "entries_count": 0}
        )
    logs = db.query(TimeLog).filter(
        TimeLog.user_id == current_user.id,
        TimeLog.is_running == False
    ).all()

    total_hours = sum(l.duration_hours for l in logs)
    return StandardResponse(
        status="success",
        message="Timesheet report generated",
        data={"week_start": week_start, "total_hours": round(total_hours, 2), "entries_count": len(logs)}
    )
