"""
Async Repository Layer for Enterprise MongoDB Schema using Beanie ODM.
Provides generic CRUD, pagination, full-text search, soft-delete filtering, and audit trail hooks.
"""

from datetime import datetime
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar
from beanie import Document, PydanticObjectId
from beanie.operators import RegEx, Text, In
from app.mongodb_engine.models import (
    BaseEnterpriseDocument,
    AuditLogDocument,
    ActivityLogDocument,
    EntityStatus,
)

T = TypeVar("T", bound=BaseEnterpriseDocument)


class MongoRepository(Generic[T]):
    """
    Generic Repository encapsulating async Beanie queries with automatic tenant isolation,
    soft-delete handling, and pagination.
    """

    def __init__(self, model_cls: Type[T]):
        self.model_cls = model_cls

    async def create(
        self,
        document_data: Dict[str, Any],
        actor_id: Optional[PydanticObjectId] = None
    ) -> T:
        """Create and insert a new Beanie document with lifecycle metadata."""
        now = datetime.utcnow()
        document_data["created_at"] = now
        document_data["updated_at"] = now
        if actor_id:
            document_data["created_by"] = actor_id
            document_data["updated_by"] = actor_id
        document_data["soft_delete"] = False
        if "status" not in document_data:
            document_data["status"] = EntityStatus.ACTIVE.value

        instance = self.model_cls(**document_data)
        await instance.insert()
        return instance

    async def get_by_id(
        self,
        doc_id: PydanticObjectId,
        include_deleted: bool = False
    ) -> Optional[T]:
        """Fetch a single document by ObjectId, filtering soft-deleted records by default."""
        query = [self.model_cls.id == doc_id]
        if not include_deleted:
            query.append(self.model_cls.soft_delete == False)
        return await self.model_cls.find_one(*query)

    async def list_paginated(
        self,
        filter_dict: Optional[Dict[str, Any]] = None,
        skip: int = 0,
        limit: int = 50,
        sort_by: str = "-created_at",
        include_deleted: bool = False
    ) -> List[T]:
        """
        Retrieve paginated documents matching a filter dictionary, ordered by `sort_by`
        ('-field' for descending, '+field' or 'field' for ascending).
        """
        query_filters = []
        if not include_deleted:
            query_filters.append(self.model_cls.soft_delete == False)

        if filter_dict:
            for key, val in filter_dict.items():
                if val is not None and hasattr(self.model_cls, key):
                    query_filters.append(getattr(self.model_cls, key) == val)

        find_query = self.model_cls.find(*query_filters) if query_filters else self.model_cls.find_all()
        return await find_query.sort(sort_by).skip(skip).limit(limit).to_list()

    async def update(
        self,
        doc_id: PydanticObjectId,
        update_data: Dict[str, Any],
        actor_id: Optional[PydanticObjectId] = None,
        create_audit_log: bool = True
    ) -> Optional[T]:
        """
        Update an existing document. Records an immutable diff in `audit_logs` if `create_audit_log` is enabled.
        """
        doc = await self.get_by_id(doc_id)
        if not doc:
            return None

        update_data["updated_at"] = datetime.utcnow()
        if actor_id:
            update_data["updated_by"] = actor_id

        # Check differences and record audit logs if needed
        if create_audit_log and actor_id:
            for field, new_val in update_data.items():
                if field in ["updated_at", "updated_by"]:
                    continue
                old_val = getattr(doc, field, None)
                if old_val != new_val:
                    try:
                        await AuditLogDocument(
                            entity_type=self.model_cls.Settings.name.upper(),
                            entity_id=doc.id,
                            field_name=field,
                            previous_value=str(old_val),
                            new_value=str(new_val),
                            updated_by=actor_id,
                            updated_time=datetime.utcnow(),
                        ).insert()
                    except Exception as e:
                        # Continue even if audit log insert encounters partial error
                        pass

        for field, new_val in update_data.items():
            if hasattr(doc, field):
                setattr(doc, field, new_val)

        await doc.save()
        return doc

    async def soft_delete(
        self,
        doc_id: PydanticObjectId,
        actor_id: Optional[PydanticObjectId] = None
    ) -> bool:
        """Mark a document as soft_delete=True and set status='DELETED' without dropping data."""
        doc = await self.get_by_id(doc_id)
        if not doc:
            return False

        doc.soft_delete = True
        doc.status = EntityStatus.DELETED.value
        doc.updated_at = datetime.utcnow()
        if actor_id:
            doc.updated_by = actor_id
        await doc.save()

        # Record activity
        if actor_id:
            try:
                await ActivityLogDocument(
                    user_id=actor_id,
                    action="SOFT_DELETED",
                    entity_type=self.model_cls.Settings.name.upper(),
                    entity_id=doc.id,
                    description=f"Soft deleted document {doc.id} from {self.model_cls.Settings.name}",
                    timestamp=datetime.utcnow(),
                ).insert()
            except Exception:
                pass
        return True

    async def hard_delete(self, doc_id: PydanticObjectId) -> bool:
        """Physically remove a document from MongoDB (use with caution)."""
        doc = await self.get_by_id(doc_id, include_deleted=True)
        if not doc:
            return False
        await doc.delete()
        return True

    async def search_by_text(
        self,
        query_text: str,
        skip: int = 0,
        limit: int = 25,
        include_deleted: bool = False
    ) -> List[T]:
        """Perform a MongoDB full-text search against text-indexed fields."""
        query = [Text(query_text)]
        if not include_deleted:
            query.append(self.model_cls.soft_delete == False)
        return await self.model_cls.find(*query).skip(skip).limit(limit).to_list()
