from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_roles, get_current_user_optional
from app.models.auth import UserModel
from app.models.organization import Organization, OrganizationMember, OrganizationSetting, BillingInfo
from app.schemas.organization import OrgCreate, OrgResponse, OrgMemberResponse, InviteRequest
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/organizations", tags=["Organization Management"])


@router.get("", response_model=List[OrgResponse])
def list_organizations(
    current_user: Optional[UserModel] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Any:
    """List all organizations the current user is a member of."""
    if not current_user:
        return db.query(Organization).all()
    memberships = db.query(OrganizationMember).filter(OrganizationMember.user_id == current_user.id).all()
    org_ids = [m.organization_id for m in memberships]
    orgs = db.query(Organization).filter(Organization.id.in_(org_ids)).all()
    return orgs


@router.post("", response_model=OrgResponse, status_code=status.HTTP_201_CREATED)
def create_organization(
    org_in: OrgCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Create a new multi-tenant Organization and set current user as Owner."""
    if db.query(Organization).filter(Organization.slug == org_in.slug).first():
        raise HTTPException(status_code=400, detail="Organization slug already exists")

    org = Organization(name=org_in.name, slug=org_in.slug, plan=org_in.plan or "ENTERPRISE")
    db.add(org)
    db.commit()
    db.refresh(org)

    # Create Owner membership
    member = OrganizationMember(
        organization_id=org.id,
        user_id=current_user.id,
        org_role="Owner",
        is_owner=True
    )
    db.add(member)

    # Initialize default settings and billing
    setting = OrganizationSetting(organization_id=org.id)
    billing = BillingInfo(organization_id=org.id, plan_name=f"{org.plan} Plan", seats_used=1)
    db.add(setting)
    db.add(billing)
    db.commit()
    db.refresh(org)

    return org


@router.get("/{org_id}", response_model=OrgResponse)
def get_organization(
    org_id: int,
    current_user: Optional[UserModel] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Any:
    """Retrieve details for a specific organization."""
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@router.get("/{org_id}/members", response_model=List[OrgMemberResponse])
def get_org_members(
    org_id: int,
    current_user: Optional[UserModel] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Any:
    """List all members inside an organization."""
    members = db.query(OrganizationMember).filter(OrganizationMember.organization_id == org_id).all()
    return members


@router.post("/{org_id}/invite", response_model=StandardResponse[OrgMemberResponse])
def invite_user_to_org(
    org_id: int,
    invite_in: InviteRequest,
    current_user: UserModel = Depends(require_roles(["Super Admin", "Organization Owner", "Admin", "Project Manager"])),
    db: Session = Depends(get_db)
) -> Any:
    """Invite a user by email into the organization with specified role."""
    user = db.query(UserModel).filter(UserModel.email == invite_in.email).first()
    if not user:
        # For simulation, auto-register placeholder invited user if not existing
        user = UserModel(
            username=invite_in.email.split("@")[0] + "_invited",
            email=invite_in.email,
            password_hash="invited_placeholder_hash",
            full_name=invite_in.email.split("@")[0].title(),
            role=invite_in.org_role,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == org_id,
        OrganizationMember.user_id == user.id
    ).first():
        raise HTTPException(status_code=400, detail="User is already a member of this organization")

    member = OrganizationMember(
        organization_id=org_id,
        user_id=user.id,
        org_role=invite_in.org_role,
        is_owner=(invite_in.org_role == "Owner")
    )
    db.add(member)
    db.commit()
    db.refresh(member)

    return StandardResponse(
        status="success",
        message=f"Invited {invite_in.email} as {invite_in.org_role}",
        data=member
    )
