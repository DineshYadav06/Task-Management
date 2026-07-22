from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from app.core.database import Base


class Notification(Base):
    """
    Real-time notification item delivered via WebSockets and stored for notification feed.
    """
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    message = Column(String(500), nullable=False)
    notification_type = Column(String(50), default="INFO", nullable=False)  # ASSIGNMENT, COMMENT, DEADLINE, MENTION
    link_url = Column(String(300), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("UserModel", back_populates="notifications")

    __table_args__ = (
        Index("idx_notif_user_read", "user_id", "is_read"),
    )


class EmailTemplate(Base):
    """
    Admin configurable email templates with variable placeholders (`{{username}}`).
    """
    __tablename__ = "email_templates"

    id = Column(Integer, primary_key=True, index=True)
    template_key = Column(String(100), unique=True, nullable=False, index=True)  # e.g., 'TASK_ASSIGNED', 'INVITATION'
    subject = Column(String(200), nullable=False)
    html_body = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class FeatureFlag(Base):
    """
    System feature flag for canary deployments or feature toggling.
    """
    __tablename__ = "feature_flags"

    id = Column(Integer, primary_key=True, index=True)
    flag_key = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String(250), nullable=True)
    is_enabled = Column(Boolean, default=True, nullable=False)
    rollout_percentage = Column(Integer, default=100, nullable=False)
