from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_current_user_optional
from app.models.auth import UserModel
from app.models.workspace import Workspace, WorkspacePermission, WorkspaceAnalytics
from app.schemas.workspace import WorkspaceCreate, WorkspaceResponse, WorkspaceAnalyticsResponse

router = APIRouter(prefix="/workspaces", tags=["Workspace Management"])


@router.get("", response_model=List[WorkspaceResponse])
def list_workspaces(
    org_id: int = None,
    current_user: Optional[UserModel] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Any:
    """List workspaces across organization or accessible by user."""
    query = db.query(Workspace)
    if org_id:
        query = query.filter(Workspace.organization_id == org_id)
    return query.all()


@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
def create_workspace(
    ws_in: WorkspaceCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Create a new workspace inside an organization."""
    ws = Workspace(
        organization_id=ws_in.organization_id,
        name=ws_in.name,
        description=ws_in.description,
        color=ws_in.color or "#6366F1",
        is_private=ws_in.is_private or False
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)

    perm = WorkspacePermission(workspace_id=ws.id, user_id=current_user.id, permission_level="ADMIN")
    analytics = WorkspaceAnalytics(workspace_id=ws.id)
    db.add(perm)
    db.add(analytics)
    db.commit()
    db.refresh(ws)

    return ws


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
def get_workspace(
    workspace_id: int,
    current_user: Optional[UserModel] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Any:
    """Retrieve details for a specific workspace."""
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return ws


@router.get("/{workspace_id}/analytics", response_model=WorkspaceAnalyticsResponse)
def get_workspace_analytics(
    workspace_id: int,
    current_user: Optional[UserModel] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Any:
    """Get aggregated metrics and productivity KPI for a workspace."""
    analytics = db.query(WorkspaceAnalytics).filter(WorkspaceAnalytics.workspace_id == workspace_id).first()
    if not analytics:
        raise HTTPException(status_code=404, detail="Analytics data not initialized for this workspace")
    return analytics
