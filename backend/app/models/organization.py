from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.core.database import Base


class Organization(Base):
    """
    Multi-tenant Organization root entity.
    """
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    slug = Column(String(150), unique=True, nullable=False, index=True)
    logo_url = Column(String(500), nullable=True)
    custom_domain = Column(String(150), nullable=True)
    plan = Column(String(50), default="ENTERPRISE", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    members = relationship("OrganizationMember", back_populates="organization", cascade="all, delete-orphan")
    settings = relationship("OrganizationSetting", back_populates="organization", uselist=False, cascade="all, delete-orphan")
    billing = relationship("BillingInfo", back_populates="organization", uselist=False, cascade="all, delete-orphan")
    workspaces = relationship("Workspace", back_populates="organization", cascade="all, delete-orphan")
    departments = relationship("Department", back_populates="organization", cascade="all, delete-orphan")


class OrganizationMember(Base):
    """
    Association between Users and Organizations along with role within that Organization.
    """
    __tablename__ = "organization_members"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    org_role = Column(String(50), default="Employee", nullable=False)  # Owner, Admin, PM, Team Lead, Employee, Guest
    is_owner = Column(Boolean, default=False, nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    organization = relationship("Organization", back_populates="members")
    user = relationship("UserModel", back_populates="org_memberships")


class OrganizationSetting(Base):
    """
    Organization branding and policy preferences.
    """
    __tablename__ = "organization_settings"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), unique=True, nullable=False)
    primary_color = Column(String(20), default="#3B82F6", nullable=False)
    secondary_color = Column(String(20), default="#1E40AF", nullable=False)
    allow_guest_invite = Column(Boolean, default=True, nullable=False)
    require_2fa = Column(Boolean, default=False, nullable=False)
    default_wip_limit = Column(Integer, default=5, nullable=False)

    organization = relationship("Organization", back_populates="settings")


class BillingInfo(Base):
    """
    Subscription and billing status for an organization.
    """
    __tablename__ = "billing_info"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), unique=True, nullable=False)
    plan_name = Column(String(50), default="Enterprise Pro", nullable=False)
    seats_purchased = Column(Integer, default=100, nullable=False)
    seats_used = Column(Integer, default=1, nullable=False)
    billing_cycle = Column(String(20), default="ANNUAL", nullable=False)
    next_billing_date = Column(DateTime, nullable=True)
    status = Column(String(30), default="ACTIVE", nullable=False)

    organization = relationship("Organization", back_populates="billing")
