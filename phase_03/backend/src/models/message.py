"""
SQLModel for Message persistence
Stores individual messages within a conversation (user or assistant role)
"""
from sqlmodel import SQLModel, Field, Relationship, Column
from sqlalchemy import JSON
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID, uuid4

from .conversation import Conversation


class Message(SQLModel, table=True):
    """
    Individual message in a conversation
    Tracks sender role, content, and tool call metadata for agent execution
    """
    __tablename__ = "message"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversation.id", index=True)
    role: str = Field(index=True)  # "user" or "assistant"
    content: str
    tool_call_metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSON)  # Critical: stores tool_name, tool_args, tool_result
    )
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Relationship: reference back to conversation for lazy loading
    conversation: Optional[Conversation] = Relationship(back_populates="messages")

    def __repr__(self) -> str:
        return (
            f"<Message(id={self.id}, conversation_id={self.conversation_id}, "
            f"role={self.role}, content_length={len(self.content)})>"
        )