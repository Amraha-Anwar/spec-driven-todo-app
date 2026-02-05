from fastapi import APIRouter, Depends
from sqlmodel import Session, text
from src.database.database import get_session
from datetime import datetime

router = APIRouter()


@router.get("/")
def health_check(session: Session = Depends(get_session)):
    """Health check endpoint"""
    try:
        # Test database connection
        session.exec(text("SELECT 1"))
        
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }