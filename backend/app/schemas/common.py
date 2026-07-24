from typing import Generic, TypeVar, Optional, List, Any
from pydantic import BaseModel, ConfigDict

DataT = TypeVar("DataT")


class StandardResponse(BaseModel, Generic[DataT]):
    """
    Standard enterprise wrapper for single item or action responses.
    """
    status: str = "success"
    message: str = "Operation completed successfully"
    data: Optional[DataT] = None
    model_config = ConfigDict(from_attributes=True)


class PaginatedResponse(BaseModel, Generic[DataT]):
    """
    Standard enterprise wrapper for paginated list endpoints.
    """
    status: str = "success"
    total_count: int
    page: int
    page_size: int
    total_pages: int
    items: List[DataT]
    model_config = ConfigDict(from_attributes=True)


class ContactRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str
