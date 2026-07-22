"""
MongoDB synchronization and persistence engine.
Provides dual-write / sync capabilities between SQLAlchemy ORM models and MongoDB Atlas collections.
"""

import os
import logging
from typing import Any, Dict, List, Optional
import pymongo
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
try:
    import certifi
    CA_FILE = certifi.where()
except ImportError:
    CA_FILE = None

from app.core.config import settings

logger = logging.getLogger(__name__)


class MongoDBManager:
    """
    Manages connections to MongoDB Atlas and handles synchronization of enterprise models.
    """

    def __init__(self):
        self.client: Optional[pymongo.MongoClient] = None
        self.db: Optional[pymongo.database.Database] = None
        self.is_connected: bool = False

    def init_db(self) -> bool:
        """Initialize MongoDB client and verify connection status."""
        uri = settings.get_mongodb_connection_uri
        if not uri:
            logger.warning("No MongoDB connection URI provided in settings.")
            return False

        try:
            # Configure TLS parameters if connecting to Atlas / mongodb+srv
            client_options = {
                "serverSelectionTimeoutMS": 5000,
                "connectTimeoutMS": 5000,
            }
            if "mongodb+srv" in uri or "mongodb.net" in uri:
                if CA_FILE:
                    client_options["tlsCAFile"] = CA_FILE
                client_options["tlsAllowInvalidCertificates"] = True

            self.client = pymongo.MongoClient(uri, **client_options)
            # Test connection with ping command
            self.client.admin.command("ping")
            self.db = self.client[settings.MONGODB_DB_NAME]
            self.is_connected = True
            logger.info(f"Successfully connected to MongoDB Atlas database: {settings.MONGODB_DB_NAME}")
            return True
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as exc:
            logger.warning(
                f"Could not connect to MongoDB Atlas at startup: {exc}. "
                "Ensure your IP address is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0)."
            )
            self.is_connected = False
            return False

    def get_collection(self, collection_name: str):
        """Retrieve a MongoDB collection by name if connected."""
        if self.is_connected and self.db is not None:
            return self.db[collection_name]
        return None

    def serialize_model(self, obj: Any) -> Dict[str, Any]:
        """Convert a SQLAlchemy model instance into a JSON-compatible dictionary for MongoDB."""
        result = {}
        if hasattr(obj, "__table__"):
            for col in obj.__table__.columns:
                val = getattr(obj, col.name, None)
                if hasattr(val, "isoformat"):
                    val = val.isoformat()
                result[col.name] = val
        return result

    def save_model_to_mongodb(self, obj: Any) -> bool:
        """Upsert a SQLAlchemy model object into its corresponding MongoDB collection."""
        if not self.is_connected or self.db is None:
            return False

        if not hasattr(obj, "__tablename__") or not hasattr(obj, "id") or getattr(obj, "id", None) is None:
            return False

        collection_name = obj.__tablename__
        collection = self.db[collection_name]
        doc = self.serialize_model(obj)
        try:
            collection.update_one({"id": obj.id}, {"$set": doc}, upsert=True)
            return True
        except Exception as exc:
            logger.debug(f"Failed to sync {collection_name} ID {obj.id} to MongoDB: {exc}")
            return False

    def delete_model_from_mongodb(self, obj: Any) -> bool:
        """Remove a SQLAlchemy model object from its corresponding MongoDB collection."""
        if not self.is_connected or self.db is None:
            return False

        if not hasattr(obj, "__tablename__") or not hasattr(obj, "id") or getattr(obj, "id", None) is None:
            return False

        collection_name = obj.__tablename__
        collection = self.db[collection_name]
        try:
            collection.delete_one({"id": obj.id})
            return True
        except Exception as exc:
            logger.debug(f"Failed to delete {collection_name} ID {obj.id} from MongoDB: {exc}")
            return False

    def seed_default_enterprise_data(self, db_session) -> None:
        """
        Ensure default demo enterprise users and tasks exist in both SQLAlchemy and MongoDB.
        Guarantees that login with dineshkumaryadav12651@gmail.com / Dinesh@123 succeeds instantly.
        """
        from app.models.auth import UserModel
        from app.models.project import Project
        from app.models.sprint import Sprint
        from app.models.kanban import BoardColumn
        from app.models.task import TaskModel
        from app.core.security import get_password_hash
        from datetime import datetime, timedelta

        # Check if users already exist
        existing_user = db_session.query(UserModel).filter(
            (UserModel.email == "dineshkumaryadav12651@gmail.com") | (UserModel.username == "dineshkumar")
        ).first()

        if not existing_user:
            logger.info("Seeding initial enterprise users into database and MongoDB...")
            dinesh_user = UserModel(
                username="dineshkumar",
                email="dineshkumaryadav12651@gmail.com",
                password_hash=get_password_hash("Dinesh@123"),
                full_name="Dinesh Kumar Yadav",
                role="Admin",
                department="Engineering",
                is_active=True,
                is_verified=True,
            )
            admin_user = UserModel(
                username="admin",
                email="admin@taskmaster.com",
                password_hash=get_password_hash("Admin@123"),
                full_name="Enterprise System Admin",
                role="Admin",
                department="Management",
                is_active=True,
                is_verified=True,
            )
            test_user = UserModel(
                username="testuser",
                email="test@example.com",
                password_hash=get_password_hash("password123"),
                full_name="Test Engineer",
                role="Member",
                department="QA",
                is_active=True,
                is_verified=True,
            )
            db_session.add_all([dinesh_user, admin_user, test_user])
            db_session.commit()
            db_session.refresh(dinesh_user)
            db_session.refresh(admin_user)
            db_session.refresh(test_user)

            # Sync users to MongoDB explicitly
            self.save_model_to_mongodb(dinesh_user)
            self.save_model_to_mongodb(admin_user)
            self.save_model_to_mongodb(test_user)

            # Seed demo Project
            project = Project(
                name="Enterprise SaaS Platform v2.0",
                description="Core AI-driven Agile task management and Kanban board suite.",
                status="Active",
                priority="High",
                budget=150000.0,
                owner_id=dinesh_user.id,
            )
            db_session.add(project)
            db_session.commit()
            db_session.refresh(project)
            self.save_model_to_mongodb(project)

            # Seed demo Sprint
            sprint = Sprint(
                name="Sprint 1: Core AI & WebSocket Real-Time Sync",
                goal="Achieve sub-second multi-user state synchronization and AI triage.",
                status="Active",
                start_date=datetime.utcnow() - timedelta(days=2),
                end_date=datetime.utcnow() + timedelta(days=12),
                project_id=project.id,
            )
            db_session.add(sprint)
            db_session.commit()
            db_session.refresh(sprint)
            self.save_model_to_mongodb(sprint)

            # Seed Board Columns
            col_todo = BoardColumn(name="TODO", position=1, wip_limit=15, is_default=True)
            col_prog = BoardColumn(name="IN_PROGRESS", position=2, wip_limit=5, is_default=False)
            col_rev = BoardColumn(name="REVIEW", position=3, wip_limit=4, is_default=False)
            col_done = BoardColumn(name="DONE", position=4, wip_limit=20, is_default=False)
            db_session.add_all([col_todo, col_prog, col_rev, col_done])
            db_session.commit()
            db_session.refresh(col_todo)
            db_session.refresh(col_prog)
            db_session.refresh(col_rev)
            db_session.refresh(col_done)
            self.save_model_to_mongodb(col_todo)
            self.save_model_to_mongodb(col_prog)
            self.save_model_to_mongodb(col_rev)
            self.save_model_to_mongodb(col_done)

            # Seed demo Tasks
            tasks_data = [
                TaskModel(
                    title="Implement MongoDB Dual-Write Engine",
                    description="Synchronize all enterprise SQLAlchemy mutations directly into MongoDB Atlas collections.",
                    priority="HIGH",
                    status="IN_PROGRESS",
                    story_points=8,
                    project_id=project.id,
                    sprint_id=sprint.id,
                    column_id=col_prog.id,
                    assignee_id=dinesh_user.id,
                    reporter_id=admin_user.id,
                ),
                TaskModel(
                    title="Real-Time WebSocket State Broadcast",
                    description="Broadcast Kanban column transitions and task updates across connected browser clients.",
                    priority="URGENT",
                    status="REVIEW",
                    story_points=5,
                    project_id=project.id,
                    sprint_id=sprint.id,
                    column_id=col_rev.id,
                    assignee_id=dinesh_user.id,
                    reporter_id=dinesh_user.id,
                ),
                TaskModel(
                    title="AI Copilot Bottleneck Analysis",
                    description="Analyze sprint burndown velocity and highlight high-risk delayed tickets.",
                    priority="MEDIUM",
                    status="TODO",
                    story_points=13,
                    project_id=project.id,
                    sprint_id=sprint.id,
                    column_id=col_todo.id,
                    assignee_id=test_user.id,
                    reporter_id=admin_user.id,
                ),
                TaskModel(
                    title="Role-Based Access Control (RBAC) Audit Trail",
                    description="Log all workspace permission changes and login attempts with IP geotagging.",
                    priority="HIGH",
                    status="DONE",
                    is_completed=True,
                    story_points=5,
                    project_id=project.id,
                    sprint_id=sprint.id,
                    column_id=col_done.id,
                    assignee_id=admin_user.id,
                    reporter_id=admin_user.id,
                ),
            ]
            db_session.add_all(tasks_data)
            db_session.commit()
            for t in tasks_data:
                db_session.refresh(t)
                self.save_model_to_mongodb(t)

            logger.info("Successfully seeded demo enterprise data and synced with MongoDB Atlas!")


mongodb_manager = MongoDBManager()
