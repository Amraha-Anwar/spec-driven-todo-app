import os
from fastapi import HTTPException, Security, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from src.models.auth import Session as SessionModel
from src.database.database import get_session as get_db_session
from datetime import datetime, timezone
from typing import Optional # Lazmi import karein taake Optional verification chale

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> dict:
    """
    Verifies the session token and returns user info. 
    In Phase II, this ensures user isolation for tasks.
    """
    token = credentials.credentials
    
    # Database session management
    db = next(get_db_session())
    
    try:
        # Search for the session record in the database
        statement = select(SessionModel).where(SessionModel.token == token)
        session_record = db.exec(statement).first()
        
        if not session_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Timezone-aware expiration check
        current_time = datetime.now(timezone.utc)
        expires_at = session_record.expiresAt
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        
        if expires_at < current_time:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return {
            "id": session_record.userId,
            "session_id": session_record.id
        }
        
    finally:
        db.close()

def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(HTTPBearer(auto_error=False))
) -> Optional[dict]:
    """
    Optional authentication for public routes or dynamic UI.
    """
    if not credentials:
        return None
    try:
        return get_current_user(credentials)
    except HTTPException:
        return None