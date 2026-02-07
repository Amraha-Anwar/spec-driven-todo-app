from sqlmodel import SQLModel, create_engine
from src.models.user import User
from src.models.task import Task
from src.models.auth import Account, Session, Verification
from src.models.conversation import Conversation
from src.models.message import Message
from src.database.database import get_database_url
import sys

def reset_database():
    """Drop all tables and recreate them with correct schema"""
    
    print("⚠️  WARNING: This will delete ALL data in your database!")
    print("⚠️  Tables to be dropped: user, task, account, session, verification, conversation, message")
    
    response = input("\nAre you sure you want to continue? Type 'YES' to confirm: ")
    
    if response != "YES":
        print("❌ Operation cancelled")
        sys.exit(0)
    
    try:
        # Get database URL
        database_url = get_database_url()
        print(f"\n🔗 Connecting to database...")
        
        # Create engine
        engine = create_engine(database_url, echo=True)
        
        # Drop all tables
        print("\n🗑️  Dropping all tables...")
        SQLModel.metadata.drop_all(engine)
        print("✅ All tables dropped successfully")
        
        # Create all tables with correct schema
        print("\n📝 Creating tables with correct schema...")
        SQLModel.metadata.create_all(engine)
        print("✅ All tables created successfully")
        
        print("\n✨ Database reset complete!")
        print("\n📋 Created tables:")
        print("   - user (with camelCase columns)")
        print("   - task")
        print("   - account")
        print("   - session")
        print("   - verification")
        print("   - conversation (for chatbot - UUID PK, user_id FK, language_preference, metadata JSON)")
        print("   - message (for chatbot - UUID PK, conversation_id FK, role, content, tool_call_metadata JSON)")
        
    except Exception as e:
        print(f"\n❌ Error resetting database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    reset_database()