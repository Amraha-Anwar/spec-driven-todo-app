from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import Session
from src.db.session import get_session
from src.schemas.auth import UserSignupRequest, UserResponse, UserLoginRequest
from src.services.auth_service import create_user, authenticate_user, get_user_session

router = APIRouter()

@router.post("/sign-up/email", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup_email(user_in: UserSignupRequest, session: Session = Depends(get_session)):
    """Handles User Signup and Account creation"""
    return create_user(session, user_in)

@router.post("/sign-in/email")
def signin_email(login_data: UserLoginRequest, session: Session = Depends(get_session)):
    """Handles User Login and credential verification"""
    return authenticate_user(session, login_data)

@router.get("/get-session")
def get_session_route(session: Session = Depends(get_session)):
    """Retrieves current user session for the dashboard"""
    return get_user_session(session)