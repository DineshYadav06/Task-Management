from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserModel(Base):
    """
    User model representing platform user accounts with RBAC roles.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(150), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    role = Column(String(50), default="Employee", nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    devices = relationship("UserDevice", back_populates="user", cascade="all, delete-orphan")
    login_history = relationship("LoginHistory", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    org_memberships = relationship("OrganizationMember", back_populates="user", cascade="all, delete-orphan")
    team_memberships = relationship("TeamMember", back_populates="user", cascade="all, delete-orphan")
    tasks_assigned = relationship("TaskModel", foreign_keys="TaskModel.assignee_id", back_populates="assignee")
    tasks_reported = relationship("TaskModel", foreign_keys="TaskModel.reporter_id", back_populates="reporter")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    time_logs = relationship("TimeLog", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_username_email_role", "username", "email", "role"),
    )


class UserDevice(Base):
    """
    Device management tracking active user sessions across mobile and web.
    """
    __tablename__ = "user_devices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    device_name = Column(String(150), nullable=False)
    device_type = Column(String(50), default="web", nullable=False)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(Text, nullable=True)
    last_active = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_trusted = Column(Boolean, default=True, nullable=False)

    user = relationship("UserModel", back_populates="devices")


class LoginHistory(Base):
    """
    Login history tracking IP addresses, device info, and login status.
    """
    __tablename__ = "login_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    ip_address = Column(String(50), nullable=True)
    device_info = Column(String(250), nullable=True)
    status = Column(String(50), default="SUCCESS", nullable=False)  # SUCCESS, FAILED
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("UserModel", back_populates="login_history")


class AuditLog(Base):
    """
    Global system audit trail recording sensitive actions across the enterprise platform.
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False, index=True)  # TASK, PROJECT, USER, ORG
    entity_id = Column(Integer, nullable=True)
    changes = Column(Text, nullable=True)  # JSON representation of changes
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("UserModel", back_populates="audit_logs")
