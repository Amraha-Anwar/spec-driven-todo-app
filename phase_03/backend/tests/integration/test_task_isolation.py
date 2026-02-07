from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
import pytest
import jwt
import os
from datetime import datetime, timezone, timedelta
from src.main import app
from src.db.session import get_session
from src.models.user import User
from src.models.task import Task
from src.models.auth import Account, Session as AuthSession, Verification

# Setup in-memory DB for testing
@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    session = Session(engine)
    yield session
    session.close()

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

SECRET = os.getenv("BETTER_AUTH_SECRET", "test_secret")

def create_token(user_id):
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15)
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

def test_create_task_isolation(client: TestClient, session: Session):
    user = User(id="user1", email="user1@example.com", name="User 1")
    session.add(user)
    session.commit()
    
    token = create_token("user1")
    response = client.post(
        "/api/user1/tasks",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "My Task"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "My Task"
    assert data["user_id"] == "user1"

    # Verify DB
    task = session.query(Task).first()
    assert task.user_id == "user1"

def test_access_other_user_resource_forbidden(client: TestClient, session: Session):
    user1 = User(id="user1", email="user1@example.com", name="User 1")
    user2 = User(id="user2", email="user2@example.com", name="User 2")
    session.add(user1)
    session.add(user2)
    session.commit()
    
    token = create_token("user1")
    
    # Try to access User 2's task list (path mismatch)
    response = client.get(
        "/api/user2/tasks",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403
    
    # Create task for User 2
    task2 = Task(title="User 2 Task", user_id="user2")
    session.add(task2)
    session.commit()
    
    # Try to access User 2's specific task via User 1's path?
    # No, if I use /api/user1/tasks/{task2_id}, get_task checks ownership.
    response = client.get(
        f"/api/user1/tasks/{task2.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403
