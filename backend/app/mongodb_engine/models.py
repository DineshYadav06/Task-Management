"""
Enterprise Beanie Document Models and Pydantic Schemas across all 29 requested collections.
Enforces strict validation, indexing, and MongoDB document relationship mappings via ObjectId.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, EmailStr, Field, HttpUrl
from pymongo import IndexModel, ASCENDING, DESCENDING, TEXT


# ==========================================
# COMMON ENUMS & HELPER SCHEMAS
# ==========================================

class EntityStatus(str, Enum):
    ACTIVE = "ACTIVE"
    ARCHIVED = "ARCHIVED"
    DELETED = "DELETED"
    PENDING = "PENDING"
    SUSPENDED = "SUSPENDED"


class TaskPriorityEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"


class TaskStatusEnum(str, Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    IN_REVIEW = "IN_REVIEW"
    DONE = "DONE"
    BLOCKED = "BLOCKED"


class ProjectStatusEnum(str, Enum):
    PLANNING = "PLANNING"
    IN_PROGRESS = "IN_PROGRESS"
    ON_HOLD = "ON_HOLD"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class NotificationPreferencesSchema(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = True
    task_assigned: bool = True
    mention_received: bool = True
    sprint_updates: bool = True


class LoginHistoryItem(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    ip: str = "0.0.0.0"
    device: str = "Unknown Device"


class SubscriptionInfo(BaseModel):
    status: str = "ACTIVE"
    valid_until: Optional[datetime] = None
    max_users: int = 100
    max_storage_gb: int = 500


class OrganizationSettingsSchema(BaseModel):
    allow_external_guests: bool = False
    default_timezone: str = "UTC"
    enforce_sso: bool = False


class TaskDependencySchema(BaseModel):
    blocking_task_ids: List[PydanticObjectId] = Field(default_factory=list)
    blocked_by_task_ids: List[PydanticObjectId] = Field(default_factory=list)


class ChecklistItemSchema(BaseModel):
    item_id: str
    title: str
    is_completed: bool = False
    completed_at: Optional[datetime] = None


# ==========================================
# BASE DOCUMENT CLASS
# ==========================================

class BaseEnterpriseDocument(Document):
    """
    Common lifecycle attributes enforced across every collection.
    """
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[PydanticObjectId] = None
    updated_by: Optional[PydanticObjectId] = None
    soft_delete: bool = False
    status: str = Field(default=EntityStatus.ACTIVE.value)

    class Settings:
        use_state_management = True


# ==========================================
# 1. USERS COLLECTION
# ==========================================
class UserDocument(BaseEnterpriseDocument):
    full_name: str = Field(..., min_length=2, max_length=120)
    username: Indexed(str, unique=True) = Field(..., min_length=3, max_length=50)
    email: Indexed(EmailStr, unique=True)
    phone: Optional[str] = None
    password: str = Field(..., description="Hashed password strictly using bcrypt")
    profile_photo: Optional[str] = None
    bio: Optional[str] = None
    designation: Optional[str] = None
    department_id: Optional[Indexed(PydanticObjectId)] = None
    role_id: Optional[Indexed(PydanticObjectId)] = None
    organization_id: Optional[Indexed(PydanticObjectId)] = None
    workspace_ids: List[PydanticObjectId] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    experience_years: float = 0.0
    address: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    timezone: str = "UTC"
    language: str = "en-US"
    theme: str = "LIGHT"
    notification_preferences: NotificationPreferencesSchema = Field(default_factory=NotificationPreferencesSchema)
    last_login: Optional[datetime] = None
    login_history: List[LoginHistoryItem] = Field(default_factory=list)
    account_status: Indexed(str) = Field(default=EntityStatus.ACTIVE.value)
    email_verified: bool = False
    two_factor_auth_enabled: bool = False
    refresh_token: Optional[str] = None
    active_session_token: Optional[str] = None
    device_info: Optional[str] = None

    class Settings:
        name = "users"
        indexes = [
            IndexModel([("organization_id", ASCENDING), ("account_status", ASCENDING)]),
            IndexModel([("email", ASCENDING)], unique=True),
            IndexModel([("username", ASCENDING)], unique=True),
        ]


# ==========================================
# 2. ORGANIZATIONS COLLECTION
# ==========================================
class OrganizationMemberSchema(BaseModel):
    user_id: PydanticObjectId
    role_id: Optional[PydanticObjectId] = None
    joined_at: datetime = Field(default_factory=datetime.utcnow)


class OrganizationDocument(BaseEnterpriseDocument):
    organization_name: Indexed(str, unique=True) = Field(..., min_length=2, max_length=150)
    logo: Optional[str] = None
    owner_id: Indexed(PydanticObjectId)
    members: List[OrganizationMemberSchema] = Field(default_factory=list)
    billing_plan: str = "FREE"
    subscription: SubscriptionInfo = Field(default_factory=SubscriptionInfo)
    domains: List[str] = Field(default_factory=list)
    settings: OrganizationSettingsSchema = Field(default_factory=OrganizationSettingsSchema)

    class Settings:
        name = "organizations"
        indexes = [
            IndexModel([("owner_id", ASCENDING)]),
        ]


# ==========================================
# 3. WORKSPACES COLLECTION
# ==========================================
class WorkspaceMemberSchema(BaseModel):
    user_id: PydanticObjectId
    access_level: str = "MEMBER"


class WorkspaceDocument(BaseEnterpriseDocument):
    workspace_name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    organization_id: Indexed(PydanticObjectId)
    members: List[WorkspaceMemberSchema] = Field(default_factory=list)
    project_ids: List[PydanticObjectId] = Field(default_factory=list)
    team_ids: List[PydanticObjectId] = Field(default_factory=list)
    visibility: str = "ORGANIZATION"
    color: str = "#3B82F6"
    icon: str = "BriefcaseIcon"

    class Settings:
        name = "workspaces"
        indexes = [
            IndexModel([("organization_id", ASCENDING), ("workspace_name", ASCENDING)], unique=True),
            IndexModel([("organization_id", ASCENDING), ("soft_delete", ASCENDING)]),
        ]


# ==========================================
# 4. TEAMS COLLECTION
# ==========================================
class TeamDocument(BaseEnterpriseDocument):
    team_name: str = Field(..., min_length=2, max_length=100)
    organization_id: Indexed(PydanticObjectId)
    workspace_id: Optional[Indexed(PydanticObjectId)] = None
    team_lead_id: Optional[Indexed(PydanticObjectId)] = None
    member_ids: List[PydanticObjectId] = Field(default_factory=list)
    active_project_ids: List[PydanticObjectId] = Field(default_factory=list)
    department_id: Optional[Indexed(PydanticObjectId)] = None
    description: Optional[str] = None

    class Settings:
        name = "teams"
        indexes = [
            IndexModel([("organization_id", ASCENDING), ("team_name", ASCENDING)]),
        ]


# ==========================================
# 5. DEPARTMENTS COLLECTION
# ==========================================
class DepartmentDocument(BaseEnterpriseDocument):
    department_name: str = Field(..., min_length=2, max_length=100)
    organization_id: Indexed(PydanticObjectId)
    department_code: Optional[str] = None
    head_id: Optional[Indexed(PydanticObjectId)] = None
    budget_allocation: float = 0.0
    cost_center: Optional[str] = None
    description: Optional[str] = None

    class Settings:
        name = "departments"
        indexes = [
            IndexModel([("organization_id", ASCENDING), ("department_name", ASCENDING)], unique=True),
        ]


# ==========================================
# 6. ROLES COLLECTION
# ==========================================
class RoleDocument(BaseEnterpriseDocument):
    role_name: str = Field(..., min_length=2, max_length=80)
    organization_id: Indexed(PydanticObjectId)
    description: Optional[str] = None
    permission_ids: List[PydanticObjectId] = Field(default_factory=list)
    is_system_default: bool = False

    class Settings:
        name = "roles"
        indexes = [
            IndexModel([("organization_id", ASCENDING), ("role_name", ASCENDING)], unique=True),
        ]


# ==========================================
# 7. PERMISSIONS COLLECTION
# ==========================================
class PermissionDocument(BaseEnterpriseDocument):
    permission_key: Indexed(str, unique=True) = Field(..., min_length=3, max_length=100)
    module: Indexed(str)
    description: str

    class Settings:
        name = "permissions"


# ==========================================
# 8. PROJECTS COLLECTION
# ==========================================
class ProjectDocument(BaseEnterpriseDocument):
    project_name: str = Field(..., min_length=2, max_length=120)
    project_key: str = Field(..., min_length=2, max_length=10)
    organization_id: Indexed(PydanticObjectId)
    workspace_id: Indexed(PydanticObjectId)
    description: Optional[str] = None
    project_manager_id: Optional[Indexed(PydanticObjectId)] = None
    team_member_ids: List[PydanticObjectId] = Field(default_factory=list)
    client: Optional[str] = None
    priority: Indexed(str) = Field(default=TaskPriorityEnum.MEDIUM.value)
    progress: float = 0.0
    budget: float = 0.0
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    sprint_ids: List[PydanticObjectId] = Field(default_factory=list)
    milestone_ids: List[PydanticObjectId] = Field(default_factory=list)
    label_ids: List[PydanticObjectId] = Field(default_factory=list)
    tag_ids: List[PydanticObjectId] = Field(default_factory=list)
    file_ids: List[PydanticObjectId] = Field(default_factory=list)

    class Settings:
        name = "projects"
        indexes = [
            IndexModel([("organization_id", ASCENDING), ("project_key", ASCENDING)], unique=True),
            IndexModel([("workspace_id", ASCENDING), ("status", ASCENDING)]),
        ]


# ==========================================
# 9. SPRINTS COLLECTION
# ==========================================
class SprintDocument(BaseEnterpriseDocument):
    sprint_name: str = Field(..., min_length=2, max_length=100)
    project_id: Indexed(PydanticObjectId)
    goal: Optional[str] = None
    start_date: datetime
    end_date: datetime
    task_ids: List[PydanticObjectId] = Field(default_factory=list)
    completed_task_count: int = 0
    remaining_task_count: int = 0

    class Settings:
        name = "sprints"
        indexes = [
            IndexModel([("project_id", ASCENDING), ("status", ASCENDING)]),
        ]


# ==========================================
# 10. MILESTONES COLLECTION
# ==========================================
class MilestoneDocument(BaseEnterpriseDocument):
    name: str = Field(..., min_length=2, max_length=120)
    project_id: Indexed(PydanticObjectId)
    description: Optional[str] = None
    due_date: Indexed(datetime)
    progress: float = 0.0
    linked_task_ids: List[PydanticObjectId] = Field(default_factory=list)
    owner_id: Optional[Indexed(PydanticObjectId)] = None

    class Settings:
        name = "milestones"
        indexes = [
            IndexModel([("project_id", ASCENDING), ("due_date", ASCENDING)]),
        ]


# ==========================================
# 11. TASKS COLLECTION
# ==========================================
class TaskDocument(BaseEnterpriseDocument):
    title: str = Field(..., min_length=2, max_length=250)
    description: Optional[str] = None
    project_id: Indexed(PydanticObjectId)
    sprint_id: Optional[Indexed(PydanticObjectId)] = None
    milestone_id: Optional[Indexed(PydanticObjectId)] = None
    parent_task_id: Optional[Indexed(PydanticObjectId)] = None
    subtask_ids: List[PydanticObjectId] = Field(default_factory=list)
    assignee_id: Optional[Indexed(PydanticObjectId)] = None
    reporter_id: Indexed(PydanticObjectId)
    watcher_ids: List[PydanticObjectId] = Field(default_factory=list)
    follower_ids: List[PydanticObjectId] = Field(default_factory=list)
    priority: Indexed(str) = Field(default=TaskPriorityEnum.MEDIUM.value)
    labels: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    due_date: Optional[Indexed(datetime)] = None
    start_date: Optional[datetime] = None
    estimated_hours: float = 0.0
    logged_hours: float = 0.0
    progress: float = 0.0
    story_points: int = 0
    file_ids: List[PydanticObjectId] = Field(default_factory=list)
    comment_ids: List[PydanticObjectId] = Field(default_factory=list)
    dependencies: TaskDependencySchema = Field(default_factory=TaskDependencySchema)
    related_task_ids: List[PydanticObjectId] = Field(default_factory=list)
    checklist: List[ChecklistItemSchema] = Field(default_factory=list)
    calendar_event_id: Optional[PydanticObjectId] = None

    class Settings:
        name = "tasks"
        indexes = [
            IndexModel([("project_id", ASCENDING), ("status", ASCENDING), ("priority", DESCENDING)]),
            IndexModel([("assignee_id", ASCENDING), ("soft_delete", ASCENDING), ("due_date", ASCENDING)]),
            IndexModel([("title", TEXT), ("description", TEXT)]),
        ]


# ==========================================
# 12. SUBTASKS COLLECTION
# ==========================================
class SubtaskDocument(BaseEnterpriseDocument):
    parent_task_id: Indexed(PydanticObjectId)
    title: str = Field(..., min_length=2, max_length=200)
    assignee_id: Optional[Indexed(PydanticObjectId)] = None
    due_date: Optional[datetime] = None
    progress: float = 0.0

    class Settings:
        name = "subtasks"
        indexes = [
            IndexModel([("parent_task_id", ASCENDING), ("status", ASCENDING)]),
        ]


# ==========================================
# 13. COMMENTS COLLECTION
# ==========================================
class CommentDocument(BaseEnterpriseDocument):
    task_id: Indexed(PydanticObjectId)
    user_id: Indexed(PydanticObjectId)
    message: str = Field(..., min_length=1)
    mentions: List[PydanticObjectId] = Field(default_factory=list)
    attachment_ids: List[PydanticObjectId] = Field(default_factory=list)
    is_edited: bool = False

    class Settings:
        name = "comments"
        indexes = [
            IndexModel([("task_id", ASCENDING), ("created_at", ASCENDING)]),
        ]


# ==========================================
# 14. ATTACHMENTS COLLECTION
# ==========================================
class AttachmentDocument(BaseEnterpriseDocument):
    file_name: str
    file_url: str
    file_type: str
    file_size_bytes: int = 0
    uploaded_by_id: Indexed(PydanticObjectId)
    task_id: Optional[Indexed(PydanticObjectId)] = None
    project_id: Optional[Indexed(PydanticObjectId)] = None

    class Settings:
        name = "attachments"


# ==========================================
# 15. NOTIFICATIONS COLLECTION
# ==========================================
class NotificationDocument(BaseEnterpriseDocument):
    receiver_id: Indexed(PydanticObjectId)
    sender_id: Optional[PydanticObjectId] = None
    type: Indexed(str)
    title: str
    description: Optional[str] = None
    read_status: bool = False
    link: Optional[str] = None

    class Settings:
        name = "notifications"
        indexes = [
            IndexModel([("receiver_id", ASCENDING), ("read_status", ASCENDING), ("created_at", DESCENDING)]),
        ]


# ==========================================
# 16. ACTIVITY LOGS COLLECTION
# ==========================================
class ActivityLogDocument(BaseEnterpriseDocument):
    user_id: Indexed(PydanticObjectId)
    action: Indexed(str)
    entity_type: Indexed(str)
    entity_id: Indexed(PydanticObjectId)
    description: str
    timestamp: Indexed(datetime) = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = None
    device_info: Optional[str] = None

    class Settings:
        name = "activity_logs"
        indexes = [
            IndexModel([("entity_id", ASCENDING), ("entity_type", ASCENDING), ("timestamp", DESCENDING)]),
        ]


# ==========================================
# 17. AUDIT LOGS COLLECTION
# ==========================================
class AuditLogDocument(BaseEnterpriseDocument):
    entity_type: Indexed(str)
    entity_id: Indexed(PydanticObjectId)
    field_name: str
    previous_value: Optional[Any] = None
    new_value: Optional[Any] = None
    updated_by: Indexed(PydanticObjectId)
    updated_time: Indexed(datetime) = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "audit_logs"
        indexes = [
            IndexModel([("entity_id", ASCENDING), ("updated_time", DESCENDING)]),
        ]


# ==========================================
# 18. TIME TRACKING COLLECTION
# ==========================================
class TimeTrackingDocument(BaseEnterpriseDocument):
    user_id: Indexed(PydanticObjectId)
    task_id: Indexed(PydanticObjectId)
    project_id: Indexed(PydanticObjectId)
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_hours: float = 0.0
    billable_hours: float = 0.0
    is_billable: bool = True
    description: Optional[str] = None

    class Settings:
        name = "time_tracking"
        indexes = [
            IndexModel([("user_id", ASCENDING), ("start_time", DESCENDING)]),
            IndexModel([("task_id", ASCENDING)]),
        ]


# ==========================================
# 19. CALENDAR EVENTS COLLECTION
# ==========================================
class CalendarEventDocument(BaseEnterpriseDocument):
    title: str
    event_type: str = "TASK_DUE"
    task_id: Optional[Indexed(PydanticObjectId)] = None
    meeting_id: Optional[Indexed(PydanticObjectId)] = None
    participant_ids: List[PydanticObjectId] = Field(default_factory=list)
    start_time: Indexed(datetime)
    end_time: Indexed(datetime)
    is_recurring: bool = False
    recurrence_rule: Optional[str] = None

    class Settings:
        name = "calendar_events"


# ==========================================
# 20. MEETINGS COLLECTION
# ==========================================
class MeetingDocument(BaseEnterpriseDocument):
    organization_id: Indexed(PydanticObjectId)
    meeting_title: str
    organizer_id: Indexed(PydanticObjectId)
    attendee_ids: List[PydanticObjectId] = Field(default_factory=list)
    meeting_date: Indexed(datetime)
    duration_minutes: int = 60
    agenda: Optional[str] = None
    meeting_notes: Optional[str] = None
    recording_link: Optional[str] = None

    class Settings:
        name = "meetings"


# ==========================================
# 21. CHATS COLLECTION
# ==========================================
class LastMessageInfo(BaseModel):
    message_id: Optional[PydanticObjectId] = None
    sender_id: Optional[PydanticObjectId] = None
    text: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatDocument(BaseEnterpriseDocument):
    organization_id: Indexed(PydanticObjectId)
    conversation_name: Optional[str] = None
    is_group_chat: bool = False
    participant_ids: List[PydanticObjectId] = Field(default_factory=list)
    last_message: Optional[LastMessageInfo] = None

    class Settings:
        name = "chats"
        indexes = [
            IndexModel([("participant_ids", ASCENDING)]),
        ]


# ==========================================
# 22. MESSAGES COLLECTION
# ==========================================
class MessageDocument(BaseEnterpriseDocument):
    chat_id: Indexed(PydanticObjectId)
    sender_id: Indexed(PydanticObjectId)
    receiver_id: Optional[Indexed(PydanticObjectId)] = None
    message: str
    file_urls: List[str] = Field(default_factory=list)
    seen_by_user_ids: List[PydanticObjectId] = Field(default_factory=list)
    delivered_to_user_ids: List[PydanticObjectId] = Field(default_factory=list)
    timestamp: Indexed(datetime) = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "messages"
        indexes = [
            IndexModel([("chat_id", ASCENDING), ("timestamp", ASCENDING)]),
        ]


# ==========================================
# 23. LABELS COLLECTION
# ==========================================
class LabelDocument(BaseEnterpriseDocument):
    organization_id: Indexed(PydanticObjectId)
    name: str = Field(..., min_length=1, max_length=50)
    color: str = "#10B981"
    description: Optional[str] = None

    class Settings:
        name = "labels"
        indexes = [
            IndexModel([("organization_id", ASCENDING), ("name", ASCENDING)], unique=True),
        ]


# ==========================================
# 24. TAGS COLLECTION
# ==========================================
class TagDocument(BaseEnterpriseDocument):
    organization_id: Indexed(PydanticObjectId)
    name: str = Field(..., min_length=1, max_length=50)

    class Settings:
        name = "tags"
        indexes = [
            IndexModel([("organization_id", ASCENDING), ("name", ASCENDING)], unique=True),
        ]


# ==========================================
# 25. REPORTS COLLECTION
# ==========================================
class ReportDocument(BaseEnterpriseDocument):
    project_id: Indexed(PydanticObjectId)
    generated_by_id: Indexed(PydanticObjectId)
    report_type: Indexed(str)
    title: str
    pdf_url: Optional[str] = None
    excel_url: Optional[str] = None
    created_time: Indexed(datetime) = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "reports"


# ==========================================
# 26. AI HISTORY COLLECTION
# ==========================================
class AIHistoryDocument(BaseEnterpriseDocument):
    user_id: Indexed(PydanticObjectId)
    prompt: str
    response: str
    model_used: str = "gemini-1.5-pro"
    tokens_consumed: int = 0
    timestamp: Indexed(datetime) = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "ai_history"


# ==========================================
# 27. USER SESSIONS COLLECTION
# ==========================================
class UserSessionDocument(BaseEnterpriseDocument):
    user_id: Indexed(PydanticObjectId)
    device: str = "Unknown Device"
    browser: str = "Unknown Browser"
    ip_address: str = "0.0.0.0"
    login_time: Indexed(datetime) = Field(default_factory=datetime.utcnow)
    logout_time: Optional[datetime] = None
    refresh_token: Indexed(str, unique=True)
    expires_at: Indexed(datetime)
    is_active: bool = True

    class Settings:
        name = "user_sessions"


# ==========================================
# 28. SETTINGS COLLECTION
# ==========================================
class DashboardPreferences(BaseModel):
    default_view: str = "KANBAN"
    compact_density: bool = False
    favorite_project_ids: List[PydanticObjectId] = Field(default_factory=list)


class SettingDocument(BaseEnterpriseDocument):
    user_id: Optional[Indexed(PydanticObjectId)] = None
    organization_id: Optional[Indexed(PydanticObjectId)] = None
    theme: str = "DARK"
    language: str = "en-US"
    notification_settings: Dict[str, Any] = Field(default_factory=dict)
    timezone: str = "UTC"
    date_format: str = "YYYY-MM-DD"
    time_format: str = "24H"
    dashboard_preferences: DashboardPreferences = Field(default_factory=DashboardPreferences)

    class Settings:
        name = "settings"


# ==========================================
# 29. INVITATIONS COLLECTION
# ==========================================
class InvitationDocument(BaseEnterpriseDocument):
    email: Indexed(EmailStr)
    organization_id: Indexed(PydanticObjectId)
    workspace_id: Optional[PydanticObjectId] = None
    role_id: Optional[PydanticObjectId] = None
    token: Indexed(str, unique=True)
    expiry_date: Indexed(datetime)
    invited_by_id: PydanticObjectId

    class Settings:
        name = "invitations"
        indexes = [
            IndexModel([("email", ASCENDING), ("organization_id", ASCENDING)]),
        ]


# ==========================================
# PYDANTIC DTO REQUEST/RESPONSE SCHEMAS
# ==========================================

class TaskCreateRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=250)
    description: Optional[str] = None
    project_id: PydanticObjectId
    sprint_id: Optional[PydanticObjectId] = None
    milestone_id: Optional[PydanticObjectId] = None
    assignee_id: Optional[PydanticObjectId] = None
    priority: str = TaskPriorityEnum.MEDIUM.value
    labels: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    due_date: Optional[datetime] = None
    estimated_hours: float = 0.0
    story_points: int = 0


class TaskUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee_id: Optional[PydanticObjectId] = None
    due_date: Optional[datetime] = None
    logged_hours: Optional[float] = None
    progress: Optional[float] = None
