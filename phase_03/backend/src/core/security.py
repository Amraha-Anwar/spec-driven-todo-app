import os
import bcrypt
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from src.models.auth import Session as SessionModel
from src.database.database import get_session as get_db_session
from datetime import datetime, timezone
from typing import Optional

security = HTTPBearer()

# --- Password Hashing Logic ---
def get_password_hash(password: str) -> str:
    """Hashes a password using bcrypt"""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the hashed version"""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )

# --- Session Validation Logic ---
def verify_session_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> dict:
    token = credentials.credentials
    db = next(get_db_session())
    
    try:
        statement = select(SessionModel).where(SessionModel.token == token)
        session_record = db.exec(statement).first()
        
        if not session_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="invalid token",
            )
        
        current_time = datetime.now(timezone.utc)
        expires_at = session_record.expiresAt
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        
        if expires_at < current_time:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired",
            )
        
        return {"user": {"id": session_record.userId}}
        
    finally:
        db.close()

security_optional = HTTPBearer(auto_error=False)

def verify_session_token_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_optional)
) -> Optional[dict]:
    if not credentials or not credentials.credentials:
        return None
    try:
        return verify_session_token(credentials)
    except Exception:
        return None