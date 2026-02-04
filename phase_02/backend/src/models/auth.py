from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional


class Account(SQLModel, table=True):
    __tablename__ = "account"
    
    id: str = Field(primary_key=True)
    accountId: str = Field(nullable=False, alias="account_id")  # ✅ camelCase with alias
    providerId: str = Field(nullable=False, alias="provider_id")  # ✅ camelCase with alias
    userId: str = Field(foreign_key="user.id", nullable=False, index=True, alias="user_id")  # ✅ camelCase with alias
    accessToken: Optional[str] = Field(default=None, nullable=True, alias="access_token")
    refreshToken: Optional[str] = Field(default=None, nullable=True, alias="refresh_token")
    idToken: Optional[str] = Field(default=None, nullable=True, alias="id_token")
    accessTokenExpiresAt: Optional[datetime] = Field(default=None, nullable=True, alias="access_token_expires_at")
    refreshTokenExpiresAt: Optional[datetime] = Field(default=None, nullable=True, alias="refresh_token_expires_at")
    scope: Optional[str] = Field(default=None, nullable=True)
    password: Optional[str] = Field(default=None, nullable=True)
    createdAt: datetime = Field(default_factory=datetime.utcnow, nullable=False, alias="created_at")
    updatedAt: datetime = Field(default_factory=datetime.utcnow, nullable=False, alias="updated_at")


class Session(SQLModel, table=True):
    __tablename__ = "session"
    
    id: str = Field(primary_key=True)
    expiresAt: datetime = Field(nullable=False, alias="expires_at")
    token: str = Field(unique=True, nullable=False, index=True)
    createdAt: datetime = Field(default_factory=datetime.utcnow, nullable=False, alias="created_at")
    updatedAt: datetime = Field(default_factory=datetime.utcnow, nullable=False, alias="updated_at")
    ipAddress: Optional[str] = Field(default=None, nullable=True, alias="ip_address")
    userAgent: Optional[str] = Field(default=None, nullable=True, alias="user_agent")
    userId: str = Field(foreign_key="user.id", nullable=False, index=True, alias="user_id")


class Verification(SQLModel, table=True):
    __tablename__ = "verification"
    
    id: str = Field(primary_key=True)
    identifier: str = Field(nullable=False, index=True)
    value: str = Field(nullable=False)
    expiresAt: datetime = Field(nullable=False, alias="expires_at")
    createdAt: Optional[datetime] = Field(default_factory=datetime.utcnow, nullable=True, alias="created_at")
    updatedAt: Optional[datetime] = Field(default_factory=datetime.utcnow, nullable=True, alias="updated_at")