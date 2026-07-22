"""
Unit tests for enterprise authentication and user endpoints (/api/v1/auth/*).
"""

import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker, close_all_sessions
from sqlalchemy.pool import StaticPool

import app.models  # Register all models on Base.metadata
from main import app
from app.core.database import Base, get_db


# Create test database using in-memory StaticPool
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

@event.listens_for(engine, "connect")
def turn_off_sqlite_foreign_keys(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys = OFF;")
    cursor.close()

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_db():
    """Reset database before each test cleanly without foreign key constraints."""
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.create_all(bind=engine)
    def clear_all():
        session = TestingSessionLocal()
        try:
            session.execute(text("PRAGMA foreign_keys = OFF;"))
            for table in reversed(Base.metadata.sorted_tables):
                try:
                    session.execute(text(f"DELETE FROM {table.name}"))
                except Exception:
                    pass
            session.commit()
            session.execute(text("PRAGMA foreign_keys = ON;"))
        finally:
            session.close()

    clear_all()
    yield
    clear_all()


class TestUserRegistration:
    """Test user registration endpoints."""

    def test_register_user_success(self):
        """Test successful user registration."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "password": "password123",
                "email": "test@example.com",
                "full_name": "Test User",
                "role": "Employee"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["id"] >= 1
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert data["full_name"] == "Test User"
        assert data["is_active"] is True

    def test_register_duplicate_username(self):
        """Test registration with duplicate username."""
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "password": "password123",
                "email": "test1@example.com"
            }
        )

        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "password": "password456",
                "email": "test2@example.com"
            }
        )
        assert response.status_code == 400
        assert "Username already registered" in response.json()["detail"]

    def test_register_duplicate_email(self):
        """Test registration with duplicate email."""
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "user1",
                "password": "password123",
                "email": "test@example.com"
            }
        )

        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "user2",
                "password": "password123",
                "email": "test@example.com"
            }
        )
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]


class TestUserLogin:
    """Test user login endpoints."""

    def setup_method(self):
        """Create a test user before each test."""
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "password": "password123",
                "email": "test@example.com"
            }
        )

    def test_login_success(self):
        """Test successful login."""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "testuser",
                "password": "password123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_invalid_password(self):
        """Test login with invalid password."""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "testuser",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401
        assert "Incorrect username/email or password" in response.json()["detail"]


class TestAuthenticationAndRefresh:
    """Test bearer token auth check and refresh token rotation."""

    def setup_method(self):
        """Create a test user and login before each test."""
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "password": "password123",
                "email": "test@example.com"
            }
        )
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "testuser",
                "password": "password123"
            }
        )
        data = response.json()
        self.access_token = data["access_token"]
        self.refresh_token = data["refresh_token"]

    def test_read_me_success(self):
        """Test reading profile with valid bearer token."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {self.access_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"

    def test_read_me_without_token(self):
        """Test reading profile without token."""
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401

    def test_refresh_token_success(self):
        """Test obtaining new token pair using refresh token in JSON body."""
        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": self.refresh_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 20
