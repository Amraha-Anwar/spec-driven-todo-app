from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List 

class User(SQLModel, table=True):
    __tablename__ = "user"
    
    id: str = Field(primary_key=True)
    name: str = Field(nullable=False)
    email: str = Field(unique=True, nullable=False, index=True)
    emailVerified: bool = Field(default=False, nullable=False)  # ✅ Changed to camelCase
    image: Optional[str] = Field(default=None, nullable=True)
    createdAt: datetime = Field(default_factory=datetime.utcnow, nullable=False)  # ✅ Changed to camelCase
    updatedAt: datetime = Field(default_factory=datetime.utcnow, nullable=False)  # ✅ Changed to camelCase

    tasks: List["Task"] = Relationship(back_populates="user")