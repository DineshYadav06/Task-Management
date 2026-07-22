from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.auth import UserModel
from app.models.notification import Notification
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/notifications", tags=["Real-time Notifications & Alerts"])


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    link_url: str = None
    is_read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=List[NotificationResponse])
def get_user_notifications(
    unread_only: bool = False,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get chronological feed of personal notifications."""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).limit(50).all()


@router.get("/unread-count", response_model=Dict[str, int])
def get_unread_count(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, int]:
    """Get badge count of unread notifications."""
    count = db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read == False).count()
    return {"unread_count": count}


@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(
    notification_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Mark a single notification as read."""
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.post("/mark-all-read", response_model=StandardResponse)
def mark_all_as_read(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Mark all unread notifications as read for the user."""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True}, synchronize_session=False)
    db.commit()
    return StandardResponse(status="success", message="All notifications marked as read")
