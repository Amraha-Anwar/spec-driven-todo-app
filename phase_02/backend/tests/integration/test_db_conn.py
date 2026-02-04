from sqlmodel import Session, text
from src.db.session import engine

def test_db_connection():
    try:
        with Session(engine) as session:
            result = session.exec(text("SELECT 1")).first()
            assert result[0] == 1
    except Exception as e:
        assert False, f"Database connection failed: {e}"
