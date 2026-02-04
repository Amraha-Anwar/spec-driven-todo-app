from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.auth.routes import router as auth_router
from src.api.health import router as health_router
from src.api.tasks import router as tasks_router
from src.core.middleware import global_exception_middleware
from starlette.middleware.base import BaseHTTPMiddleware
from src.models.user import User
from src.models.task import Task
from src.models.auth import Account, Session, Verification

app = FastAPI(
    title="Task Manager API",
    description="Task management API with Better Auth integration",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception middleware
app.add_middleware(BaseHTTPMiddleware, dispatch=global_exception_middleware)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(health_router, prefix="/api/health", tags=["health"])
app.include_router(tasks_router, prefix="/api", tags=["tasks"])
# app.include_router(verification_router, prefix="/api", tags=["verification"])  # ❌ REMOVE THIS


@app.get("/")
def read_root():
    return {
        "message": "Welcome to Task Manager API",
        "version": "1.0.0",
        "docs": "/docs"
    }