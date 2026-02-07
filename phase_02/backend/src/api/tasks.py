from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from uuid import UUID
from src.database.database import get_session
from src.models.task import Task
from src.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from datetime import datetime, timezone
from src.api.deps import get_current_user

router = APIRouter()

@router.post("/{user_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(user_id: str, task: TaskCreate, current_user = Depends(get_current_user), session: Session = Depends(get_session)):
    """Create a new task for a user - only allowed if user_id matches authenticated user"""
    # Verify that the user_id in the path matches the authenticated user
    if current_user["id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create tasks for this user"
        )

    db_task = Task(
        **task.model_dump(),
        user_id=user_id
    )
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@router.get("/{user_id}/tasks", response_model=List[TaskResponse])
def get_user_tasks(user_id: str, current_user = Depends(get_current_user), session: Session = Depends(get_session)):
    """Get all tasks for a user - only allowed if user_id matches authenticated user"""
    # Verify that the user_id in the path matches the authenticated user
    if current_user["id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view tasks for this user"
        )

    statement = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
    tasks = session.exec(statement).all()
    return tasks

@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
def get_task(user_id: str, task_id: str, current_user = Depends(get_current_user), session: Session = Depends(get_session)):
    """Get a specific task - only allowed if user_id matches authenticated user"""
    # Verify that the user_id in the path matches the authenticated user
    if current_user["id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this task"
        )

    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.patch("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
def update_task(user_id: str, task_id: str, task_update: TaskUpdate, current_user = Depends(get_current_user), session: Session = Depends(get_session)):
    """Update a task - only allowed if user_id matches authenticated user"""
    # Verify that the user_id in the path matches the authenticated user
    if current_user["id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this task"
        )

    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    db_task = session.exec(statement).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)

    db_task.updated_at = datetime.now(timezone.utc)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@router.delete("/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(user_id: str, task_id: str, current_user = Depends(get_current_user), session: Session = Depends(get_session)):
    """Delete a task - only allowed if user_id matches authenticated user"""
    # Verify that the user_id in the path matches the authenticated user
    if current_user["id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this task"
        )

    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(task)
    session.commit()
    return None