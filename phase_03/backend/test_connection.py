import os
from dotenv import load_dotenv
from sqlalchemy import text
from src.database.database import engine

# Load environment variables
load_dotenv()

def test_connection():
    """
    Test the database connection to Neon PostgreSQL
    """
    try:
        with engine.connect() as connection:
            # Execute a simple query
            result = connection.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
            print(f"Query result: {result.fetchone()}")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing database connection...")
    test_connection()