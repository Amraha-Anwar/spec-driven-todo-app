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

# ✅ Enhanced CORS configuration for Better Auth Redirection
# "allow_credentials=True" requires explicit origins and specific headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://plannior-ai.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT","PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type", 
        "Authorization", 
        "Set-Cookie", 
        "Access-Control-Allow-Credentials",
        "Access-Control-Allow-Origin"
    ],
    expose_headers=["Set-Cookie"] # Allow frontend to see cookie headers if needed
)

# Custom exception middleware
app.add_middleware(BaseHTTPMiddleware, dispatch=global_exception_middleware)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(health_router, prefix="/api/health", tags=["health"])
app.include_router(tasks_router, prefix="/api", tags=["tasks"])

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Task Manager API",
        "version": "1.0.0",
        "docs": "/docs"
    }