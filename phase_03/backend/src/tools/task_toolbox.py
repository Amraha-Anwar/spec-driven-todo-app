"""
TaskToolbox: MCP Server implementation for Task CRUD operations
Task IDs: T011, T012 - Implements add_task, list_tasks, delete_task, update_task, complete_task
Handles user-isolated database operations with parameterized queries
"""

import json
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from uuid import UUID, uuid4

from sqlmodel import Session, select

from ..models.task import Task
from ..models.user import User


class TaskToolbox:
    """
    MCP-compliant task management tool.
    All operations validate user_id ownership and use parameterized queries.
    """

    def __init__(self, session: Session):
        self.session = session

    # ========================================================================
    # CRUD Operations
    # ========================================================================

    def add_task(
        self,
        user_id: str,
        title: str,
        description: Optional[str] = None,
        priority: str = "medium",
        due_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Add a new task for the user.

        Args:
            user_id: User ID from JWT token
            title: Task title (required, 1-255 chars)
            description: Optional task description
            priority: "low", "medium", or "high" (default: medium)
            due_date: ISO format date string (optional)

        Returns:
            Dict with success=True and task data, or success=False with error
        """
        try:
            # Validate inputs
            if not title or not title.strip():
                return {"success": False, "error": "Title cannot be empty"}

            if priority not in ["low", "medium", "high"]:
                return {"success": False, "error": f"Priority must be low, medium, or high. Got: {priority}"}

            # Parse due_date if provided
            parsed_due_date = None
            if due_date:
                try:
                    parsed_due_date = datetime.fromisoformat(due_date).date()
                except (ValueError, TypeError):
                    # Try alternative parsing (e.g., "tomorrow", "2026-02-10")
                    if due_date.lower() == "tomorrow":
                        parsed_due_date = (datetime.utcnow() + timedelta(days=1)).date()
                    else:
                        return {"success": False, "error": f"Invalid date format: {due_date}"}

            # Create task with user isolation
            task = Task(
                user_id=user_id,
                title=title.strip(),
                description=description.strip() if description else None,
                status="pending",
                priority=priority,
                due_date=parsed_due_date
            )

            self.session.add(task)
            self.session.commit()
            self.session.refresh(task)

            return {
                "success": True,
                "data": {
                    "task_id": str(task.id),
                    "title": task.title,
                    "status": task.status,
                    "priority": task.priority,
                    "due_date": task.due_date.isoformat() if task.due_date else None,
                    "created_at": task.created_at.isoformat() if task.created_at else None
                }
            }

        except Exception as e:
            self.session.rollback()
            return {"success": False, "error": f"Database error: {str(e)}"}

    def list_tasks(
        self,
        user_id: str,
        status_filter: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        List all tasks for user with optional status filter.

        Args:
            user_id: User ID from JWT token
            status_filter: "all", "pending", "completed" (default: all)

        Returns:
            Dict with success=True and list of tasks
        """
        try:
            # Build query with user isolation
            stmt = select(Task).where(Task.user_id == user_id)

            # Apply status filter if provided
            if status_filter and status_filter != "all":
                if status_filter not in ["pending", "completed"]:
                    return {"success": False, "error": "Status must be 'all', 'pending', or 'completed'"}
                stmt = stmt.where(Task.status == status_filter)

            # Order by due_date, then created_at
            stmt = stmt.order_by(Task.due_date.asc().nullsfirst(), Task.created_at.desc())

            tasks = self.session.exec(stmt).all()

            return {
                "success": True,
                "data": [
                    {
                        "task_id": str(task.id),
                        "title": task.title,
                        "description": task.description,
                        "status": task.status,
                        "priority": task.priority,
                        "due_date": task.due_date.isoformat() if task.due_date else None,
                        "created_at": task.created_at.isoformat() if task.created_at else None
                    }
                    for task in tasks
                ]
            }

        except Exception as e:
            return {"success": False, "error": f"Database error: {str(e)}"}

    def complete_task(
        self,
        user_id: str,
        task_id: str
    ) -> Dict[str, Any]:
        """
        Mark a task as completed.

        Args:
            user_id: User ID from JWT token
            task_id: Task ID to complete

        Returns:
            Dict with success=True and updated task, or 404 on not found
        """
        try:
            # Query with user isolation (prevents cross-user access)
            stmt = select(Task).where(
                (Task.id == int(task_id)) &
                (Task.user_id == user_id)
            )
            task = self.session.exec(stmt).first()

            if not task:
                return {"success": False, "error": "Task not found", "status_code": 404}

            # Update status
            task.status = "completed"
            self.session.add(task)
            self.session.commit()
            self.session.refresh(task)

            return {
                "success": True,
                "data": {
                    "task_id": str(task.id),
                    "title": task.title,
                    "status": task.status,
                    "completed_at": datetime.utcnow().isoformat()
                }
            }

        except ValueError:
            return {"success": False, "error": "Invalid task_id format"}
        except Exception as e:
            self.session.rollback()
            return {"success": False, "error": f"Database error: {str(e)}"}

    def delete_task(
        self,
        user_id: str,
        task_id: str
    ) -> Dict[str, Any]:
        """
        Delete a task permanently.

        Args:
            user_id: User ID from JWT token
            task_id: Task ID to delete

        Returns:
            Dict with success=True and deleted task info, or 404 on not found
        """
        try:
            # Query with user isolation
            stmt = select(Task).where(
                (Task.id == int(task_id)) &
                (Task.user_id == user_id)
            )
            task = self.session.exec(stmt).first()

            if not task:
                return {"success": False, "error": "Task not found", "status_code": 404}

            # Delete task
            self.session.delete(task)
            self.session.commit()

            return {
                "success": True,
                "data": {
                    "task_id": str(task.id),
                    "title": task.title,
                    "status": "deleted"
                }
            }

        except ValueError:
            return {"success": False, "error": "Invalid task_id format"}
        except Exception as e:
            self.session.rollback()
            return {"success": False, "error": f"Database error: {str(e)}"}

    def update_task(
        self,
        user_id: str,
        task_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        priority: Optional[str] = None,
        due_date: Optional[str] = None,
        status: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update specific fields of a task.

        Args:
            user_id: User ID from JWT token
            task_id: Task ID to update
            title: New title (optional)
            description: New description (optional)
            priority: New priority (optional)
            due_date: New due date (optional)
            status: New status (optional)

        Returns:
            Dict with success=True and updated task, or 404 on not found
        """
        try:
            # Query with user isolation
            stmt = select(Task).where(
                (Task.id == int(task_id)) &
                (Task.user_id == user_id)
            )
            task = self.session.exec(stmt).first()

            if not task:
                return {"success": False, "error": "Task not found", "status_code": 404}

            # Update provided fields
            if title is not None:
                if not title.strip():
                    return {"success": False, "error": "Title cannot be empty"}
                task.title = title.strip()

            if description is not None:
                task.description = description.strip() if description else None

            if priority is not None:
                if priority not in ["low", "medium", "high"]:
                    return {"success": False, "error": f"Priority must be low, medium, or high"}
                task.priority = priority

            if due_date is not None:
                try:
                    task.due_date = datetime.fromisoformat(due_date).date()
                except (ValueError, TypeError):
                    if due_date.lower() == "tomorrow":
                        task.due_date = (datetime.utcnow() + timedelta(days=1)).date()
                    else:
                        return {"success": False, "error": f"Invalid date format: {due_date}"}

            if status is not None:
                if status not in ["pending", "completed"]:
                    return {"success": False, "error": "Status must be 'pending' or 'completed'"}
                task.status = status

            self.session.add(task)
            self.session.commit()
            self.session.refresh(task)

            return {
                "success": True,
                "data": {
                    "task_id": str(task.id),
                    "title": task.title,
                    "description": task.description,
                    "status": task.status,
                    "priority": task.priority,
                    "due_date": task.due_date.isoformat() if task.due_date else None,
                    "updated_at": datetime.utcnow().isoformat()
                }
            }

        except ValueError:
            return {"success": False, "error": "Invalid task_id format"}
        except Exception as e:
            self.session.rollback()
            return {"success": False, "error": f"Database error: {str(e)}"}

    # ========================================================================
    # Tool Schema Definition (for MCP registration)
    # ========================================================================

    @staticmethod
    def get_tools_schema() -> List[Dict[str, Any]]:
        """
        Returns tool definitions wrapped in OpenAI Agents SDK format.
        **FIX**: Wraps each tool with {"type": "function", "function": {...}} structure
        required by OpenAI API.
        """
        # Define raw tool definitions
        tool_definitions = [
            {
                "name": "add_task",
                "description": "Create a new task with optional description, priority, and due date",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string", "description": "Task title (required)"},
                        "description": {"type": "string", "description": "Task description (optional)"},
                        "priority": {
                            "type": "string",
                            "enum": ["low", "medium", "high"],
                            "description": "Task priority (default: medium)"
                        },
                        "due_date": {"type": "string", "description": "Due date in ISO format or 'tomorrow' (optional)"}
                    },
                    "required": ["title"]
                }
            },
            {
                "name": "list_tasks",
                "description": "List all tasks for the user with optional status filter",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "status_filter": {
                            "type": "string",
                            "enum": ["all", "pending", "completed"],
                            "description": "Filter by status (default: all)"
                        }
                    }
                }
            },
            {
                "name": "complete_task",
                "description": "Mark a task as completed",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": {"type": "string", "description": "Task ID to complete"}
                    },
                    "required": ["task_id"]
                }
            },
            {
                "name": "delete_task",
                "description": "Delete a task permanently",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": {"type": "string", "description": "Task ID to delete"}
                    },
                    "required": ["task_id"]
                }
            },
            {
                "name": "update_task",
                "description": "Update specific fields of a task",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": {"type": "string", "description": "Task ID to update"},
                        "title": {"type": "string", "description": "New title (optional)"},
                        "description": {"type": "string", "description": "New description (optional)"},
                        "priority": {
                            "type": "string",
                            "enum": ["low", "medium", "high"],
                            "description": "New priority (optional)"
                        },
                        "due_date": {"type": "string", "description": "New due date (optional)"},
                        "status": {
                            "type": "string",
                            "enum": ["pending", "completed"],
                            "description": "New status (optional)"
                        }
                    },
                    "required": ["task_id"]
                }
            }
        ]

        # Wrap each tool in OpenAI format: {"type": "function", "function": {...}}
        return [
            {
                "type": "function",
                "function": tool
            }
            for tool in tool_definitions
        ]
