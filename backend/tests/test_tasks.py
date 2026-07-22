"""
Unit tests for task endpoints.
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


class TestTaskOperations:
    """Test task CRUD operations."""
    
    def setup_method(self):
        """Create a test user and get authentication token."""
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
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_create_task_success(self):
        """Test successful task creation."""
        response = client.post(
            "/tasks/create",
            headers=self.headers,
            json={
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "is_completed": False
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"
        assert data["data"]["title"] == "Buy groceries"
        assert data["data"]["is_completed"] is False
    
    def test_create_task_without_description(self):
        """Test task creation without optional description."""
        response = client.post(
            "/tasks/create",
            headers=self.headers,
            json={
                "title": "Buy groceries",
                "is_completed": False
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["data"]["description"] is None
    
    def test_create_task_unauthorized(self):
        """Test task creation without authentication."""
        response = client.post(
            "/tasks/create",
            json={
                "title": "Buy groceries",
                "description": "Milk, eggs, bread"
            }
        )
        assert response.status_code == 401
    
    def test_get_all_tasks(self):
        """Test retrieving all tasks."""
        # Create multiple tasks
        for i in range(3):
            client.post(
                "/tasks/create",
                headers=self.headers,
                json={
                    "title": f"Task {i}",
                    "description": f"Description {i}"
                }
            )
        
        response = client.get(
            "/tasks/all",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert len(data["data"]) == 3
        assert data["total"] == 3
    
    def test_get_all_tasks_with_pagination(self):
        """Test retrieving tasks with pagination."""
        # Create 15 tasks
        for i in range(15):
            client.post(
                "/tasks/create",
                headers=self.headers,
                json={"title": f"Task {i}"}
            )
        
        # Get first page
        response = client.get(
            "/tasks/all?skip=0&limit=5",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) == 5
        assert data["total"] == 15
    
    def test_get_single_task(self):
        """Test retrieving a single task."""
        # Create a task
        create_response = client.post(
            "/tasks/create",
            headers=self.headers,
            json={
                "title": "Buy groceries",
                "description": "Milk, eggs, bread"
            }
        )
        task_id = create_response.json()["data"]["id"]
        
        # Get the task
        response = client.get(
            f"/tasks/{task_id}",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["data"]["id"] == task_id
        assert data["data"]["title"] == "Buy groceries"
    
    def test_get_nonexistent_task(self):
        """Test retrieving a non-existent task."""
        response = client.get(
            "/tasks/999",
            headers=self.headers
        )
        assert response.status_code == 404
    
    def test_update_task(self):
        """Test updating a task."""
        # Create a task
        create_response = client.post(
            "/tasks/create",
            headers=self.headers,
            json={
                "title": "Buy groceries",
                "is_completed": False
            }
        )
        task_id = create_response.json()["data"]["id"]
        
        # Update the task
        response = client.put(
            f"/tasks/{task_id}",
            headers=self.headers,
            json={
                "title": "Buy groceries and cook",
                "is_completed": True
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["title"] == "Buy groceries and cook"
        assert data["data"]["is_completed"] is True
    
    def test_delete_task(self):
        """Test deleting a task."""
        # Create a task
        create_response = client.post(
            "/tasks/create",
            headers=self.headers,
            json={"title": "Task to delete"}
        )
        task_id = create_response.json()["data"]["id"]
        
        # Delete the task
        response = client.delete(
            f"/tasks/{task_id}",
            headers=self.headers
        )
        assert response.status_code == 200
        assert response.json()["status"] == "success"
        
        # Verify it's deleted
        get_response = client.get(
            f"/tasks/{task_id}",
            headers=self.headers
        )
        assert get_response.status_code == 404


class TestTaskSearch:
    """Test task search functionality."""
    
    def setup_method(self):
        """Create a test user and tasks."""
        client.post(
            "/users/register",
            json={
                "username": "testuser",
                "password": "password123"
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
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
        # Create test tasks
        client.post(
            "/tasks/create",
            headers=self.headers,
            json={
                "title": "Buy groceries",
                "description": "Milk, eggs, bread"
            }
        )
        client.post(
            "/tasks/create",
            headers=self.headers,
            json={
                "title": "Complete project",
                "description": "Finish Python project"
            }
        )
    
    def test_search_by_title(self):
        """Test searching tasks by title."""
        response = client.get(
            "/tasks/search/groceries",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) == 1
        assert "groceries" in data["data"][0]["title"].lower()
    
    def test_search_by_description(self):
        """Test searching tasks by description."""
        response = client.get(
            "/tasks/search/Python",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) == 1
        assert "python" in data["data"][0]["description"].lower()
    
    def test_search_no_results(self):
        """Test search with no results."""
        response = client.get(
            "/tasks/search/nonexistent",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) == 0
        assert data["total"] == 0
