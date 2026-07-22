from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.auth import UserResponse


class OrgSettingResponse(BaseModel):
    primary_color: str
    secondary_color: str
    allow_guest_invite: bool
    require_2fa: bool
    default_wip_limit: int
    model_config = ConfigDict(from_attributes=True)


class BillingResponse(BaseModel):
    plan_name: str
    seats_purchased: int
    seats_used: int
    billing_cycle: str
    status: str
    model_config = ConfigDict(from_attributes=True)


class OrgCreate(BaseModel):
    name: str
    slug: str
    plan: Optional[str] = "ENTERPRISE"


class OrgResponse(BaseModel):
    id: int
    name: str
    slug: str
    logo_url: Optional[str] = None
    custom_domain: Optional[str] = None
    plan: str
    is_active: bool
    created_at: datetime
    settings: Optional[OrgSettingResponse] = None
    billing: Optional[BillingResponse] = None
    model_config = ConfigDict(from_attributes=True)


class OrgMemberResponse(BaseModel):
    id: int
    organization_id: int
    user: UserResponse
    org_role: str
    is_owner: bool
    joined_at: datetime
    model_config = ConfigDict(from_attributes=True)


class InviteRequest(BaseModel):
    email: str
    org_role: str = "Employee"
