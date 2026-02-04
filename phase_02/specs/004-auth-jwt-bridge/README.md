# Auth JWT Bridge Feature

## Status
Implemented and Tested.

## Components
- **Backend**: FastAPI with `jwt-fastapi-bridge` (manual verification), SQLModel entities (User, Task, etc.), Atomic Signup endpoint.
- **Frontend**: Better Auth configuration.

## Testing
Run backend tests:
```bash
cd backend
uv run pytest tests/
```

## Key Decisions
- String IDs for Users (matches Better Auth).
- Strict atomic transaction for Signup.
- Manual JWT verification using `BETTER_AUTH_SECRET`.
- Cascade Delete at DB level.
