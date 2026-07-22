"""
FastAPI Router exposing comprehensive REST CRUD endpoints for the Beanie Enterprise MongoDB Engine.
Includes status diagnostics, pagination, text search, soft delete filtering, and sample data seeder.
"""

from typing import Any, Dict, List, Optional
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.mongodb_engine.models import (
    UserDocument,
    OrganizationDocument,
    WorkspaceDocument,
    ProjectDocument,
    TaskDocument,
    ActivityLogDocument,
    AuditLogDocument,
    TaskCreateRequest,
    TaskUpdateRequest,
    TaskStatusEnum,
)
from app.mongodb_engine.repository import MongoRepository
from app.mongodb_engine.services import UserService, TaskService

mongo_router = APIRouter(prefix="/api/v2/mongo", tags=["MongoDB Enterprise Schema (Beanie ODM)"])


@mongo_router.get("/status", response_model=Dict[str, Any])
async def get_mongodb_engine_status():
    """
    Diagnostic status endpoint reporting total document counts across core enterprise collections.
    """
    user_count = await UserDocument.find(UserDocument.soft_delete == False).count()
    org_count = await OrganizationDocument.find(OrganizationDocument.soft_delete == False).count()
    workspace_count = await WorkspaceDocument.find(WorkspaceDocument.soft_delete == False).count()
    project_count = await ProjectDocument.find(ProjectDocument.soft_delete == False).count()
    task_count = await TaskDocument.find(TaskDocument.soft_delete == False).count()
    activity_count = await ActivityLogDocument.find_all().count()
    audit_count = await AuditLogDocument.find_all().count()

    return {
        "status": "ONLINE",
        "engine": "Beanie ODM v2.1.0 (Motor Async Driver)",
        "collections": {
            "users": user_count,
            "organizations": org_count,
            "workspaces": workspace_count,
            "projects": project_count,
            "tasks": task_count,
            "activity_logs": activity_count,
            "audit_logs": audit_count,
        },
        "total_active_records": user_count + org_count + workspace_count + project_count + task_count,
    }


@mongo_router.post("/seed", response_model=Dict[str, Any])
async def seed_enterprise_sample_data():
    """
    Trigger the sample data generator to seed realistic, interconnected enterprise documents
    across all 29 collections.
    """
    from app.mongodb_engine.sample_data import seed_all_collections
    stats = await seed_all_collections()
    return {
        "message": "Enterprise sample data seeded successfully across 29 collections.",
        "stats": stats,
    }


# ==========================================
# TASKS ENDPOINTS
# ==========================================

@mongo_router.post("/tasks", response_model=TaskDocument, status_code=status.HTTP_201_CREATED)
async def create_task_endpoint(
    request: TaskCreateRequest,
    creator_id: PydanticObjectId = Query(..., description="ID of the user creating the task")
):
    service = TaskService()
    return await service.create_task(request, creator_id=creator_id)


@mongo_router.get("/tasks", response_model=List[TaskDocument])
async def list_tasks_endpoint(
    project_id: Optional[PydanticObjectId] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    assignee_id: Optional[PydanticObjectId] = Query(None),
    search: Optional[str] = Query(None, description="Full-text search query across title/description"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    sort_by: str = Query("-created_at"),
    include_deleted: bool = Query(False)
):
    repo = MongoRepository(TaskDocument)
    if search:
        return await repo.search_by_text(search, skip=skip, limit=limit, include_deleted=include_deleted)

    filter_dict = {}
    if project_id:
        filter_dict["project_id"] = project_id
    if status:
        filter_dict["status"] = status
    if priority:
        filter_dict["priority"] = priority
    if assignee_id:
        filter_dict["assignee_id"] = assignee_id

    return await repo.list_paginated(
        filter_dict=filter_dict,
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        include_deleted=include_deleted
    )


@mongo_router.get("/tasks/{task_id}", response_model=TaskDocument)
async def get_task_endpoint(task_id: PydanticObjectId):
    repo = MongoRepository(TaskDocument)
    task = await repo.get_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found or soft-deleted")
    return task


@mongo_router.patch("/tasks/{task_id}", response_model=TaskDocument)
async def update_task_endpoint(
    task_id: PydanticObjectId,
    update_data: TaskUpdateRequest,
    actor_id: PydanticObjectId = Query(..., description="ID of user performing update")
):
    repo = MongoRepository(TaskDocument)
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    task = await repo.update(task_id, update_dict, actor_id=actor_id, create_audit_log=True)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@mongo_router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def soft_delete_task_endpoint(
    task_id: PydanticObjectId,
    actor_id: PydanticObjectId = Query(..., description="ID of user deleting the task")
):
    repo = MongoRepository(TaskDocument)
    success = await repo.soft_delete(task_id, actor_id=actor_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return None


# ==========================================
# USERS ENDPOINTS
# ==========================================

@mongo_router.get("/users", response_model=List[UserDocument])
async def list_users_endpoint(
    organization_id: Optional[PydanticObjectId] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    repo = MongoRepository(UserDocument)
    filter_dict = {"organization_id": organization_id} if organization_id else {}
    return await repo.list_paginated(filter_dict=filter_dict, skip=skip, limit=limit)


@mongo_router.get("/users/{user_id}", response_model=UserDocument)
async def get_user_endpoint(user_id: PydanticObjectId):
    repo = MongoRepository(UserDocument)
    user = await repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ==========================================
# ACTIVITY & AUDIT LOGS ENDPOINTS
# ==========================================

@mongo_router.get("/activity-logs", response_model=List[ActivityLogDocument])
async def list_activity_logs_endpoint(
    entity_id: Optional[PydanticObjectId] = Query(None),
    entity_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
):
    repo = MongoRepository(ActivityLogDocument)
    filter_dict = {}
    if entity_id:
        filter_dict["entity_id"] = entity_id
    if entity_type:
        filter_dict["entity_type"] = entity_type
    return await repo.list_paginated(filter_dict=filter_dict, skip=skip, limit=limit, sort_by="-timestamp", include_deleted=True)


@mongo_router.get("/audit-logs", response_model=List[AuditLogDocument])
async def list_audit_logs_endpoint(
    entity_id: Optional[PydanticObjectId] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
):
    repo = MongoRepository(AuditLogDocument)
    filter_dict = {"entity_id": entity_id} if entity_id else {}
    return await repo.list_paginated(filter_dict=filter_dict, skip=skip, limit=limit, sort_by="-updated_time", include_deleted=True)
