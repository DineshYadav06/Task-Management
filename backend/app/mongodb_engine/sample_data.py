"""
Enterprise Sample Data Generator / Seeder across all 29 MongoDB Collections.
Inserts realistic, highly interconnected records into Beanie models.
"""

from datetime import datetime, timedelta
from typing import Dict, Any
from beanie import PydanticObjectId
from passlib.context import CryptContext
from app.mongodb_engine.models import (
    UserDocument,
    OrganizationDocument,
    WorkspaceDocument,
    TeamDocument,
    DepartmentDocument,
    RoleDocument,
    PermissionDocument,
    ProjectDocument,
    SprintDocument,
    MilestoneDocument,
    TaskDocument,
    SubtaskDocument,
    CommentDocument,
    AttachmentDocument,
    NotificationDocument,
    ActivityLogDocument,
    AuditLogDocument,
    TimeTrackingDocument,
    CalendarEventDocument,
    MeetingDocument,
    ChatDocument,
    MessageDocument,
    LabelDocument,
    TagDocument,
    ReportDocument,
    AIHistoryDocument,
    UserSessionDocument,
    SettingDocument,
    InvitationDocument,
    EntityStatus,
    TaskPriorityEnum,
    TaskStatusEnum,
    NotificationPreferencesSchema,
    LoginHistoryItem,
    SubscriptionInfo,
    OrganizationMemberSchema,
    WorkspaceMemberSchema,
    TaskDependencySchema,
    ChecklistItemSchema,
    LastMessageInfo,
    DashboardPreferences,
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed_all_collections() -> Dict[str, int]:
    """
    Clears existing enterprise test documents if present and seeds interconnected
    sample records across all 29 collections.
    Returns count of documents inserted per collection.
    """
    now = datetime.utcnow()
    hashed_pass = pwd_context.hash("EnterpriseDemo2026!")

    # Generate fixed ObjectIds so relationships link precisely
    user_id_1 = PydanticObjectId()
    user_id_2 = PydanticObjectId()
    org_id = PydanticObjectId()
    workspace_id = PydanticObjectId()
    team_id = PydanticObjectId()
    dept_id = PydanticObjectId()
    role_id = PydanticObjectId()
    perm_id = PydanticObjectId()
    project_id = PydanticObjectId()
    sprint_id = PydanticObjectId()
    milestone_id = PydanticObjectId()
    task_id = PydanticObjectId()
    subtask_id = PydanticObjectId()
    comment_id = PydanticObjectId()
    attach_id = PydanticObjectId()
    notif_id = PydanticObjectId()
    activity_id = PydanticObjectId()
    audit_id = PydanticObjectId()
    time_id = PydanticObjectId()
    cal_id = PydanticObjectId()
    meeting_id = PydanticObjectId()
    chat_id = PydanticObjectId()
    msg_id = PydanticObjectId()
    label_id = PydanticObjectId()
    tag_id = PydanticObjectId()
    report_id = PydanticObjectId()
    ai_id = PydanticObjectId()
    session_id = PydanticObjectId()
    setting_id = PydanticObjectId()
    inv_id = PydanticObjectId()

    # Clear previous seeded documents if unique conflict exists
    await UserDocument.find(UserDocument.email.in_(["dinesh.enterprise@example.com", "sarah.lead@example.com"])).delete()
    await OrganizationDocument.find(OrganizationDocument.organization_name == "Dinesh Enterprise Cloud Solutions").delete()
    await WorkspaceDocument.find(WorkspaceDocument.workspace_name == "Core Engineering & AI Systems").delete()
    await ProjectDocument.find(ProjectDocument.project_key == "ENG").delete()

    # 1. PERMISSIONS
    perm = PermissionDocument(
        id=perm_id,
        permission_key="ALL_ACCESS",
        module="SYSTEM_ADMIN",
        description="Full administrative access across all modules and collections."
    )
    await perm.insert()

    # 2. ROLES
    role = RoleDocument(
        id=role_id,
        role_name="Organization Owner & Admin",
        organization_id=org_id,
        description="Top-level organization administrator with billing and security rights.",
        permission_ids=[perm_id],
        is_system_default=True
    )
    await role.insert()

    # 3. DEPARTMENTS
    dept = DepartmentDocument(
        id=dept_id,
        department_name="Cloud Infrastructure & Engineering",
        department_code="ENG-CLOUD",
        organization_id=org_id,
        head_id=user_id_1,
        budget_allocation=1500000.0,
        cost_center="CC-8921",
        description="Responsible for core backend scalable platforms and databases."
    )
    await dept.insert()

    # 4. USERS
    user1 = UserDocument(
        id=user_id_1,
        full_name="Dinesh Kumar Yadav",
        username="dineshyadav_enter",
        email="dinesh.enterprise@example.com",
        phone="+91 9876543210",
        password=hashed_pass,
        profile_photo="https://cdn.example.com/avatars/dinesh.png",
        bio="Principal Enterprise Architect & Tech Lead",
        designation="Staff Software Engineer",
        department_id=dept_id,
        role_id=role_id,
        organization_id=org_id,
        workspace_ids=[workspace_id],
        skills=["FastAPI", "Beanie", "MongoDB", "React 19", "Docker"],
        experience_years=8.5,
        address="Tech Park 4, Phase 2",
        country="India",
        state="Karnataka",
        city="Bangalore",
        timezone="Asia/Kolkata",
        notification_preferences=NotificationPreferencesSchema(),
        login_history=[LoginHistoryItem(timestamp=now, ip="192.168.1.100", device="Windows 11 PC / Chrome")],
        account_status=EntityStatus.ACTIVE.value,
        email_verified=True,
        two_factor_auth_enabled=True,
    )
    await user1.insert()

    user2 = UserDocument(
        id=user_id_2,
        full_name="Sarah Connor",
        username="sarah_lead",
        email="sarah.lead@example.com",
        password=hashed_pass,
        designation="Senior Frontend Engineer",
        organization_id=org_id,
        workspace_ids=[workspace_id],
        skills=["React 19", "TypeScript", "TailwindCSS"],
        experience_years=5.0,
        account_status=EntityStatus.ACTIVE.value,
        email_verified=True,
    )
    await user2.insert()

    # 5. ORGANIZATIONS
    org = OrganizationDocument(
        id=org_id,
        organization_name="Dinesh Enterprise Cloud Solutions",
        logo="https://cdn.example.com/logos/enterprise-cloud.png",
        owner_id=user_id_1,
        members=[
            OrganizationMemberSchema(user_id=user_id_1, role_id=role_id, joined_at=now),
            OrganizationMemberSchema(user_id=user_id_2, joined_at=now)
        ],
        billing_plan="ENTERPRISE_UNLIMITED",
        subscription=SubscriptionInfo(status="ACTIVE", valid_until=now + timedelta(days=365), max_users=10000, max_storage_gb=50000),
        domains=["dineshcloud.com", "taskops.internal"],
        created_by=user_id_1
    )
    await org.insert()

    # 6. WORKSPACES
    workspace = WorkspaceDocument(
        id=workspace_id,
        workspace_name="Core Engineering & AI Systems",
        description="Primary workspace for backend scaling, machine learning pipelines, and React frontend delivery.",
        organization_id=org_id,
        members=[
            WorkspaceMemberSchema(user_id=user_id_1, access_level="ADMIN"),
            WorkspaceMemberSchema(user_id=user_id_2, access_level="MEMBER")
        ],
        project_ids=[project_id],
        team_ids=[team_id],
        visibility="ORGANIZATION",
        created_by=user_id_1
    )
    await workspace.insert()

    # 7. TEAMS
    team = TeamDocument(
        id=team_id,
        team_name="Tiger Team Alpha",
        organization_id=org_id,
        workspace_id=workspace_id,
        team_lead_id=user_id_1,
        member_ids=[user_id_1, user_id_2],
        active_project_ids=[project_id],
        department_id=dept_id,
        description="Cross-functional squad focused on high-availability MongoDB schema design."
    )
    await team.insert()

    # 8. LABELS
    label = LabelDocument(
        id=label_id,
        organization_id=org_id,
        name="MongoDB-Beanie",
        color="#10B981",
        description="Tasks directly involving MongoDB / Beanie async ODM architecture."
    )
    await label.insert()

    # 9. TAGS
    tag = TagDocument(
        id=tag_id,
        organization_id=org_id,
        name="enterprise-schema"
    )
    await tag.insert()

    # 10. PROJECTS
    project = ProjectDocument(
        id=project_id,
        project_name="Task-Management Enterprise Platform",
        project_key="ENG",
        organization_id=org_id,
        workspace_id=workspace_id,
        description="Next-generation multi-tenant SaaS task tracking tool built on FastAPI, Beanie, and React 19.",
        project_manager_id=user_id_1,
        team_member_ids=[user_id_1, user_id_2],
        client="Internal Enterprise Product",
        priority=TaskPriorityEnum.HIGH.value,
        status="IN_PROGRESS",
        progress=85.0,
        budget=250000.0,
        start_date=now - timedelta(days=30),
        end_date=now + timedelta(days=60),
        sprint_ids=[sprint_id],
        milestone_ids=[milestone_id],
        label_ids=[label_id],
        tag_ids=[tag_id],
        created_by=user_id_1
    )
    await project.insert()

    # 11. SPRINTS
    sprint = SprintDocument(
        id=sprint_id,
        sprint_name="Sprint 14: MongoDB Schema Transformation & Beanie Integration",
        project_id=project_id,
        goal="Migrate all persistence models to production-grade MongoDB async ODM with zero data loss.",
        start_date=now - timedelta(days=7),
        end_date=now + timedelta(days=7),
        task_ids=[task_id],
        completed_task_count=18,
        remaining_task_count=3
    )
    await sprint.insert()

    # 12. MILESTONES
    milestone = MilestoneDocument(
        id=milestone_id,
        name="Beta Release 2.0: Pure MongoDB Enterprise Architecture",
        project_id=project_id,
        description="Complete cutover to MongoDB Atlas across all 29 collections.",
        due_date=now + timedelta(days=14),
        progress=90.0,
        linked_task_ids=[task_id],
        owner_id=user_id_1
    )
    await milestone.insert()

    # 13. CALENDAR EVENTS
    cal_event = CalendarEventDocument(
        id=cal_id,
        title="Task Deadline: ENG-101 Architectural Review",
        event_type="TASK_DUE",
        task_id=task_id,
        participant_ids=[user_id_1, user_id_2],
        start_time=now + timedelta(hours=24),
        end_time=now + timedelta(hours=25),
        is_recurring=False
    )
    await cal_event.insert()

    # 14. TASKS
    task = TaskDocument(
        id=task_id,
        title="Design Complete MongoDB Database Schema for Enterprise Task Management System",
        description="Implement 29 MongoDB collections with strict Pydantic validation, Beanie ODM models, and comprehensive CRUD REST APIs.",
        project_id=project_id,
        sprint_id=sprint_id,
        milestone_id=milestone_id,
        subtask_ids=[subtask_id],
        assignee_id=user_id_1,
        reporter_id=user_id_1,
        watcher_ids=[user_id_1, user_id_2],
        follower_ids=[user_id_1, user_id_2],
        priority=TaskPriorityEnum.URGENT.value,
        status=TaskStatusEnum.IN_PROGRESS.value,
        labels=["MongoDB-Beanie"],
        tags=["enterprise-schema"],
        start_date=now - timedelta(days=1),
        due_date=now + timedelta(days=1),
        estimated_hours=16.0,
        logged_hours=12.5,
        progress=80.0,
        story_points=13,
        file_ids=[attach_id],
        comment_ids=[comment_id],
        dependencies=TaskDependencySchema(blocking_task_ids=[], blocked_by_task_ids=[]),
        checklist=[
            ChecklistItemSchema(item_id="chk_1", title="Create Pydantic and Beanie models across 29 collections", is_completed=True, completed_at=now),
            ChecklistItemSchema(item_id="chk_2", title="Build FastAPI generic and specialized CRUD repository endpoints", is_completed=False)
        ],
        calendar_event_id=cal_id,
        created_by=user_id_1
    )
    await task.insert()

    # 15. SUBTASKS
    subtask = SubtaskDocument(
        id=subtask_id,
        parent_task_id=task_id,
        title="Configure Beanie Document and Indexed field attributes",
        assignee_id=user_id_1,
        status=TaskStatusEnum.DONE.value,
        due_date=now,
        progress=100.0,
        created_by=user_id_1
    )
    await subtask.insert()

    # 16. ATTACHMENTS
    attach = AttachmentDocument(
        id=attach_id,
        file_name="mongodb_architecture_spec.pdf",
        file_url="https://s3.amazonaws.com/task-management-enterprise/attachments/mongodb_architecture_spec.pdf",
        file_type="application/pdf",
        file_size_bytes=2458112,
        uploaded_by_id=user_id_1,
        task_id=task_id,
        project_id=project_id,
        created_by=user_id_1
    )
    await attach.insert()

    # 17. COMMENTS
    comment = CommentDocument(
        id=comment_id,
        task_id=task_id,
        user_id=user_id_1,
        message="We have successfully installed `beanie` (v2.1.0) and `pymongo` (v4.17.0). Now structuring the repository layer!",
        mentions=[user_id_2],
        attachment_ids=[attach_id],
        created_by=user_id_1
    )
    await comment.insert()

    # 18. NOTIFICATIONS
    notif = NotificationDocument(
        id=notif_id,
        receiver_id=user_id_2,
        sender_id=user_id_1,
        type="TASK_ASSIGNED",
        title="Task Assigned: ENG-101",
        description="You were invited to review 'Design Complete MongoDB Database Schema for Enterprise Task Management System'.",
        read_status=False,
        link=f"/projects/ENG/tasks/{task_id}",
        created_by=user_id_1
    )
    await notif.insert()

    # 19. ACTIVITY LOGS
    activity = ActivityLogDocument(
        id=activity_id,
        user_id=user_id_1,
        action="TASK_UPDATED",
        entity_type="TASK",
        entity_id=task_id,
        description="Changed status from TODO to IN_PROGRESS and logged 12.5 hours.",
        timestamp=now,
        ip_address="192.168.1.100",
        device_info="Mozilla/5.0 Chrome/126.0"
    )
    await activity.insert()

    # 20. AUDIT LOGS
    audit = AuditLogDocument(
        id=audit_id,
        entity_type="TASK",
        entity_id=task_id,
        field_name="priority",
        previous_value="HIGH",
        new_value="URGENT",
        updated_by=user_id_1,
        updated_time=now
    )
    await audit.insert()

    # 21. TIME TRACKING
    time_track = TimeTrackingDocument(
        id=time_id,
        user_id=user_id_1,
        task_id=task_id,
        project_id=project_id,
        start_time=now - timedelta(hours=4),
        end_time=now,
        duration_hours=4.0,
        billable_hours=4.0,
        is_billable=True,
        description="Architected Beanie models and tested compound indexing efficiency."
    )
    await time_track.insert()

    # 22. MEETINGS
    meeting = MeetingDocument(
        id=meeting_id,
        organization_id=org_id,
        meeting_title="Architecture Sync: Pure MongoDB Scaling & Dual-Write Cutover",
        organizer_id=user_id_1,
        attendee_ids=[user_id_1, user_id_2],
        meeting_date=now - timedelta(hours=2),
        duration_minutes=60,
        agenda="1. Beanie ODM Models review\n2. Index strategy validation",
        meeting_notes="Unanimously approved transition to Beanie 2.1.0 with async Motor drivers.",
        recording_link="https://meet.google.com/rec/enterprise-arch-sync-102"
    )
    await meeting.insert()

    # 23. CHATS
    chat = ChatDocument(
        id=chat_id,
        organization_id=org_id,
        conversation_name="#architecture-core",
        is_group_chat=True,
        participant_ids=[user_id_1, user_id_2],
        last_message=LastMessageInfo(message_id=msg_id, sender_id=user_id_1, text="MongoDB schema specifications are finalized and ready for production test.", timestamp=now)
    )
    await chat.insert()

    # 24. MESSAGES
    message = MessageDocument(
        id=msg_id,
        chat_id=chat_id,
        sender_id=user_id_1,
        message="MongoDB schema specifications are finalized and ready for production test.",
        file_urls=["https://cdn.example.com/diagrams/beanie-odm.png"],
        seen_by_user_ids=[user_id_1],
        delivered_to_user_ids=[user_id_1, user_id_2],
        timestamp=now
    )
    await message.insert()

    # 25. REPORTS
    report = ReportDocument(
        id=report_id,
        project_id=project_id,
        generated_by_id=user_id_1,
        report_type="SPRINT_BURNDOWN",
        title="Sprint 14 Performance & Burndown Velocity Report",
        pdf_url="https://cdn.example.com/reports/ENG_sprint14_burndown.pdf",
        excel_url="https://cdn.example.com/reports/ENG_sprint14_raw_data.xlsx",
        created_time=now
    )
    await report.insert()

    # 26. AI HISTORY
    ai_hist = AIHistoryDocument(
        id=ai_id,
        user_id=user_id_1,
        prompt="Generate a comprehensive checklist for enterprise task management MongoDB schema validation.",
        response="1. Verify unique indexes on email/username.\n2. Add compound indexes for tenant isolation.\n3. Enforce Beanie Pydantic validations.",
        model_used="gemini-1.5-pro",
        tokens_consumed=342,
        timestamp=now
    )
    await ai_hist.insert()

    # 27. USER SESSIONS
    session = UserSessionDocument(
        id=session_id,
        user_id=user_id_1,
        device="Windows 11 PC",
        browser="Chrome 126.0",
        ip_address="192.168.1.100",
        login_time=now,
        refresh_token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh_token_signature_demo",
        expires_at=now + timedelta(days=7),
        is_active=True
    )
    await session.insert()

    # 28. SETTINGS
    setting = SettingDocument(
        id=setting_id,
        user_id=user_id_1,
        organization_id=org_id,
        theme="DARK",
        language="en-US",
        timezone="Asia/Kolkata",
        date_format="YYYY-MM-DD",
        time_format="24H",
        dashboard_preferences=DashboardPreferences(default_view="KANBAN", favorite_project_ids=[project_id])
    )
    await setting.insert()

    # 29. INVITATIONS
    invite = InvitationDocument(
        id=inv_id,
        email="alex.dev@example.com",
        organization_id=org_id,
        workspace_id=workspace_id,
        role_id=role_id,
        token="inv_secure_token_99281a8b",
        expiry_date=now + timedelta(days=7),
        invited_by_id=user_id_1
    )
    await invite.insert()

    return {
        "users": 2,
        "organizations": 1,
        "workspaces": 1,
        "teams": 1,
        "departments": 1,
        "roles": 1,
        "permissions": 1,
        "projects": 1,
        "sprints": 1,
        "milestones": 1,
        "tasks": 1,
        "subtasks": 1,
        "comments": 1,
        "attachments": 1,
        "notifications": 1,
        "activity_logs": 1,
        "audit_logs": 1,
        "time_tracking": 1,
        "calendar_events": 1,
        "meetings": 1,
        "chats": 1,
        "messages": 1,
        "labels": 1,
        "tags": 1,
        "reports": 1,
        "ai_history": 1,
        "user_sessions": 1,
        "settings": 1,
        "invitations": 1,
    }
