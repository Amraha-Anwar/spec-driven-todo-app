# Phase II - Full-Stack Todo Application

A premium, secure, multi-user todo application built with Next.js 16 and FastAPI.

## Tech Stack
- **Frontend**: Next.js 16 (App Router), Tailwind CSS v4, Lucide Icons, Better Auth
- **Backend**: FastAPI, SQLModel, PostgreSQL (Neon)
- **Database**: Neon Serverless PostgreSQL (Optimized pooling)
- **Security**: Stateless JWT Bridge via 'sub' claim

## Features
- **Cinematic UI**: Glassmorphism, radial gradients, and fluid transitions.
- **Strict Isolation**: Multi-tenant architecture preventing cross-user data access.
- **FastAPI Backend**: High-performance asynchronous API.
- **Better Auth Integrated**: Secure JWT-based authentication.

## Setup Instructions

### 1. Environment Variables
You must set up `.env` files in both the frontend and backend directories.

**Backend (`backend/.env`):**
Copy `backend/.env.example` to `backend/.env` and fill in:
- `DATABASE_URL`: Your Neon PostgreSQL connection string.
- `BETTER_AUTH_SECRET`: The shared random secret used to verify JWTs.

**Frontend (`frontend/.env.local`):**
Copy `frontend/.env.example` to `frontend/.env.local` and fill in:
- `DATABASE_URL`: Same Neon PostgreSQL connection string.
- `BETTER_AUTH_SECRET`: Must exactly match the backend secret.
- `NEXT_PUBLIC_API_URL`: URL of the FastAPI backend (default: http://localhost:8000).

### 2. Running the Backend
```bash
cd backend
# Recommended: use uv for faster execution
uv sync
uv run uvicorn src.main:app --reload --port 8000
```

### 3. Running the Frontend
```bash
cd frontend
npm install
npm run dev
```

## Security Design (User Isolation)
- **Authentication**: All requests to the backend require a `Bearer` JWT in the `Authorization` header.
- **Verification**: The backend decodes the JWT using the shared `BETTER_AUTH_SECRET`.
- **Identity Enforcement**: The backend extracts the `sub` claim and strictly filters all SQLModel `select`, `update`, and `delete` operations by `user_id`.
- **Stateless**: No session cookies or server-side session state are used on the backend.

🤖 Generated with [Claude Code](https://claude.com)
