import pytest
import jwt
import os
from fastapi import HTTPException
from src.core.security import verify_jwt
from fastapi.security import HTTPAuthorizationCredentials

# Mock env var for testing if not present (though .env is loaded in security.py)
# Ideally we patch os.getenv or the loaded module variable.
SECRET = os.getenv("BETTER_AUTH_SECRET", "test_secret")

def create_token(payload, secret=SECRET):
    return jwt.encode(payload, secret, algorithm="HS256")

def test_verify_jwt_valid():
    payload = {"sub": "user123", "exp": 9999999999}
    token = create_token(payload)
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    decoded = verify_jwt(creds)
    assert decoded["sub"] == "user123"

def test_verify_jwt_expired():
    # Past timestamp
    payload = {"sub": "user123", "exp": 1} 
    token = create_token(payload)
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    with pytest.raises(HTTPException) as excinfo:
        verify_jwt(creds)
    assert excinfo.value.status_code == 401
    assert "expired" in excinfo.value.detail

def test_verify_jwt_invalid_signature():
    payload = {"sub": "user123"}
    token = create_token(payload, secret="wrong_secret")
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    with pytest.raises(HTTPException) as excinfo:
        verify_jwt(creds)
    assert excinfo.value.status_code == 401
    assert "Invalid token" in excinfo.value.detail
