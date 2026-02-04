from fastapi import Depends, HTTPException, status
from sqlmodel import Session
from typing import Optional  
from src.database.database import get_session
from src.core.security import verify_session_token, verify_session_token_optional
from src.models.user import User

def get_current_user(
    session_data: dict = Depends(verify_session_token),
    session: Session = Depends(get_session)
) -> User:
    """
    Validates session token and fetches user from DB.
    """
    user_data = session_data.get("user")
    if not user_data:
        print("❌ No user in session data")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No user in session",
        )

    user_id = user_data.get("id")
    if not user_id:
        print("❌ No user ID in session")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user data",
        )

    user = session.get(User, user_id)
    if not user:
        print(f"❌ User not found for ID: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    print(f"✅ Authenticated user: {user.email}")
    return user


def get_current_user_optional(
    session_data: Optional[dict] = Depends(verify_session_token_optional),
    session: Session = Depends(get_session)
) -> Optional[User]:
    """
    Optional authentication - returns None if not authenticated.
    """
    if not session_data:
        return None

    user_data = session_data.get("user")
    if not user_data:
        return None

    user_id = user_data.get("id")
    if not user_id:
        return None

    user = session.get(User, user_id)
    return user