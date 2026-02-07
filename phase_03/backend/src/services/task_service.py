from sqlmodel import Session, select
from src.models.task import Task
from src.schemas.task import TaskCreate, TaskUpdate
from fastapi import HTTPException, status
import uuid

def create_task(session: Session, task_in: TaskCreate, user_id: str) -> Task:
    task = Task(**task_in.model_dump(), user_id=user_id)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

def get_tasks(session: Session, user_id: str, skip: int = 0, limit: int = 100) -> list[Task]:
    statement = select(Task).where(Task.user_id == user_id).offset(skip).limit(limit)
    return session.exec(statement).all()

def get_task(session: Session, task_id: uuid.UUID, user_id: str) -> Task:
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    if task.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this task")
    return task

def update_task(session: Session, task_id: uuid.UUID, task_in: TaskUpdate, user_id: str) -> Task:
    task = get_task(session, task_id, user_id)
    task_data = task_in.model_dump(exclude_unset=True)
    for key, value in task_data.items():
        setattr(task, key, value)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

def delete_task(session: Session, task_id: uuid.UUID, user_id: str):
    task = get_task(session, task_id, user_id)
    session.delete(task)
    session.commit()