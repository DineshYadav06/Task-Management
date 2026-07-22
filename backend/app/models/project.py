from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.core.database import Base


class Project(Base):
    """
    Project model containing tasks, sprints, milestones, roadmaps, and custom kanban columns.
    """
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False, index=True)
    key = Column(String(20), nullable=False, index=True)  # e.g., 'DEV', 'ENG'
    description = Column(Text, nullable=True)
    status = Column(String(50), default="ACTIVE", nullable=False, index=True)  # ACTIVE, ARCHIVED, ON_HOLD
    health_score = Column(Float, default=95.0, nullable=False)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    workspace = relationship("Workspace", back_populates="projects")
    sprints = relationship("Sprint", back_populates="project", cascade="all, delete-orphan")
    columns = relationship("BoardColumn", back_populates="project", cascade="all, delete-orphan")
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="project", cascade="all, delete-orphan")
    releases = relationship("Release", back_populates="project", cascade="all, delete-orphan")
    budgets = relationship("BudgetTrack", back_populates="project", cascade="all, delete-orphan")
    risks = relationship("RiskTrack", back_populates="project", cascade="all, delete-orphan")
    health_history = relationship("ProjectHealthScore", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("TaskModel", back_populates="project", cascade="all, delete-orphan")
    custom_fields = relationship("CustomField", back_populates="project", cascade="all, delete-orphan")


class ProjectTemplate(Base):
    """
    Templates for quick project creation (e.g. Scrum, Kanban, Bug Tracking).
    """
    __tablename__ = "project_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    category = Column(String(50), default="Agile", nullable=False)
    description = Column(Text, nullable=True)
    default_columns = Column(Text, nullable=True)  # JSON string of default board columns


class Milestone(Base):
    """
    Project milestone tracking significant deadlines or Phase targets.
    """
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    target_date = Column(DateTime, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)

    project = relationship("Project", back_populates="milestones")


class Roadmap(Base):
    """
    High-level roadmap initiative for strategic Gantt tracking.
    """
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    quarter = Column(String(20), default="Q1", nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    progress_percentage = Column(Float, default=0.0, nullable=False)

    project = relationship("Project", back_populates="roadmaps")


class Release(Base):
    """
    Software release or deployment target.
    """
    __tablename__ = "releases"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    version_tag = Column(String(50), nullable=False)
    release_date = Column(DateTime, nullable=False)
    status = Column(String(50), default="PLANNED", nullable=False)  # PLANNED, RELEASED, DEPRECATED
    notes = Column(Text, nullable=True)

    project = relationship("Project", back_populates="releases")


class BudgetTrack(Base):
    """
    Financial and resource budget tracking per project.
    """
    __tablename__ = "budget_tracks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    allocated_budget = Column(Float, default=0.0, nullable=False)
    spent_budget = Column(Float, default=0.0, nullable=False)
    currency = Column(String(10), default="USD", nullable=False)

    project = relationship("Project", back_populates="budgets")


class RiskTrack(Base):
    """
    Project risk register with probability and impact metrics.
    """
    __tablename__ = "risk_tracks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    risk_title = Column(String(150), nullable=False)
    severity = Column(String(50), default="MEDIUM", nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(50), default="OPEN", nullable=False)  # OPEN, MITIGATED, CLOSED
    mitigation_plan = Column(Text, nullable=True)

    project = relationship("Project", back_populates="risks")


class ProjectHealthScore(Base):
    """
    Historical AI or heuristic health evaluation record.
    """
    __tablename__ = "project_health_scores"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Float, nullable=False)
    summary_reason = Column(Text, nullable=True)
    evaluated_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    project = relationship("Project", back_populates="health_history")
