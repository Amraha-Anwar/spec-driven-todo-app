from fastapi import APIRouter, Depends  
from src.api.deps import get_current_user_optional
from src.models.user import User
from typing import Optional

router = APIRouter()

@router.get("/verification-status")
def get_verification_status(current_user: Optional[User] = Depends(get_current_user_optional)):
    """Get current user's email verification status with optional authentication"""
    if current_user is None:
        return {"verified": False}

    return {"verified": current_user.emailVerified}  # ✅ Use camelCase