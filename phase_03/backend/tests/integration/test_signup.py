from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
import pytest
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

def test_signup_successful(client: TestClient, session: Session):
    response = client.post(
        "/api/auth/signup/email",
        json={
            "email": "newuser@example.com",
            "password": "password123",
            "name": "New User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert "id" in data
    
    # Verify DB
    user = session.query(User).filter(User.email == "newuser@example.com").first()
    assert user is not None
    assert user.name == "New User"

def test_signup_duplicate_email(client: TestClient):
    # Create first user
    client.post(
        "/api/auth/signup/email",
        json={
            "email": "duplicate@example.com",
            "password": "password123",
            "name": "User 1"
        }
    )
    
    # Try create same user again
    response = client.post(
        "/api/auth/signup/email",
        json={
            "email": "duplicate@example.com",
            "password": "password456",
            "name": "User 2"
        }
    )
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]
