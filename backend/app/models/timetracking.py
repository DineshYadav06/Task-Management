from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Index
from sqlalchemy.orm import relationship
from app.core.database import Base


class TimeLog(Base):
    """
    Individual time log entry recording timer durations or manual logs.
    """
    __tablename__ = "time_logs"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("user_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=True)
    duration_hours = Column(Float, default=0.0, nullable=False)
    description = Column(String(250), nullable=True)
    is_billable = Column(Boolean, default=True, nullable=False)
    is_running = Column(Boolean, default=False, nullable=False, index=True)

    task = relationship("TaskModel")
    user = relationship("UserModel", back_populates="time_logs")

    __table_args__ = (
        Index("idx_timelog_user_running", "user_id", "is_running"),
    )


class Timesheet(Base):
    """
    Weekly summary timesheet submitted for review.
    """
    __tablename__ = "timesheets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    week_start_date = Column(DateTime, nullable=False, index=True)
    total_hours = Column(Float, default=0.0, nullable=False)
    status = Column(String(50), default="SUBMITTED", nullable=False)  # SUBMITTED, APPROVED, REJECTED
    notes = Column(Text, nullable=True)
