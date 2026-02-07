"""
SQLModel for Conversation persistence
Stores multi-turn chat sessions with user association and language preference
"""
from sqlmodel import SQLModel, Field, Relationship, Column
from sqlalchemy import JSON
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4


class Conversation(SQLModel, table=True):
    """
    Chat conversation session linked to a user
    Supports multi-turn conversations with automatic message cascade deletion
    """
    __tablename__ = "conversation"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    title: Optional[str] = Field(default=None)
    language_preference: str = Field(default="en")  # "en" for English, "ur" for Roman Urdu
    
    # Renamed from 'metadata' to 'context_data' to avoid reserved keyword conflict
    context_data: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSON)  # Critical: prevents ValueError on dict initialization
    )
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship: lazy load messages on access, cascade delete when conversation deleted
    messages: List["Message"] = Relationship(
        back_populates="conversation",
        cascade_delete=True
    )

    def __repr__(self) -> str:
        return (
            f"<Conversation(id={self.id}, user_id={self.user_id}, "
            f"language={self.language_preference}, "
            f"messages_count={len(self.messages) if self.messages else 0})>"
        )