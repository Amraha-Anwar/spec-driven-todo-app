from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserSignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    image: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    email_verified: bool = Field(alias="emailVerified")
    name: str
    image: Optional[str] = None
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    class Config:
        populate_by_name = True
        from_attributes = True

# ✅ ADD ONLY THIS CLASS TO RESOLVE THE IMPORT ERROR
class UserLoginRequest(BaseModel):
    """Missing class that was causing the ImportError"""
    email: EmailStr
    password: str