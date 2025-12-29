"""
Task data model for the Console TODO Application.

This module defines the Task entity with its attributes and constraints.
"""

from dataclasses import dataclass


@dataclass
class Task:
    """
    Represents a single TODO task.

    Attributes:
        id: Unique sequential identifier (immutable, assigned by TaskManager)
        title: Task title (required, mutable)
        description: Optional task details (mutable)
        is_complete: Completion status (mutable)

    Invariants:
        - id is always positive integer
        - title is never empty string
        - description can be empty string
        - is_complete is boolean only
    """

    id: int
    title: str
    description: str
    is_complete: bool
