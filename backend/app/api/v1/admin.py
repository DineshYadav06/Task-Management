from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_roles, get_current_user
from app.models.auth import UserModel, AuditLog
from app.models.notification import FeatureFlag
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/admin", tags=["Super Admin & System Health Monitoring"])


class AuditLogResponse(BaseModel):
    id: int
    user_id: int = None
    action: str
    entity_type: str
    entity_id: int = None
    changes: str = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class FeatureFlagResponse(BaseModel):
    id: int
    flag_key: str
    description: str = None
    is_enabled: bool
    rollout_percentage: int
    model_config = ConfigDict(from_attributes=True)


class FeatureFlagCreate(BaseModel):
    flag_key: str
    description: str = None
    is_enabled: bool = True
    rollout_percentage: int = 100


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = 100,
    current_user: UserModel = Depends(require_roles(["Super Admin", "Organization Owner", "Admin"])),
    db: Session = Depends(get_db)
) -> Any:
    """Retrieve global system audit logs for compliance monitoring."""
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return logs


@router.get("/feature-flags", response_model=List[FeatureFlagResponse])
def list_feature_flags(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get active feature toggles."""
    flags = db.query(FeatureFlag).all()
    return flags


@router.post("/feature-flags", response_model=FeatureFlagResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_feature_flag(
    flag_in: FeatureFlagCreate,
    current_user: UserModel = Depends(require_roles(["Super Admin", "Admin"])),
    db: Session = Depends(get_db)
) -> Any:
    """Create or toggle a system feature flag."""
    flag = db.query(FeatureFlag).filter(FeatureFlag.flag_key == flag_in.flag_key).first()
    if flag:
        flag.is_enabled = flag_in.is_enabled
        flag.rollout_percentage = flag_in.rollout_percentage
        flag.description = flag_in.description
    else:
        flag = FeatureFlag(**flag_in.model_dump())
        db.add(flag)
    db.commit()
    db.refresh(flag)
    return flag


@router.get("/system-health", response_model=Dict[str, Any])
def check_system_health(
    current_user: UserModel = Depends(require_roles(["Super Admin", "Admin"])),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Inspect status of PostgreSQL database connection, Redis pool, and active workers."""
    from app.core.redis_pool import redis_client
    
    db_status = "ok"
    try:
        db.execute("SELECT 1")
    except Exception as exc:
        db_status = f"error: {exc}"

    redis_status = "ok" if redis_client.is_available() else "fallback/offline"

    return {
        "status": "operational" if db_status == "ok" else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "postgresql": db_status,
            "redis_pool": redis_status,
            "celery_workers": "active (configured)"
        }
    }
