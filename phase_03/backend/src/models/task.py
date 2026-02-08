from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
import uuid
from datetime import datetime, timezone

if TYPE_CHECKING:
    from .user import User

class Task(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(max_length=255)
    description: Optional[str] = None
    is_completed: bool = Field(default=False)
    status: str = Field(default="pending")  # NEW: "pending" or "completed"
    priority: Optional[str] = Field(default="medium")  # ✅ NEW: low, medium, high
    due_date: Optional[datetime] = Field(default=None)  # ✅ NEW: scheduled date
    user_id: str = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: Optional["User"] = Relationship(back_populates="tasks")