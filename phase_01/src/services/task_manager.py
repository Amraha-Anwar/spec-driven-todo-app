"""
Task Manager service for the Console TODO Application.

This module provides business logic for task management including
CRUD operations, validation, and ID generation.
"""

from typing import Optional
from src.models.task import Task


class ValidationError(Exception):
    """Raised when input validation fails (e.g., empty title)."""

    pass


class TaskNotFoundError(Exception):
    """Raised when task ID doesn't exist in storage."""

    def __init__(self, task_id: int):
        self.task_id = task_id
        super().__init__(f"Task ID {task_id} not found")


class TaskManager:
    """
    Manages task lifecycle and business logic.

    Responsibilities:
        - Task CRUD operations
        - ID generation (sequential)
        - Input validation
        - In-memory storage

    State:
        - tasks: dict[int, Task] - ID to Task mapping
        - next_id: int - Next available ID (starts at 1)
    """

    def __init__(self):
        """Initialize TaskManager with empty storage."""
        self.tasks: dict[int, Task] = {}
        self.next_id: int = 1

    def create(self, title: str, description: str) -> Task:
        """
        Create a new task with the given title and description.

        Args:
            title: Task title (required, must be non-empty)
            description: Task description (optional, can be empty)

        Returns:
            The created Task object

        Raises:
            ValidationError: If title is empty after stripping whitespace
        """
        title_stripped = title.strip()
        if not title_stripped:
            raise ValidationError("Title cannot be empty")

        task = Task(
            id=self.next_id,
            title=title_stripped,
            description=description.strip(),
            is_complete=False,
        )
        self.tasks[self.next_id] = task
        self.next_id += 1
        return task

    def get_all(self) -> list[Task]:
        """
        Get all tasks sorted by ID (ascending).

        Returns:
            List of all tasks ordered by ID
        """
        return sorted(self.tasks.values(), key=lambda t: t.id)

    def get(self, task_id: int) -> Optional[Task]:
        """
        Get a task by ID.

        Args:
            task_id: ID of the task to retrieve

        Returns:
            Task object if found, None otherwise
        """
        return self.tasks.get(task_id)

    def toggle_complete(self, task_id: int) -> None:
        """
        Toggle completion status of a task.

        Args:
            task_id: ID of the task to toggle

        Raises:
            TaskNotFoundError: If task_id doesn't exist
        """
        task = self.tasks.get(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)

        task.is_complete = not task.is_complete

    def update(self, task_id: int, title: str, description: str) -> None:
        """
        Update a task's title and description.

        Args:
            task_id: ID of the task to update
            title: New title (required, must be non-empty)
            description: New description (optional, can be empty)

        Raises:
            ValidationError: If title is empty after stripping whitespace
            TaskNotFoundError: If task_id doesn't exist
        """
        task = self.tasks.get(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)

        title_stripped = title.strip()
        if not title_stripped:
            raise ValidationError("Title cannot be empty")

        task.title = title_stripped
        task.description = description.strip()

    def delete(self, task_id: int) -> None:
        """
        Delete a task by ID.

        Args:
            task_id: ID of the task to delete

        Raises:
            TaskNotFoundError: If task_id doesn't exist
        """
        if task_id not in self.tasks:
            raise TaskNotFoundError(task_id)

        del self.tasks[task_id]
