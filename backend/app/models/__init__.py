"""
Central model exports ensuring all SQLAlchemy metadata is registered before table creation.
"""

from app.models.auth import UserModel, UserDevice, LoginHistory, AuditLog
from app.models.organization import Organization, OrganizationMember, OrganizationSetting, BillingInfo
from app.models.workspace import Workspace, WorkspacePermission, WorkspaceAnalytics
from app.models.team import Department, Team, TeamMember
from app.models.project import Project, ProjectTemplate, Milestone, Roadmap, Release, BudgetTrack, RiskTrack, ProjectHealthScore
from app.models.sprint import Sprint, SprintBacklog, BurndownData, VelocityData
from app.models.task import (
    TaskModel,
    TaskAttachment,
    TaskVersionHistory,
    Checklist,
    ChecklistItem,
    TaskDependency,
    Comment,
    EmojiReaction,
    TaskHistory,
    ActivityTimeline,
    TaskWatcher,
    CustomField,
    CustomFieldValue,
)
from app.models.kanban import BoardColumn, WIPLimit
from app.models.timetracking import TimeLog, Timesheet
from app.models.notification import Notification, EmailTemplate, FeatureFlag

__all__ = [
    "UserModel", "UserDevice", "LoginHistory", "AuditLog",
    "Organization", "OrganizationMember", "OrganizationSetting", "BillingInfo",
    "Workspace", "WorkspacePermission", "WorkspaceAnalytics",
    "Department", "Team", "TeamMember",
    "Project", "ProjectTemplate", "Milestone", "Roadmap", "Release", "BudgetTrack", "RiskTrack", "ProjectHealthScore",
    "Sprint", "SprintBacklog", "BurndownData", "VelocityData",
    "TaskModel", "TaskAttachment", "TaskVersionHistory", "Checklist", "ChecklistItem", "TaskDependency", "Comment", "EmojiReaction", "TaskHistory", "ActivityTimeline", "TaskWatcher", "CustomField", "CustomFieldValue",
    "BoardColumn", "WIPLimit",
    "TimeLog", "Timesheet",
    "Notification", "EmailTemplate", "FeatureFlag",
]
