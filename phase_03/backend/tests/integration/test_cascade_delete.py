from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool
import pytest
from src.main import app
from src.db.session import get_session
from src.models.user import User
from src.models.task import Task
from src.models.auth import Account, Session as AuthSession, Verification

# Setup in-memory DB for testing
# Note: SQLite supports FKs but they must be enabled. SQLModel/SQLAlchemy usually handles this.
@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    # Enable FK support in SQLite
    @pytest.fixture(autouse=True)
    def enable_foreign_keys(request):
        with engine.connect() as conn:
            conn.execute(text("PRAGMA foreign_keys=ON"))

    SQLModel.metadata.create_all(engine)
    session = Session(engine)
    yield session
    session.close()

def test_cascade_delete(session: Session):
    # This test might rely on DB-level cascade. 
    # In SQLite, we need to ensure PRAGMA foreign_keys=ON.
    # However, SQLModel Relationships with cascade_delete=True might handle it on python side too?
    # No, 'ondelete="CASCADE"' in Field() is DDL.
    
    # Let's mock the behavior logic or check if ORM deletes it.
    
    user = User(id="user1", email="user1@example.com", name="User 1")
    task = Task(title="Task 1", user_id="user1")
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    session.add(task)
    session.commit()
    
    # Delete user
    session.delete(user)
    session.commit()
    
    # Check if task is gone
    # Note: If checking DB level cascade, we need to check if row is gone.
    # If using session.delete(user), SQLAlchemy might issue DELETE for task if relationship configured.
    # In User model: tasks = Relationship(..., cascade_delete=True) -> this is SQLModel specific?
    # SQLAlchemy: cascade="all, delete-orphan".
    
    # Let's verify.
    tasks = session.exec(select(Task).where(Task.user_id == "user1")).all()
    assert len(tasks) == 0
