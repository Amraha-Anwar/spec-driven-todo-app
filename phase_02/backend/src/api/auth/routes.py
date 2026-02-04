from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from src.db.session import get_session
from src.schemas.auth import UserSignupRequest, UserResponse
from src.services.auth_service import create_user

router = APIRouter()

@router.post("/sign-up/email", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup_email(user_in: UserSignupRequest, session: Session = Depends(get_session)):
    print("HIT SIGNUP ROUTE", user_in)
    return create_user(session, user_in)
