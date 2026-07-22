from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.core.database import Base


class Sprint(Base):
    """
    Agile Sprint model for time-boxed iterations.
    """
    __tablename__ = "sprints"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    goal = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String(50), default="PLANNED", nullable=False, index=True)  # PLANNED, ACTIVE, COMPLETED

    project = relationship("Project", back_populates="sprints")
    backlogs = relationship("SprintBacklog", back_populates="sprint", cascade="all, delete-orphan")
    burndown_points = relationship("BurndownData", back_populates="sprint", cascade="all, delete-orphan")
    velocity_metrics = relationship("VelocityData", back_populates="sprint", uselist=False, cascade="all, delete-orphan")
    tasks = relationship("TaskModel", back_populates="sprint")


class SprintBacklog(Base):
    """
    Backlog item ranking inside a sprint.
    """
    __tablename__ = "sprint_backlogs"

    id = Column(Integer, primary_key=True, index=True)
    sprint_id = Column(Integer, ForeignKey("sprints.id", ondelete="CASCADE"), nullable=False, index=True)
    task_id = Column(Integer, ForeignKey("user_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    order_rank = Column(Integer, default=1, nullable=False)

    sprint = relationship("Sprint", back_populates="backlogs")
    task = relationship("TaskModel")


class BurndownData(Base):
    """
    Daily burndown data point for charting Remaining Story Points.
    """
    __tablename__ = "burndown_data"

    id = Column(Integer, primary_key=True, index=True)
    sprint_id = Column(Integer, ForeignKey("sprints.id", ondelete="CASCADE"), nullable=False, index=True)
    date_point = Column(DateTime, nullable=False, index=True)
    remaining_story_points = Column(Integer, nullable=False)
    ideal_remaining = Column(Float, nullable=False)

    sprint = relationship("Sprint", back_populates="burndown_points")


class VelocityData(Base):
    """
    Completed vs Committed story points for sprint velocity charts.
    """
    __tablename__ = "velocity_data"

    id = Column(Integer, primary_key=True, index=True)
    sprint_id = Column(Integer, ForeignKey("sprints.id", ondelete="CASCADE"), unique=True, nullable=False)
    committed_points = Column(Integer, default=0, nullable=False)
    completed_points = Column(Integer, default=0, nullable=False)

    sprint = relationship("Sprint", back_populates="velocity_metrics")
