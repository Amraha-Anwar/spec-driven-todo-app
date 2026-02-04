---
name: jwt-fastapi-bridge
description: Standardized bridge for FastAPI backends to verify JWT tokens issued by Better Auth (Next.js) and enforce user-specific data isolation using SQLModel. Use this when implementing cross-language authentication or securing Python APIs with Next.js frontend credentials.
---

# JWT FastAPI Bridge

This skill provides a standardized workflow for bridging TypeScript authentication (Better Auth) with Python API security (FastAPI/SQLModel).

## Summary
This skill bridges TypeScript-based authentication from a Next.js frontend with Python API security to ensure consistent identity verification across the stack.

## Prerequisites
- **FastAPI**: The Python web framework.
- **SQLModel**: An ORM that combines SQLAlchemy and Pydantic for data handling and isolation.
- **python-jose**: A library used for signing and verifying JWTs (JSON Web Tokens).
- **BETTER_AUTH_SECRET**: A shared environment variable used to sign and verify the tokens.

## Implementation Instructions

### 1. Create a JWT Verification Dependency
In FastAPI, **Dependency Injection** is a pattern where the framework handles providing the necessary components (like an authenticated user) to your route functions automatically.

```python
import os
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

ALGORITHM = "HS256"
SECRET_KEY = os.environ.get("BETTER_AUTH_SECRET")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user_id(token: str = Depends(oauth2_scheme)):
    try:
        # Decode the token using the shared secret
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Extract "Claims" (key-value pairs inside the JWT containing user data)
        user_id: str = payload.get("sub") or payload.get("id")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token claims")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
```

### 2. Enforce Data Isolation with SQLModel
Use the extracted `user_id` to filter database queries, ensuring users can only access their own data.

```python
from sqlmodel import Session, select
from .database import engine
from .models import Item

@app.get("/items")
def read_items(user_id: str = Depends(get_current_user_id)):
    with Session(engine) as session:
        # Filter the query by user_id to isolate data
        statement = select(Item).where(Item.user_id == user_id)
        results = session.exec(statement).all()
        return results
```

## Troubleshooting

- **Signature verification failed**: This usually means the `BETTER_AUTH_SECRET` in Python does not match the secret used by Better Auth in Next.js. Compare the values in both `.env` files.
- **401 Unauthorized (Clock Skew)**: Authentication can fail if the server's clock and the user's clock are out of sync. Use the `leeway` parameter in `jwt.decode` to allow for a few seconds of difference: `jwt.decode(..., leeway=10)`.
- **Token Format Error**: Ensure the frontend is sending the token in the `Authorization: Bearer <token>` header format.
