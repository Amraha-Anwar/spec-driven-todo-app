#!/usr/bin/env python3
"""
ContextManager MCP Server

A stateless MCP server that manages conversation context using Neon PostgreSQL.
Implements fetch_chat_history and record_interaction tools for building conversation memory.

Requires:
- mcp library: pip install mcp
- sqlmodel library: pip install sqlmodel
- python-dotenv library: pip install python-dotenv
- psycopg2-binary library: pip install psycopg2-binary
- Database URL in environment variable NEON_DATABASE_URL
"""

import os
import json
import logging
from typing import Optional
from datetime import datetime, timezone
from uuid import UUID
import asyncio

from dotenv import load_dotenv
from sqlmodel import SQLModel, Field, create_engine, Session, select
import mcp.server.stdio
from mcp.types import Tool, TextContent, ToolResult

# ============================================================================
# Database Models
# ============================================================================

class Conversation(SQLModel, table=True):
    """Conversation model - groups messages by conversation"""
    id: str = Field(primary_key=True)
    user_id: str = Field(index=True)
    title: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Message(SQLModel, table=True):
    """Message model - stores individual messages in conversation"""
    id: str = Field(default_factory=lambda: str(__import__('uuid').uuid4()), primary_key=True)
    conversation_id: str = Field(foreign_key="conversation.id", ondelete="CASCADE", index=True)
    role: str = Field(index=True)  # "user" or "assistant"
    content: str
    metadata: Optional[str] = None  # JSON-serialized metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)


# ============================================================================
# Database Setup
# ============================================================================

load_dotenv()

def get_database_url() -> str:
    """Get and format database URL"""
    url = os.getenv("NEON_DATABASE_URL")
    if not url:
        raise ValueError("NEON_DATABASE_URL environment variable is not set")

    # Ensure postgresql:// format
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    return url


DATABASE_URL = get_database_url()
engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args={"sslmode": "require"}  # Neon requires SSL
)

# Create tables if they don't exist
SQLModel.metadata.create_all(engine)


def get_session():
    """Get database session"""
    return Session(engine)


# ============================================================================
# Context Management Service (Stateless)
# ============================================================================

class ContextService:
    """Service for managing conversation context - all methods are stateless"""

    @staticmethod
    def fetch_chat_history(conversation_id: str, limit: int = 10) -> dict:
        """
        Fetch the last N messages from a conversation.

        Args:
            conversation_id: Conversation ID
            limit: Number of messages to retrieve (default: 10)

        Returns:
            Dict with conversation metadata and messages array
        """
        with get_session() as session:
            # Get conversation
            conversation = session.get(Conversation, conversation_id)
            if not conversation:
                raise ValueError(f"Conversation {conversation_id} not found")

            # Get last N messages ordered by created_at DESC, then reverse for chronological order
            statement = (
                select(Message)
                .where(Message.conversation_id == conversation_id)
                .order_by(Message.created_at.desc())
                .limit(limit)
            )
            messages = list(reversed(session.exec(statement).all()))

            # Convert to dicts
            message_dicts = [ContextService._message_to_dict(msg) for msg in messages]

            return {
                "conversation_id": conversation.id,
                "user_id": conversation.user_id,
                "title": conversation.title,
                "message_count": len(message_dicts),
                "created_at": conversation.created_at.isoformat(),
                "updated_at": conversation.updated_at.isoformat(),
                "messages": message_dicts
            }

    @staticmethod
    def record_interaction(
        conversation_id: str,
        user_message: str,
        assistant_response: str,
        metadata: Optional[str] = None,
    ) -> dict:
        """
        Record a user message and assistant response to the database.

        Args:
            conversation_id: Conversation ID
            user_message: User's message content
            assistant_response: Assistant's response content
            metadata: Optional JSON metadata about the interaction

        Returns:
            Dict with recorded messages
        """
        with get_session() as session:
            # Verify conversation exists
            conversation = session.get(Conversation, conversation_id)
            if not conversation:
                raise ValueError(f"Conversation {conversation_id} not found")

            # Create user message
            user_msg = Message(
                conversation_id=conversation_id,
                role="user",
                content=user_message,
                metadata=metadata
            )
            session.add(user_msg)
            session.flush()  # Get the ID

            # Create assistant message
            assistant_msg = Message(
                conversation_id=conversation_id,
                role="assistant",
                content=assistant_response,
                metadata=metadata
            )
            session.add(assistant_msg)

            # Update conversation updated_at
            conversation.updated_at = datetime.now(timezone.utc)
            session.add(conversation)

            session.commit()
            session.refresh(user_msg)
            session.refresh(assistant_msg)

            return {
                "conversation_id": conversation_id,
                "user_message": ContextService._message_to_dict(user_msg),
                "assistant_message": ContextService._message_to_dict(assistant_msg),
                "recorded_at": datetime.now(timezone.utc).isoformat()
            }

    @staticmethod
    def create_conversation(user_id: str, title: Optional[str] = None) -> dict:
        """
        Create a new conversation.

        Args:
            user_id: User ID
            title: Optional conversation title

        Returns:
            Conversation data as dict
        """
        with get_session() as session:
            conversation = Conversation(
                id=str(__import__('uuid').uuid4()),
                user_id=user_id,
                title=title
            )
            session.add(conversation)
            session.commit()
            session.refresh(conversation)

            return {
                "id": conversation.id,
                "user_id": conversation.user_id,
                "title": conversation.title,
                "created_at": conversation.created_at.isoformat(),
                "updated_at": conversation.updated_at.isoformat()
            }

    @staticmethod
    def get_conversation(conversation_id: str) -> dict:
        """
        Get conversation metadata.

        Args:
            conversation_id: Conversation ID

        Returns:
            Conversation data as dict
        """
        with get_session() as session:
            conversation = session.get(Conversation, conversation_id)
            if not conversation:
                raise ValueError(f"Conversation {conversation_id} not found")

            return {
                "id": conversation.id,
                "user_id": conversation.user_id,
                "title": conversation.title,
                "created_at": conversation.created_at.isoformat(),
                "updated_at": conversation.updated_at.isoformat()
            }

    @staticmethod
    def list_conversations(user_id: str, limit: int = 20) -> list:
        """
        List recent conversations for a user.

        Args:
            user_id: User ID
            limit: Number of conversations to retrieve (default: 20)

        Returns:
            List of conversation dicts
        """
        with get_session() as session:
            statement = (
                select(Conversation)
                .where(Conversation.user_id == user_id)
                .order_by(Conversation.updated_at.desc())
                .limit(limit)
            )
            conversations = session.exec(statement).all()

            return [
                {
                    "id": conv.id,
                    "user_id": conv.user_id,
                    "title": conv.title,
                    "created_at": conv.created_at.isoformat(),
                    "updated_at": conv.updated_at.isoformat()
                }
                for conv in conversations
            ]

    @staticmethod
    def _message_to_dict(message: Message) -> dict:
        """Convert message to dictionary"""
        return {
            "id": message.id,
            "conversation_id": message.conversation_id,
            "role": message.role,
            "content": message.content,
            "metadata": json.loads(message.metadata) if message.metadata else None,
            "created_at": message.created_at.isoformat()
        }


# ============================================================================
# MCP Server Setup
# ============================================================================

server = mcp.server.stdio.stdio_server()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@server.list_tools()
async def list_tools() -> list[Tool]:
    """Return available tools"""
    return [
        Tool(
            name="fetch_chat_history",
            description="Fetch the last N messages from a conversation for context rebuilding.",
            inputSchema={
                "type": "object",
                "properties": {
                    "conversation_id": {
                        "type": "string",
                        "description": "Conversation ID"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Number of messages to retrieve (default: 10, max: 100)",
                        "default": 10
                    }
                },
                "required": ["conversation_id"]
            }
        ),
        Tool(
            name="record_interaction",
            description="Record a user message and assistant response to the conversation history.",
            inputSchema={
                "type": "object",
                "properties": {
                    "conversation_id": {
                        "type": "string",
                        "description": "Conversation ID"
                    },
                    "user_message": {
                        "type": "string",
                        "description": "User's message content"
                    },
                    "assistant_response": {
                        "type": "string",
                        "description": "Assistant's response content"
                    },
                    "metadata": {
                        "type": "string",
                        "description": "Optional JSON metadata about the interaction"
                    }
                },
                "required": ["conversation_id", "user_message", "assistant_response"]
            }
        ),
        Tool(
            name="create_conversation",
            description="Create a new conversation for a user.",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "User ID"
                    },
                    "title": {
                        "type": "string",
                        "description": "Optional conversation title"
                    }
                },
                "required": ["user_id"]
            }
        ),
        Tool(
            name="get_conversation",
            description="Get conversation metadata.",
            inputSchema={
                "type": "object",
                "properties": {
                    "conversation_id": {
                        "type": "string",
                        "description": "Conversation ID"
                    }
                },
                "required": ["conversation_id"]
            }
        ),
        Tool(
            name="list_conversations",
            description="List recent conversations for a user.",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "User ID"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Number of conversations to retrieve (default: 20)",
                        "default": 20
                    }
                },
                "required": ["user_id"]
            }
        )
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> ToolResult:
    """Execute a tool"""
    try:
        if name == "fetch_chat_history":
            result = ContextService.fetch_chat_history(
                conversation_id=arguments["conversation_id"],
                limit=arguments.get("limit", 10)
            )
            return ToolResult(
                content=[TextContent(type="text", text=json.dumps(result, indent=2))],
                isError=False
            )

        elif name == "record_interaction":
            result = ContextService.record_interaction(
                conversation_id=arguments["conversation_id"],
                user_message=arguments["user_message"],
                assistant_response=arguments["assistant_response"],
                metadata=arguments.get("metadata")
            )
            return ToolResult(
                content=[TextContent(type="text", text=json.dumps(result, indent=2))],
                isError=False
            )

        elif name == "create_conversation":
            result = ContextService.create_conversation(
                user_id=arguments["user_id"],
                title=arguments.get("title")
            )
            return ToolResult(
                content=[TextContent(type="text", text=json.dumps(result, indent=2))],
                isError=False
            )

        elif name == "get_conversation":
            result = ContextService.get_conversation(
                conversation_id=arguments["conversation_id"]
            )
            return ToolResult(
                content=[TextContent(type="text", text=json.dumps(result, indent=2))],
                isError=False
            )

        elif name == "list_conversations":
            result = ContextService.list_conversations(
                user_id=arguments["user_id"],
                limit=arguments.get("limit", 20)
            )
            return ToolResult(
                content=[TextContent(type="text", text=json.dumps(result, indent=2))],
                isError=False
            )

        else:
            return ToolResult(
                content=[TextContent(type="text", text=f"Unknown tool: {name}")],
                isError=True
            )

    except Exception as e:
        logger.exception(f"Error calling tool {name}")
        return ToolResult(
            content=[TextContent(type="text", text=f"Error: {str(e)}")],
            isError=True
        )


async def main():
    """Run the MCP server"""
    async with server:
        logger.info("ContextManager MCP Server started")
        await server.wait_for_exit()


if __name__ == "__main__":
    asyncio.run(main())
