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

def test_access_protected_endpoint_success(client: TestClient, session: Session):
    # Create user in DB
    user = User(id="user1", email="test@example.com", name="Test User")
    session.add(user)
    session.commit()
    
    token = create_token("user1")
    response = client.get(
        "/api/health/protected",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["user"] == "test@example.com"

def test_access_protected_endpoint_no_token(client: TestClient):
    response = client.get("/api/health/protected")
    # FastAPI/Starlette behavior can vary, accept either Unauthorized or Forbidden
    assert response.status_code in [401, 403]

def test_access_protected_endpoint_invalid_token(client: TestClient):
    response = client.get(
        "/api/health/protected",
        headers={"Authorization": "Bearer invalidtoken"}
    )
    assert response.status_code == 401

def test_access_protected_endpoint_user_not_found(client: TestClient, session: Session):
    token = create_token("nonexistent_user")
    response = client.get(
        "/api/health/protected",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401
    assert "User not found" in response.json()["detail"]
