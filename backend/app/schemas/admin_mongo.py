from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class AdminMongoSchema(BaseModel):
    """
    MongoDB Schema definition for the Admin 'Signup' collection.
    This defines the exact structure, data types, and defaults for the documents.
    """
    email: EmailStr = Field(..., description="Admin's unique email address")
    password: str = Field(..., description="Bcrypt hashed password string")
    security_key: str = Field(..., description="Unique security key for file-based authentication")
    
    # Optional metadata fields with default values
    role: str = Field(default="super_admin", description="Role of the admin")
    is_active: bool = Field(default=True, description="Whether the admin account is active")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp of account creation")
    last_login: Optional[datetime] = Field(default=None, description="Timestamp of the last successful login")

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "email": "admin@example.com",
                "password": "$2b$12$YourHashedPasswordHere...",
                "security_key": "my-secret-key-file-content",
                "role": "super_admin",
                "is_active": True,
                "created_at": "2026-07-24T12:00:00Z"
            }
        }
