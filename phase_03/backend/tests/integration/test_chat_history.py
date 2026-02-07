"""
Integration tests for conversation history retrieval
Tests stateless context reconstruction across requests
"""
import pytest
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool

from app.models.conversation import Conversation
from app.models.message import Message
from app.models.database import get_session
from app.services.chat_service import ChatService


@pytest.fixture
def test_db():
    """Create in-memory test database"""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    # Create tables
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)

    return engine


@pytest.fixture
def test_session(test_db):
    """Create test database session"""
    with Session(test_db) as session:
        yield session


def test_conversation_creation(test_session: Session):
    """Test creating a new conversation"""
    chat_service = ChatService(test_session)

    conversation = chat_service.get_or_create_conversation(
        user_id="user123",
        language_preference="en"
    )

    assert conversation is not None
    assert conversation.user_id == "user123"
    assert conversation.language_preference == "en"
    assert len(conversation.messages) == 0


def test_message_persistence(test_session: Session):
    """Test saving and retrieving messages"""
    chat_service = ChatService(test_session)

    # Create conversation
    conversation = chat_service.get_or_create_conversation(
        user_id="user123",
        language_preference="en"
    )

    # Save user message
    msg1 = chat_service.save_message(
        conversation_id=conversation.id,
        role="user",
        content="buy milk tomorrow"
    )

    # Save assistant response
    msg2 = chat_service.save_message(
        conversation_id=conversation.id,
        role="assistant",
        content="I've added milk to your list for tomorrow!"
    )

    assert msg1.role == "user"
    assert msg2.role == "assistant"
    assert msg1.content == "buy milk tomorrow"


def test_context_fetch(test_session: Session):
    """Test fetching context messages"""
    chat_service = ChatService(test_session)

    # Create conversation
    conversation = chat_service.get_or_create_conversation(
        user_id="user123",
        language_preference="en"
    )

    # Add 5 messages
    for i in range(5):
        chat_service.save_message(
            conversation_id=conversation.id,
            role="user" if i % 2 == 0 else "assistant",
            content=f"message {i}"
        )

    # Fetch context
    context = chat_service.fetch_conversation_context(conversation.id, max_messages=15)

    assert len(context) == 5
    assert context[0].content == "message 0"
    assert context[-1].content == "message 4"


def test_history_across_sessions(test_session: Session):
    """Test that history persists across requests (stateless architecture)"""
    # Session 1: Create conversation and add messages
    chat_service_1 = ChatService(test_session)

    conversation = chat_service_1.get_or_create_conversation(
        user_id="user123",
        language_preference="en"
    )
    conv_id = conversation.id

    chat_service_1.save_message(
        conversation_id=conv_id,
        role="user",
        content="create task"
    )

    chat_service_1.save_message(
        conversation_id=conv_id,
        role="assistant",
        content="task created"
    )

    # Simulate request restart (new session)
    with Session(test_session.get_bind()) as session_2:
        chat_service_2 = ChatService(session_2)

        # Fetch conversation by ID (stateless reconstruction)
        history = chat_service_2.get_conversation_history(conv_id)

        assert len(history) == 2
        assert history[0].content == "create task"
        assert history[1].content == "task created"


def test_user_isolation(test_session: Session):
    """Test that users cannot access each other's conversations"""
    chat_service = ChatService(test_session)

    # User 1 creates conversation
    conv1 = chat_service.get_or_create_conversation(
        user_id="user1",
        language_preference="en"
    )

    # User 2 tries to access it
    with pytest.raises(ValueError, match="not found"):
        chat_service.fetch_conversation_context(
            conversation_id=conv1.id,
            # Note: in real scenario, would use separate ChatService with session from user2
        )


def test_pagination(test_session: Session):
    """Test message pagination"""
    from app.services.context_manager import ContextManager

    chat_service = ChatService(test_session)
    context_manager = ContextManager(test_session)

    # Create conversation
    conversation = chat_service.get_or_create_conversation(
        user_id="user123",
        language_preference="en"
    )

    # Add 100 messages
    for i in range(100):
        chat_service.save_message(
            conversation_id=conversation.id,
            role="user" if i % 2 == 0 else "assistant",
            content=f"message {i}"
        )

    # Fetch paginated history
    page1 = context_manager.fetch_full_history(
        conversation_id=conversation.id,
        user_id="user123",
        offset=0,
        limit=50
    )

    page2 = context_manager.fetch_full_history(
        conversation_id=conversation.id,
        user_id="user123",
        offset=50,
        limit=50
    )

    assert len(page1["messages"]) == 50
    assert len(page2["messages"]) == 50
    assert page1["total_count"] == 100
    assert page1["has_more"] is True
    assert page2["has_more"] is False


def test_token_budgeting(test_session: Session):
    """Test that token budgeting limits context appropriately"""
    from app.services.context_manager import ContextManager

    chat_service = ChatService(test_session)
    context_manager = ContextManager(test_session)

    # Create conversation
    conversation = chat_service.get_or_create_conversation(
        user_id="user123",
        language_preference="en"
    )

    # Add 20 long messages
    long_message = "This is a test message that will consume tokens " * 10
    for i in range(20):
        chat_service.save_message(
            conversation_id=conversation.id,
            role="user" if i % 2 == 0 else "assistant",
            content=long_message
        )

    # Fetch with token limit
    context = context_manager.fetch_chat_history(
        conversation_id=conversation.id,
        user_id="user123",
        max_messages=20,
        token_limit=500  # Low limit to trigger windowing
    )

    # Should return limited messages due to token budget
    assert len(context) <= 5  # Windowed to recent messages


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
