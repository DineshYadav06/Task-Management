"""
MongoDB Enterprise Engine - Beanie ODM & Motor Async Initialization.
Registers all 29 collections and indexes against MongoDB Atlas / Local cluster.
"""

from typing import List, Optional
import ssl
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings

# Import all 29 Beanie Documents
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
)

ALL_DOCUMENTS = [
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
]

try:
    import certifi
    CA_FILE = certifi.where()
except ImportError:
    CA_FILE = None

_motor_client: Optional[AsyncIOMotorClient] = None


async def init_beanie_db(uri: Optional[str] = None, db_name: Optional[str] = None) -> AsyncIOMotorClient:
    """
    Connect to MongoDB via Motor and initialize Beanie ODM with all 29 collections.
    Creates required single and compound indexes automatically on startup.
    """
    global _motor_client
    mongo_uri = uri or settings.get_mongodb_connection_uri
    target_db_name = db_name or settings.MONGODB_DB_NAME
    
    client_options = {
        "serverSelectionTimeoutMS": 3000,
        "connectTimeoutMS": 3000,
        "maxPoolSize": 5,
        "minPoolSize": 0,
        "retryWrites": True,
        "retryReads": True,
    }
    if "mongodb+srv" in mongo_uri or "mongodb.net" in mongo_uri:
        if CA_FILE:
            client_options["tlsCAFile"] = CA_FILE
        client_options["tlsAllowInvalidCertificates"] = True

    # Compatibility fix for Beanie 2.1.0 with Motor 3.7+ / Pymongo 4.17+
    if not hasattr(AsyncIOMotorClient, "append_metadata"):
        AsyncIOMotorClient.append_metadata = lambda self, *args, **kwargs: None

    # Initialize Async Motor Client
    _motor_client = AsyncIOMotorClient(
        mongo_uri,
        **client_options
    )
    
    # Initialize Beanie with our database and document classes
    database = _motor_client[target_db_name]
    await init_beanie(
        database=database,
        document_models=ALL_DOCUMENTS,
        allow_index_dropping=False
    )
    
    return _motor_client


def get_motor_client() -> AsyncIOMotorClient:
    """Retrieve the active Motor async client."""
    global _motor_client
    if _motor_client is None:
        raise RuntimeError("Beanie/Motor has not been initialized. Call `init_beanie_db()` during lifespan/startup.")
    return _motor_client
