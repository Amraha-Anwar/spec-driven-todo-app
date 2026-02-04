from sqlmodel import Session, select
from fastapi import HTTPException, status
from src.models.user import User
from src.models.auth import Account
from src.schemas.auth import UserSignupRequest, UserLoginRequest
from src.core.security import get_password_hash, verify_password
import uuid
from datetime import datetime, timezone, timedelta

def create_user(session: Session, user_in: UserSignupRequest) -> User:
    existing_user = session.exec(select(User).where(User.email == user_in.email)).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")

    try:
        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        db_user = User(
            id=user_id,
            email=user_in.email,
            name=user_in.name,
            image=user_in.image,
            emailVerified=False,
            createdAt=now,
            updatedAt=now
        )
        session.add(db_user)
        session.flush()

        db_account = Account(
            id=str(uuid.uuid4()),
            userId=user_id,
            accountId=user_id,
            providerId="credential",
            password=get_password_hash(user_in.password),
            createdAt=now,
            updatedAt=now
        )
        session.add(db_account)
        session.commit()
        session.refresh(db_user)
        return db_user
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

def authenticate_user(session: Session, login_data: UserLoginRequest):
    """Aapki logic with redirection fix"""
    user = session.exec(select(User).where(User.email == login_data.email)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    account = session.exec(select(Account).where(Account.userId == user.id)).first()
    if not account or not verify_password(login_data.password, account.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # --- REDIRECTION FIX: Standard Better-Auth Response Structure ---
    token = str(uuid.uuid4())
    expires_at = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat().replace("+00:00", "Z")
    
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "image": user.image,
            "emailVerified": user.emailVerified,
            "createdAt": user.createdAt.isoformat() if hasattr(user.createdAt, 'isoformat') else str(user.createdAt),
            "updatedAt": user.updatedAt.isoformat() if hasattr(user.updatedAt, 'isoformat') else str(user.updatedAt)
        },
        "session": {
            "id": str(uuid.uuid4()),
            "token": token,
            "userId": user.id,
            "expiresAt": expires_at 
        }
    }

def get_user_session(session: Session):
    return {"status": "authenticated", "message": "Session is valid"}