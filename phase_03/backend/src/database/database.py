from sqlmodel import create_engine, Session
from sqlalchemy.pool import StaticPool
import os
from dotenv import load_dotenv

load_dotenv()


def get_database_url() -> str:
    """Get and format database URL"""
    url = os.getenv("DATABASE_URL")
    if not url:
        raise ValueError("DATABASE_URL environment variable is not set")
    
    # Fix postgres:// to postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    
    return url


# Create engine with proper configuration
DATABASE_URL = get_database_url()

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,  # ✅ Verify connections before using
    pool_recycle=3600,   # ✅ Recycle connections every hour
)


def get_session():
    """Dependency for getting database sessions"""
    with Session(engine) as session:
        yield session