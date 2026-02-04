from sqlmodel import Session
from src.models.user import User
from src.models.auth import Account
from src.schemas.auth import UserSignupRequest
import bcrypt
import uuid
from datetime import datetime, timezone
from fastapi import HTTPException, status

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def create_user(session: Session, user_in: UserSignupRequest) -> User:
    existing_user = session.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        print(f"❌ User already exists: {user_in.email}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists"
        )

    try:
        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        
        # ✅ Use camelCase field names
        db_user = User(
            id=user_id,
            email=user_in.email,
            name=user_in.name,
            image=user_in.image,
            emailVerified=False,  # ✅ camelCase
            createdAt=now,        # ✅ camelCase
            updatedAt=now         # ✅ camelCase
        )
        session.add(db_user)
        
        account_id = str(uuid.uuid4())
        db_account = Account(
            id=account_id,
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
        print(f"✅ User created successfully: {db_user.email}")
        return db_user
    except Exception as e:
        session.rollback()
        print(f"❌ Error creating user: {e}")
        raise e