"""
TaskToolbox: MCP Server implementation for Task CRUD operations
Task IDs: T011, T012 - Implements add_task, list_tasks, delete_task, update_task, complete_task
Handles user-isolated database operations with parameterized queries
"""

import json
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from uuid import UUID, uuid4

from sqlmodel import Session, select, delete

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
                    "id": str(task.id),
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

            task_data = [
                {
                    "id": str(task.id),
                    "title": task.title,
                    "description": task.description,
                    "status": task.status,
                    "priority": task.priority,
                    "due_date": task.due_date.isoformat() if task.due_date else None,
                    "created_at": task.created_at.isoformat() if task.created_at else None
                }
                for task in tasks
            ]

            # **FORCE DATA GROUNDING**: Include critical message for LLM
            # This prevents the agent from hallucinating an empty list
            task_count = len(task_data)
            if task_count > 0:
                grounding_message = f"CRITICAL: The following {task_count} tasks ARE in the database: {[t['title'] for t in task_data]}. You MUST list all these tasks. Do not say the list is empty. Do not hallucinate."
            else:
                grounding_message = "CRITICAL: There are 0 tasks in the database. The list IS empty."

            return {
                "success": True,
                "data": task_data,
                "grounding_message": grounding_message,
                "task_count": task_count
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
                (Task.id == UUID(task_id)) &
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
                    "id": str(task.id),
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

        **MANDATORY FIX #3: Automated Resolution**
        If task_id is a name (not numeric), internally resolve it to actual ID.
        FORBIDDEN to ask user for ID - tool must handle internally.

        Args:
            user_id: User ID from JWT token
            task_id: Task ID (numeric) or task name (string like "Read book")

        Returns:
            Dict with success=True and deleted task info, or 404 on not found
        """
        try:
            # Validate task_id format first
            if not task_id or task_id == "0" or task_id == "null":
                return {"success": False, "error": "Invalid task_id: cannot be null, 0, or empty"}

            # **MANDATORY FIX #3**: Check if task_id is already a UUID (valid format)
            from uuid import UUID as UUIDType
            is_uuid = False
            try:
                UUIDType(task_id)
                is_uuid = True
            except ValueError:
                pass

            # If not a UUID, try fuzzy resolution
            if not is_uuid:
                print(f"DEBUG: delete_task received name '{task_id}' - resolving to ID...")
                # Fetch all tasks for this user
                list_result = self.list_tasks(user_id=user_id, status_filter='all')
                available_tasks = list_result.get('data', []) if list_result.get('success') else []

                if not available_tasks:
                    return {"success": False, "error": f"No tasks found to match '{task_id}'"}

                # Try to find exact match or fuzzy match
                matched_task = None
                for task in available_tasks:
                    if task.get('title', '').lower() == task_id.lower():
                        matched_task = task
                        break

                if not matched_task:
                    # Try fuzzy match
                    for task in available_tasks:
                        if task_id.lower() in task.get('title', '').lower():
                            matched_task = task
                            break

                if not matched_task:
                    task_names = [f"'{t.get('title')}'" for t in available_tasks]
                    return {
                        "success": False,
                        "error": f"No task matching '{task_id}' found. Available: {', '.join(task_names)}"
                    }

                task_id_int = matched_task.get('id')
                print(f"DEBUG: Resolved '{task_id}' to Task ID {task_id_int}")
            else:
                # Already a valid UUID string
                task_id_int = task_id

            # Query to fetch task and verify ownership (user isolation)
            stmt = select(Task).where(
                (Task.id == UUID(task_id_int)) &
                (Task.user_id == user_id)
            )
            task = self.session.exec(stmt).first()

            if not task:
                print(f"DEBUG: Task not found - ID {task_id} for User {user_id}")
                return {"success": False, "error": "Task not found", "status_code": 404}

            # Store task info before deletion
            task_id_int = task.id
            task_title = task.title

            # Use SQL DELETE with user isolation (MANDATORY FIX #1)
            print(f"DEBUG: Executing DELETE on Task ID {task_id_int} for User {user_id}")
            delete_stmt = delete(Task).where(
                (Task.id == UUID(str(task_id_int))) &
                (Task.user_id == user_id)
            )
            self.session.execute(delete_stmt)
            self.session.commit()
            print(f"DEBUG: DELETE committed for Task ID {task_id_int}")

            # Verify deletion by re-querying
            verify_stmt = select(Task).where(
                (Task.id == UUID(str(task_id_int))) &
                (Task.user_id == user_id)
            )
            verify_task = self.session.exec(verify_stmt).first()

            if verify_task is not None:
                print(f"DEBUG: VERIFICATION FAILED - Task ID {task_id_int} still exists after DELETE")
                return {"success": False, "error": "Deletion verification failed - task still exists in database"}

            print(f"DEBUG: VERIFICATION SUCCESS - Task ID {task_id_int} confirmed deleted")
            return {
                "success": True,
                "data": {
                    "id": str(task_id_int),
                    "title": task_title,
                    "status": "deleted"
                }
            }

        except ValueError as ve:
            print(f"DEBUG: ValueError in delete_task - {str(ve)}")
            return {"success": False, "error": "Invalid task_id format"}
        except Exception as e:
            print(f"DEBUG: Exception in delete_task - {str(e)}")
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

        **MANDATORY FIX #3: Automated Resolution**
        If task_id is a name (not numeric), internally resolve it to actual ID.
        FORBIDDEN to ask user for ID - tool must handle internally.

        Args:
            user_id: User ID from JWT token
            task_id: Task ID (numeric) or task name (string like "Read book")
            title: New title (optional)
            description: New description (optional)
            priority: New priority (optional)
            due_date: New due date (optional)
            status: New status (optional)

        Returns:
            Dict with success=True and updated task, or 404 on not found
        """
        try:
            # Validate task_id format first
            if not task_id or task_id == "0" or task_id == "null":
                return {"success": False, "error": "Invalid task_id: cannot be null, 0, or empty"}

            # **MANDATORY FIX #3**: Check if task_id is already a UUID (valid format)
            from uuid import UUID as UUIDType
            is_uuid = False
            try:
                UUIDType(task_id)
                is_uuid = True
            except ValueError:
                pass

            # If not a UUID, try fuzzy resolution
            if not is_uuid:
                print(f"DEBUG: update_task received name '{task_id}' - resolving to ID...")
                # Fetch all tasks for this user
                list_result = self.list_tasks(user_id=user_id, status_filter='all')
                available_tasks = list_result.get('data', []) if list_result.get('success') else []

                if not available_tasks:
                    return {"success": False, "error": f"No tasks found to match '{task_id}'"}

                # Try to find exact match or fuzzy match
                matched_task = None
                for task in available_tasks:
                    if task.get('title', '').lower() == task_id.lower():
                        matched_task = task
                        break

                if not matched_task:
                    # Try fuzzy match
                    for task in available_tasks:
                        if task_id.lower() in task.get('title', '').lower():
                            matched_task = task
                            break

                if not matched_task:
                    task_names = [f"'{t.get('title')}'" for t in available_tasks]
                    return {
                        "success": False,
                        "error": f"No task matching '{task_id}' found. Available: {', '.join(task_names)}"
                    }

                task_id_int = matched_task.get('id')
                print(f"DEBUG: Resolved '{task_id}' to Task ID {task_id_int}")
            else:
                # Already a valid UUID string
                task_id_int = task_id

            # Use session.get() for efficient fetching (MANDATORY FIX #3)
            task = self.session.get(Task, UUID(task_id_int))

            if not task or task.user_id != user_id:
                print(f"DEBUG: Task not found or access denied - ID {task_id_int} for User {user_id}")
                return {"success": False, "error": "Task not found", "status_code": 404}

            # Build list of updates for validation
            updates = {}

            # Validate all updates before applying (fail-fast validation)
            if title is not None:
                if not title.strip():
                    return {"success": False, "error": "Title cannot be empty"}
                updates["title"] = title.strip()

            if description is not None:
                updates["description"] = description.strip() if description else None

            if priority is not None:
                if priority not in ["low", "medium", "high"]:
                    return {"success": False, "error": f"Priority must be low, medium, or high"}
                updates["priority"] = priority

            if due_date is not None:
                try:
                    updates["due_date"] = datetime.fromisoformat(due_date).date()
                except (ValueError, TypeError):
                    if due_date.lower() == "tomorrow":
                        updates["due_date"] = (datetime.utcnow() + timedelta(days=1)).date()
                    else:
                        return {"success": False, "error": f"Invalid date format: {due_date}"}

            if status is not None:
                if status not in ["pending", "completed"]:
                    return {"success": False, "error": "Status must be 'pending' or 'completed'"}
                updates["status"] = status

            # Apply updates using explicit setattr loop (MANDATORY FIX #3)
            print(f"DEBUG: Executing UPDATE on Task ID {task_id_int} for User {user_id} with fields: {list(updates.keys())}")
            for field_name, field_value in updates.items():
                setattr(task, field_name, field_value)

            # Commit and refresh
            self.session.add(task)
            self.session.commit()
            print(f"DEBUG: UPDATE committed for Task ID {task_id_int}")
            self.session.refresh(task)
            print(f"DEBUG: VERIFICATION SUCCESS - Task ID {task_id_int} refreshed after UPDATE")

            return {
                "success": True,
                "data": {
                    "id": str(task.id),
                    "title": task.title,
                    "description": task.description,
                    "status": task.status,
                    "priority": task.priority,
                    "due_date": task.due_date.isoformat() if task.due_date else None,
                    "updated_at": datetime.utcnow().isoformat()
                }
            }

        except ValueError as ve:
            print(f"DEBUG: ValueError in update_task - {str(ve)}")
            return {"success": False, "error": "Invalid task_id format"}
        except Exception as e:
            print(f"DEBUG: Exception in update_task - {str(e)}")
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
