import asyncio
import sys
from app.core.database import LocalSession
from app.core.mongodb import mongodb_manager
from app.mongodb_engine import init_beanie_db
from app.mongodb_engine.models import (
    UserDocument, OrganizationDocument, WorkspaceDocument, TeamDocument,
    DepartmentDocument, RoleDocument, PermissionDocument, ProjectDocument,
    SprintDocument, MilestoneDocument, TaskDocument, SubtaskDocument,
    CommentDocument, AttachmentDocument, NotificationDocument, ActivityLogDocument,
    AuditLogDocument, TimeTrackingDocument, CalendarEventDocument, MeetingDocument,
    ChatDocument, MessageDocument, LabelDocument, TagDocument, ReportDocument,
    AIHistoryDocument, UserSessionDocument, SettingDocument, InvitationDocument
)

async def sync_all_to_atlas():
    print("=================================================================")
    print("Connecting to MongoDB Atlas across all 29 Enterprise Collections")
    print("=================================================================")
    try:
        # 1. Initialize synchronous pymongo manager and create database
        mongodb_manager.init_db()
        print("[SUCCESS] Pymongo connected successfully to 'enterprise_tasks_db'!")
        if mongodb_manager.client:
            mongodb_manager.client.close()
            await asyncio.sleep(1)
    except Exception as e:
        print(f"[ERROR] Pymongo connection failed: {e}")
        print("\nNote: If you see [SSL: TLSV1_ALERT_INTERNAL_ERROR], your current IP address")
        print("is NOT whitelisted in MongoDB Atlas -> Network Access -> Add IP Address -> 0.0.0.0/0.")
        sys.exit(1)

    try:
        # 2. Initialize Beanie ODM across all 29 collections
        await init_beanie_db()
        print("[SUCCESS] Beanie ODM initialized across 29 collections in 'enterprise_tasks_db'!")
    except Exception as e:
        print(f"[ERROR] Beanie initialization failed: {e}")
        sys.exit(1)

    # 3. Synchronize SQLAlchemy users & data into MongoDB Atlas
    print("\nSynchronizing SQLite user and task data into MongoDB Atlas...")
    db = LocalSession()
    try:
        mongodb_manager.init_db()
        mongodb_manager.seed_default_enterprise_data(db)
        print("[SUCCESS] Default enterprise accounts and sample data seeded into MongoDB!")
    finally:
        db.close()

    # 4. Count documents across core collections to confirm
    u_count = await UserDocument.count()
    t_count = await TaskDocument.count()
    p_count = await ProjectDocument.count()
    w_count = await WorkspaceDocument.count()

    print("\n=================================================================")
    print("MONGODB ATLAS SYNCHRONIZATION COMPLETE!")
    print(f"Users in MongoDB Atlas (users): {u_count}")
    print(f"Workspaces in MongoDB Atlas (workspaces): {w_count}")
    print(f"Projects in MongoDB Atlas (projects): {p_count}")
    print(f"Tasks in MongoDB Atlas (tasks): {t_count}")
    print("Refresh your MongoDB Atlas Data Explorer page now to see enterprise_tasks_db and all collections!")
    print("=================================================================")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(sync_all_to_atlas())
