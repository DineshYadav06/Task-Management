import os
import secrets
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Enterprise application settings loaded from environment variables and .env files.
    """
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env", os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")),
        extra="ignore"
    )

    # Application details
    APP_NAME: str = "Enterprise SaaS Task Management Platform"
    PROJECT_NAME: str = "Enterprise SaaS Task Management Platform"
    APP_VERSION: str = "1.0.0"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    API_V1_STR: str = "/api/v1"

    # Database configuration
    # Default to local SQLite fallback if not set, or PostgreSQL in production/Docker
    DB_CONNECTION: str = "sqlite:///./task.db"
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_URI: Optional[str] = None
    MONGODB_DB_NAME: str = "enterprise_tasks_db"

    @property
    def get_mongodb_connection_uri(self) -> str:
        """Return MONGODB_URI if set in .env, otherwise fallback to MONGODB_URL."""
        return self.MONGODB_URI or self.MONGODB_URL

    # Redis & Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Security & JWT configuration
    SECRET_KEY: str = "enterprise_task_management_secret_key_production_2026_v2"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS configuration
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "https://taskmaster-tm.vercel.app", "*"]

    # OAuth Settings
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None

    # AI Integration Settings
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None


settings = Settings()
