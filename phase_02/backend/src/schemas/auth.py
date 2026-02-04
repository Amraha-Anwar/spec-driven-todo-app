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
    email_verified: bool = Field(alias="emailVerified")  # ✅ Support both names
    name: str
    image: Optional[str] = None
    created_at: datetime = Field(alias="createdAt")  # ✅ Support both names
    updated_at: datetime = Field(alias="updatedAt")  # ✅ Support both names

    class Config:
        populate_by_name = True  # ✅ Allow both snake_case and camelCase
        from_attributes = True