from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID 

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_completed: bool = False
    priority: Optional[str] = "medium"  # ✅ NEW
    due_date: Optional[datetime] = None  # ✅ NEW


class TaskCreate(TaskBase):
    """Schema for creating a new task"""
    pass


class TaskUpdate(BaseModel):
    """Schema for updating a task - all fields optional"""
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    priority: Optional[str] = None  # ✅ NEW
    due_date: Optional[datetime] = None  # ✅ NEW


class TaskResponse(TaskBase):
    """Schema for task response"""
    id: UUID 
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True