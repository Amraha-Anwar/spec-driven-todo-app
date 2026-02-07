#!/usr/bin/env python3
"""
TaskToolbox MCP Server

A stateless MCP server that exposes Task CRUD operations as standardized tools.
Each tool requires a user_id parameter to ensure data isolation.

Requires:
- mcp library: pip install mcp
- sqlmodel library: pip install sqlmodel
- python-dotenv library: pip install python-dotenv
- Database URL in environment variable DATABASE_URL
"""

import os
import json
import logging
from typing import Any, Optional
from datetime import datetime, timezone
from uuid import UUID
import asyncio

from dotenv import load_dotenv
from sqlmodel import SQLModel, Field, Relationship, create_engine, Session, select
import mcp.server.stdio
from mcp.types import Tool, TextContent, ToolResult

# ============================================================================
# Database Models (mirrored from Phase 02)
# ============================================================================

class User(SQLModel, table=True):
    """User model"""
    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    tasks: list["Task"] = Relationship(back_populates="user")


class Task(SQLModel, table=True):
    """Task model"""
    id: str = Field(default_factory=lambda: str(__import__('uuid').uuid4()), primary_key=True)
    title: str = Field(max_length=255)
    description: Optional[str] = None
    is_completed: bool = Field(default=False)
    priority: Optional[str] = Field(default="medium")  # low, medium, high
    due_date: Optional[datetime] = None
    user_id: str = Field(foreign_key="user.id", ondelete="CASCADE")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: Optional[User] = Relationship(back_populates="tasks")


# ============================================================================
# Database Setup
# ============================================================================

load_dotenv()

def get_database_url() -> str:
    """Get and format database URL"""
    url = os.getenv("DATABASE_URL")
    if not url:
        raise ValueError("DATABASE_URL environment variable is not set")

    # Fix postgres:// to postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    return url


DATABASE_URL = get_database_url()
engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=3600,
)

# Create tables if they don't exist
SQLModel.metadata.create_all(engine)


def get_session():
    """Get database session"""
    return Session(engine)


# ============================================================================
# Task CRUD Operations (Stateless)
# ============================================================================

class TaskService:
    """Service for Task CRUD operations - all methods are stateless and user_id scoped"""

    @staticmethod
    def add_task(
        user_id: str,
        title: str,
        description: Optional[str] = None,
        priority: Optional[str] = "medium",
        due_date: Optional[str] = None,
    ) -> dict:
        """
        Add a new task for a user.

        Args:
            user_id: User ID (required for data isolation)
            title: Task title
            description: Optional task description
            priority: Optional priority (low, medium, high)
            due_date: Optional due date (ISO 8601 format)

        Returns:
            Task data as dict
        """
        with get_session() as session:
            # Parse due_date if provided
            parsed_due_date = None
            if due_date:
                try:
                    parsed_due_date = datetime.fromisoformat(due_date)
                except ValueError:
                    raise ValueError(f"Invalid due_date format: {due_date}. Use ISO 8601 format.")

            task = Task(
                title=title,
                description=description,
                priority=priority or "medium",
                due_date=parsed_due_date,
                user_id=user_id,
            )
            session.add(task)
            session.commit()
            session.refresh(task)

            return TaskService._task_to_dict(task)

    @staticmethod
    def list_tasks(user_id: str) -> list:
        """
        List all tasks for a user.

        Args:
            user_id: User ID (required for data isolation)

        Returns:
            List of task dicts
        """
        with get_session() as session:
            statement = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
            tasks = session.exec(statement).all()
            return [TaskService._task_to_dict(task) for task in tasks]

    @staticmethod
    def get_task(user_id: str, task_id: str) -> dict:
        """
        Get a specific task.

        Args:
            user_id: User ID (required for data isolation)
            task_id: Task ID

        Returns:
            Task data as dict
        """
        with get_session() as session:
            statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
            task = session.exec(statement).first()
            if not task:
                raise ValueError(f"Task {task_id} not found for user {user_id}")
            return TaskService._task_to_dict(task)

    @staticmethod
    def update_task(
        user_id: str,
        task_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        is_completed: Optional[bool] = None,
        priority: Optional[str] = None,
        due_date: Optional[str] = None,
    ) -> dict:
        """
        Update a task.

        Args:
            user_id: User ID (required for data isolation)
            task_id: Task ID
            title: Optional new title
            description: Optional new description
            is_completed: Optional completion status
            priority: Optional new priority
            due_date: Optional new due date (ISO 8601 format)

        Returns:
            Updated task data as dict
        """
        with get_session() as session:
            statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
            task = session.exec(statement).first()
            if not task:
                raise ValueError(f"Task {task_id} not found for user {user_id}")

            # Update fields if provided
            if title is not None:
                task.title = title
            if description is not None:
                task.description = description
            if is_completed is not None:
                task.is_completed = is_completed
            if priority is not None:
                task.priority = priority
            if due_date is not None:
                try:
                    task.due_date = datetime.fromisoformat(due_date)
                except ValueError:
                    raise ValueError(f"Invalid due_date format: {due_date}. Use ISO 8601 format.")

            task.updated_at = datetime.now(timezone.utc)
            session.add(task)
            session.commit()
            session.refresh(task)

            return TaskService._task_to_dict(task)

    @staticmethod
    def complete_task(user_id: str, task_id: str) -> dict:
        """
        Mark a task as complete.

        Args:
            user_id: User ID (required for data isolation)
            task_id: Task ID

        Returns:
            Updated task data as dict
        """
        return TaskService.update_task(user_id, task_id, is_completed=True)

    @staticmethod
    def delete_task(user_id: str, task_id: str) -> dict:
        """
        Delete a task.

        Args:
            user_id: User ID (required for data isolation)
            task_id: Task ID

        Returns:
            Success confirmation as dict
        """
        with get_session() as session:
            statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
            task = session.exec(statement).first()
            if not task:
                raise ValueError(f"Task {task_id} not found for user {user_id}")

            session.delete(task)
            session.commit()

            return {"success": True, "message": f"Task {task_id} deleted"}

    @staticmethod
    def _task_to_dict(task: Task) -> dict:
        """Convert task to dictionary"""
        return {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "is_completed": task.is_completed,
            "priority": task.priority,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "user_id": task.user_id,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat(),
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
            name="add_task",
            description="Add a new task for a user. Returns the created task.",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "User ID (required for data isolation)"
                    },
                    "title": {
                        "type": "string",
                        "description": "Task title"
                    },
                    "description": {
                        "type": "string",
                        "description": "Optional task description"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "Optional priority level (default: medium)"
                    },
                    "due_date": {
                        "type": "string",
                        "description": "Optional due date in ISO 8601 format (e.g., 2026-02-15T10:30:00Z)"
                    }
                },
                "required": ["user_id", "title"]
            }
        ),
        Tool(
            name="list_tasks",
            description="List all tasks for a user.",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "User ID (required for data isolation)"
                    }
                },
                "required": ["user_id"]
            }
        ),
        Tool(
            name="get_task",
            description="Get a specific task by ID.",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "User ID (required for data isolation)"
                    },
                    "task_id": {
                        "type": "string",
                        "description": "Task ID"
                    }
                },
                "required": ["user_id", "task_id"]
            }
        ),
        Tool(
            name="update_task",
            description="Update a task. Returns the updated task.",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "User ID (required for data isolation)"
                    },
                    "task_id": {
                        "type": "string",
                        "description": "Task ID"
                    },
                    "title": {
                        "type": "string",
                        "description": "Optional new title"
                    },
                    "description": {
                        "type": "string",
                        "description": "Optional new description"
                    },
                    "is_completed": {
                        "type": "boolean",
                        "description": "Optional completion status"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "Optional new priority"
                    },
                    "due_date": {
                        "type": "string",
                        "description": "Optional new due date in ISO 8601 format"
                    }
                },
                "required": ["user_id", "task_id"]
            }
        ),
        Tool(
            name="complete_task",
            description="Mark a task as complete. Returns the updated task.",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "User ID (required for data isolation)"
                    },
                    "task_id": {
                        "type": "string",
                        "description": "Task ID"
                    }
                },
                "required": ["user_id", "task_id"]
            }
        ),
        Tool(
            name="delete_task",
            description="Delete a task.",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "User ID (required for data isolation)"
                    },
                    "task_id": {
                        "type": "string",
                        "description": "Task ID"
                    }
                },
                "required": ["user_id", "task_id"]
            }
        )
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> ToolResult:
    """Execute a tool"""
    try:
        if name == "add_task":
            result = TaskService.add_task(
                user_id=arguments["user_id"],
                title=arguments["title"],
                description=arguments.get("description"),
                priority=arguments.get("priority"),
                due_date=arguments.get("due_date"),
            )
            return ToolResult(
                content=[TextContent(type="text", text=json.dumps(result, indent=2))],
                isError=False
            )

        elif name == "list_tasks":
            result = TaskService.list_tasks(user_id=arguments["user_id"])
            return ToolResult(
                content=[TextContent(type="text", text=json.dumps(result, indent=2))],
                isError=False
            )

        elif name == "get_task":
            result = TaskService.get_task(
                user_id=arguments["user_id"],
                task_id=arguments["task_id"],
            )
            return ToolResult(
                content=[TextContent(type="text", text=json.dumps(result, indent=2))],
                isError=False
            )

        elif name == "update_task":
            result = TaskService.update_task(
                user_id=arguments["user_id"],
                task_id=arguments["task_id"],
                title=arguments.get("title"),
                description=arguments.get("description"),
                is_completed=arguments.get("is_completed"),
                priority=arguments.get("priority"),
                due_date=arguments.get("due_date"),
            )
            return ToolResult(
                content=[TextContent(type="text", text=json.dumps(result, indent=2))],
                isError=False
            )

        elif name == "complete_task":
            result = TaskService.complete_task(
                user_id=arguments["user_id"],
                task_id=arguments["task_id"],
            )
            return ToolResult(
                content=[TextContent(type="text", text=json.dumps(result, indent=2))],
                isError=False
            )

        elif name == "delete_task":
            result = TaskService.delete_task(
                user_id=arguments["user_id"],
                task_id=arguments["task_id"],
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
        logger.info("TaskToolbox MCP Server started")
        await server.wait_for_exit()


if __name__ == "__main__":
    asyncio.run(main())
