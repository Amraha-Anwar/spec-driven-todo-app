# Quickstart: Auth JWT Bridge

## Prerequisites
- Node.js 18+
- Python 3.11+
- Neon DB Project (connection string ready)
- `.env` file configured with `BETTER_AUTH_SECRET` and `DATABASE_URL`

## Setup

1. **Install Dependencies**:
   ```bash
   # Backend
   cd backend
   uv sync
   
   # Frontend
   cd frontend
   npm install
   ```

2. **Environment Configuration**:
   Ensure `.env` in both `frontend/` and `backend/` contains:
   ```env
   BETTER_AUTH_SECRET=your_shared_secret_value
   BETTER_AUTH_URL=http://localhost:3000
   DATABASE_URL=postgres://user:pass@host/db?sslmode=require
   ```

3. **Run Migrations**:
   ```bash
   cd backend
   uv run alembic upgrade head
   ```

## Running the App

1. **Start Backend**:
   ```bash
   cd backend
   uv run fastapi dev src/main.py
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

## Verification

### 1. Signup Flow
- POST `http://localhost:3000/api/auth/signup/email`
- Body: `{"email": "test@example.com", "password": "password123", "name": "Test User"}`
- Expect: 201 Created
- Check DB: `SELECT * FROM user WHERE email = 'test@example.com';`

### 2. Protected Route (Tasks)
- Login via Frontend to get JWT.
- GET `http://localhost:8000/tasks` with Header `Authorization: Bearer <jwt_token>`
- Expect: 200 OK (Empty list initially)

### 3. Isolation Test
- Create User A and User B.
- Create Task for User A.
- Try to access User A's task using User B's token.
- Expect: 403 Forbidden / 404 Not Found (depending on implementation, 403 preferred).
