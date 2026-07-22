from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.core.database import Base


class Workspace(Base):
    """
    Workspace grouping projects and teams within an Organization.
    """
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False, index=True)
    description = Column(Text, nullable=True)
    color = Column(String(20), default="#6366F1", nullable=False)
    is_private = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="workspaces")
    permissions = relationship("WorkspacePermission", back_populates="workspace", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="workspace", cascade="all, delete-orphan")
    analytics = relationship("WorkspaceAnalytics", back_populates="workspace", uselist=False, cascade="all, delete-orphan")


class WorkspacePermission(Base):
    """
    Granular user/role permissions within a specific workspace.
    """
    __tablename__ = "workspace_permissions"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    permission_level = Column(String(50), default="VIEW_EDIT", nullable=False)  # ADMIN, VIEW_EDIT, VIEW_ONLY
    granted_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    workspace = relationship("Workspace", back_populates="permissions")


class WorkspaceAnalytics(Base):
    """
    Aggregated KPI metrics for a workspace updated periodically by Celery.
    """
    __tablename__ = "workspace_analytics"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), unique=True, nullable=False)
    total_projects = Column(Integer, default=0, nullable=False)
    completed_projects = Column(Integer, default=0, nullable=False)
    total_tasks = Column(Integer, default=0, nullable=False)
    completed_tasks = Column(Integer, default=0, nullable=False)
    overdue_tasks = Column(Integer, default=0, nullable=False)
    productivity_score = Column(Float, default=100.0, nullable=False)
    last_updated = Column(DateTime, default=datetime.utcnow, nullable=False)

    workspace = relationship("Workspace", back_populates="analytics")
