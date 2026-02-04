import os
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from src.models.auth import Session as SessionModel
from src.database.database import get_session as get_db_session
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

security = HTTPBearer()

def verify_session_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> dict:
    """
    Verifies the session token by querying the database directly.
    Returns session data with user info if valid.
    """
    token = credentials.credentials
    
    print(f"🔍 Verifying session token: {token[:20]}...")
    
    # Get database session
    db = next(get_db_session())
    
    try:
        # Query the session table directly
        statement = select(SessionModel).where(SessionModel.token == token)
        session_record = db.exec(statement).first()
        
        if not session_record:
            print(f"❌ No session found for token: {token[:20]}...")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # ✅ FIX: Make both datetimes timezone-aware for comparison
        current_time = datetime.now(timezone.utc)
        expires_at = session_record.expiresAt
        
        # If expiresAt is naive (no timezone), make it UTC
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        
        # Check if session is expired
        if expires_at < current_time:
            print(f"❌ Session expired at: {expires_at}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        print(f"✅ Valid session for user: {session_record.userId}")
        
        # Return session data in expected format
        return {
            "user": {"id": session_record.userId},
            "session": {
                "id": session_record.id,
                "userId": session_record.userId,
                "expiresAt": expires_at.isoformat(),
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error validating session: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session validation failed",
            headers={"WWW-Authenticate": "Bearer"},
        )
    finally:
        db.close()


security_optional = HTTPBearer(auto_error=False)

def verify_session_token_optional(
    credentials: HTTPAuthorizationCredentials = Security(security_optional)
):
    """Optional session verification"""
    if not credentials or not credentials.credentials:
        return None

    try:
        return verify_session_token(credentials)
    except HTTPException:
        return None
    except Exception as e:
        print(f"⚠️ Optional verification error: {e}")
        return None