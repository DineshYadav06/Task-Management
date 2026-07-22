"""
Business Service Layer for Enterprise MongoDB Engine.
Handles complex workflows: User onboarding, Project hierarchy creation, Task state transitions,
and real-time activity/notification triggers.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from beanie import PydanticObjectId
from passlib.context import CryptContext
from app.mongodb_engine.models import (
    UserDocument,
    OrganizationDocument,
    WorkspaceDocument,
    ProjectDocument,
    SprintDocument,
    MilestoneDocument,
    TaskDocument,
    SubtaskDocument,
    CommentDocument,
    ActivityLogDocument,
    NotificationDocument,
    TaskCreateRequest,
    TaskUpdateRequest,
    EntityStatus,
    TaskStatusEnum,
)
from app.mongodb_engine.repository import MongoRepository

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:
    def __init__(self):
        self.repo = MongoRepository(UserDocument)

    async def create_user(
        self,
        full_name: str,
        username: str,
        email: str,
        raw_password: str,
        organization_id: Optional[PydanticObjectId] = None,
        role_id: Optional[PydanticObjectId] = None,
    ) -> UserDocument:
        """Register a new user with bcrypt password hashing."""
        hashed_password = pwd_context.hash(raw_password)
        data = {
            "full_name": full_name,
            "username": username.lower().strip(),
            "email": email.lower().strip(),
            "password": hashed_password,
            "organization_id": organization_id,
            "role_id": role_id,
            "account_status": EntityStatus.ACTIVE.value,
            "skills": ["FastAPI", "React", "MongoDB"],
            "experience_years": 3.0,
        }
        user = await self.repo.create(data)
        return user

    async def get_by_email(self, email: str) -> Optional[UserDocument]:
        return await UserDocument.find_one(
            UserDocument.email == email.lower().strip(),
            UserDocument.soft_delete == False
        )

    async def verify_password(self, raw_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(raw_password, hashed_password)


class TaskService:
    def __init__(self):
        self.repo = MongoRepository(TaskDocument)

    async def create_task(
        self,
        request: TaskCreateRequest,
        creator_id: PydanticObjectId
    ) -> TaskDocument:
        """Create a new task, record an activity log, and dispatch a notification if assigned."""
        data = request.model_dump()
        data["reporter_id"] = creator_id
        data["status"] = TaskStatusEnum.TODO.value
        if creator_id not in data.get("watcher_ids", []):
            data.setdefault("watcher_ids", []).append(creator_id)
            
        task = await self.repo.create(data, actor_id=creator_id)

        # Record activity timeline
        await ActivityLogDocument(
            user_id=creator_id,
            action="TASK_CREATED",
            entity_type="TASK",
            entity_id=task.id,
            description=f"Created task '{task.title}' with priority {task.priority}",
            timestamp=datetime.utcnow(),
        ).insert()

        # Dispatch notification if assigned to another user
        if request.assignee_id and request.assignee_id != creator_id:
            await NotificationDocument(
                receiver_id=request.assignee_id,
                sender_id=creator_id,
                type="TASK_ASSIGNED",
                title=f"New Task Assigned: {task.title}",
                description=f"You have been assigned to task in project {request.project_id}",
                read_status=False,
                link=f"/tasks/{task.id}"
            ).insert()

        return task

    async def update_task_status(
        self,
        task_id: PydanticObjectId,
        new_status: TaskStatusEnum,
        actor_id: PydanticObjectId
    ) -> Optional[TaskDocument]:
        """Transition task status and log activity."""
        task = await self.repo.get_by_id(task_id)
        if not task:
            return None

        old_status = task.status
        task = await self.repo.update(
            task_id,
            {"status": new_status.value},
            actor_id=actor_id,
            create_audit_log=True
        )

        # Record activity
        await ActivityLogDocument(
            user_id=actor_id,
            action="TASK_STATUS_CHANGED",
            entity_type="TASK",
            entity_id=task_id,
            description=f"Changed task status from {old_status} to {new_status.value}",
            timestamp=datetime.utcnow(),
        ).insert()

        return task

    async def add_subtask(
        self,
        parent_task_id: PydanticObjectId,
        title: str,
        assignee_id: Optional[PydanticObjectId] = None,
        actor_id: Optional[PydanticObjectId] = None
    ) -> SubtaskDocument:
        """Create and link a subtask to a parent task."""
        subtask_data = {
            "parent_task_id": parent_task_id,
            "title": title,
            "assignee_id": assignee_id,
            "status": TaskStatusEnum.TODO.value,
        }
        subtask_repo = MongoRepository(SubtaskDocument)
        subtask = await subtask_repo.create(subtask_data, actor_id=actor_id)

        # Link to parent task
        parent = await self.repo.get_by_id(parent_task_id)
        if parent:
            parent.subtask_ids.append(subtask.id)
            await parent.save()

        return subtask
