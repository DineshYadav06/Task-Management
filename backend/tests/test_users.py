"""
Unit tests for user endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from src.utils.db import Base, get_db


# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
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
    """Reset database before each test."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


class TestUserRegistration:
    """Test user registration endpoints."""
    
    def test_register_user_success(self):
        """Test successful user registration."""
        response = client.post(
            "/users/register",
            json={
                "username": "testuser",
                "password": "password123",
                "email": "test@example.com"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"
        assert data["user_id"] == 1
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
    
    def test_register_duplicate_username(self):
        """Test registration with duplicate username."""
        # First registration
        client.post(
            "/users/register",
            json={
                "username": "testuser",
                "password": "password123",
                "email": "test1@example.com"
            }
        )
        
        # Duplicate registration
        response = client.post(
            "/users/register",
            json={
                "username": "testuser",
                "password": "password456",
                "email": "test2@example.com"
            }
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]
    
    def test_register_duplicate_email(self):
        """Test registration with duplicate email."""
        # First registration
        client.post(
            "/users/register",
            json={
                "username": "user1",
                "password": "password123",
                "email": "test@example.com"
            }
        )
        
        # Duplicate email
        response = client.post(
            "/users/register",
            json={
                "username": "user2",
                "password": "password123",
                "email": "test@example.com"
            }
        )
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]


class TestUserLogin:
    """Test user login endpoints."""
    
    def setup_method(self):
        """Create a test user before each test."""
        client.post(
            "/users/register",
            json={
                "username": "testuser",
                "password": "password123",
                "email": "test@example.com"
            }
        )
    
    def test_login_success(self):
        """Test successful login."""
        response = client.post(
            "/users/login",
            json={
                "username": "testuser",
                "password": "password123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "token" in data
        assert data["user_id"] == 1
        assert data["username"] == "testuser"
    
    def test_login_invalid_username(self):
        """Test login with invalid username."""
        response = client.post(
            "/users/login",
            json={
                "username": "invaliduser",
                "password": "password123"
            }
        )
        assert response.status_code == 401
        assert "Invalid username or password" in response.json()["detail"]
    
    def test_login_invalid_password(self):
        """Test login with invalid password."""
        response = client.post(
            "/users/login",
            json={
                "username": "testuser",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401
        assert "Invalid username or password" in response.json()["detail"]


class TestAuthentication:
    """Test authentication and authorization."""
    
    def setup_method(self):
        """Create a test user and login before each test."""
        client.post(
            "/users/register",
            json={
                "username": "testuser",
                "password": "password123",
                "email": "test@example.com"
            }
        )
        response = client.post(
            "/users/login",
            json={
                "username": "testuser",
                "password": "password123"
            }
        )
        self.token = response.json()["token"]
    
    def test_check_auth_with_valid_token(self):
        """Test authentication check with valid token."""
        response = client.get(
            "/users/check-auth",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "User is authenticated" in data["message"]
    
    def test_check_auth_without_token(self):
        """Test authentication check without token."""
        response = client.get("/users/check-auth")
        assert response.status_code == 401
        assert "Missing or invalid authorization header" in response.json()["detail"]
    
    def test_check_auth_with_invalid_token(self):
        """Test authentication check with invalid token."""
        response = client.get(
            "/users/check-auth",
            headers={"Authorization": "Bearer invalidtoken"}
        )
        assert response.status_code == 401
        assert "Invalid token" in response.json()["detail"]
