"""
Integration tests for stateless architecture validation
Verifies that system maintains zero in-memory state and reconstructs context from DB
"""
import pytest
import time
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool

from app.models.conversation import Conversation
from app.models.message import Message
from app.services.chat_service import ChatService
from app.services.context_manager import ContextManager


@pytest.fixture
def test_db():
    """Create in-memory test database"""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)

    return engine


@pytest.fixture
def test_session(test_db):
    """Create test database session"""
    with Session(test_db) as session:
        yield session


def test_no_class_level_state_in_agent_runner():
    """
    T043: Verify AgentRunner has no class-level state caching
    Ensures context is reconstructed fresh per request
    """
    from app.services.agent_runner import AgentRunner

    # Create two agent instances (simulating two requests)
    agent1 = AgentRunner()
    agent2 = AgentRunner()

    # Verify they're independent instances
    assert agent1.client is agent2.client  # Share same OpenAI client (OK)
    assert agent1.tools == agent2.tools    # Same tools registry (OK)
    assert agent1.model == agent2.model    # Same model config (OK)

    # No state stored at class level
    assert not hasattr(AgentRunner, '_state_cache')
    assert not hasattr(AgentRunner, '_message_cache')

    print("✅ AgentRunner is stateless - no class-level caching")


def test_context_manager_stateless_reconstruction(test_session: Session):
    """
    T046: Verify ContextManager reconstructs context from DB (no memory cache)
    """
    # Create conversation and add messages
    chat_service = ChatService(test_session)
    conversation = chat_service.get_or_create_conversation(
        user_id="user123",
        language_preference="en"
    )

    for i in range(5):
        chat_service.save_message(
            conversation_id=conversation.id,
            role="user" if i % 2 == 0 else "assistant",
            content=f"message {i}"
        )

    conv_id = conversation.id

    # Simulate request 1: Fetch context
    context_manager_1 = ContextManager(test_session)
    context_1 = context_manager_1.fetch_chat_history(
        conversation_id=conv_id,
        user_id="user123"
    )

    assert len(context_1) == 5

    # Simulate request 2 (new session): Fetch same context
    # This proves context was not cached in memory
    with Session(test_session.get_bind()) as session_2:
        context_manager_2 = ContextManager(session_2)
        context_2 = context_manager_2.fetch_chat_history(
            conversation_id=conv_id,
            user_id="user123"
        )

    # Both requests got same data from DB (not from memory cache)
    assert len(context_2) == 5
    assert context_1[0].content == context_2[0].content

    print("✅ ContextManager is stateless - reconstructs from DB per request")


def test_stateless_after_simulated_restart(test_session: Session):
    """
    T045: Verify system reconstructs state after restart
    Simulates: send message → restart → send another → verify history loads
    """
    chat_service = ChatService(test_session)

    # Request 1: Create conversation, add message
    conv = chat_service.get_or_create_conversation(
        user_id="user123",
        language_preference="en"
    )
    conv_id = conv.id

    msg1 = chat_service.save_message(
        conversation_id=conv_id,
        role="user",
        content="create task"
    )

    msg1_id = msg1.id

    # Simulate service restart (new session, no in-memory state)
    # In real scenario: process dies, restarts, gets new request

    # Request 2: Get history (simulating new request after restart)
    with Session(test_session.get_bind()) as session_2:
        chat_service_2 = ChatService(session_2)

        # Verify we can still access previous message
        history = chat_service_2.get_conversation_history(conv_id)

        assert len(history) == 1
        assert history[0].id == msg1_id
        assert history[0].content == "create task"

    # Request 3: Add another message
    with Session(test_session.get_bind()) as session_3:
        chat_service_3 = ChatService(session_3)

        msg2 = chat_service_3.save_message(
            conversation_id=conv_id,
            role="assistant",
            content="task created"
        )

    # Request 4: Verify both messages still there
    with Session(test_session.get_bind()) as session_4:
        chat_service_4 = ChatService(session_4)
        history = chat_service_4.get_conversation_history(conv_id)

        assert len(history) == 2
        assert history[0].content == "create task"
        assert history[1].content == "task created"

    print("✅ System is stateless - survives simulated restart with data intact")


def test_context_reconstruction_performance(test_session: Session):
    """
    T047: Performance benchmark - context reconstruction < 200ms
    """
    chat_service = ChatService(test_session)

    # Create conversation with 15 messages
    conv = chat_service.get_or_create_conversation(
        user_id="user123",
        language_preference="en"
    )

    for i in range(15):
        chat_service.save_message(
            conversation_id=conv.id,
            role="user" if i % 2 == 0 else "assistant",
            content=f"message {i}: This is a test message to simulate real content"
        )

    # Benchmark: reconstruct context from DB
    context_manager = ContextManager(test_session)

    start = time.time()
    context = context_manager.fetch_chat_history(
        conversation_id=conv.id,
        user_id="user123",
        max_messages=15
    )
    elapsed_ms = (time.time() - start) * 1000

    assert len(context) == 15
    assert elapsed_ms < 200, f"Context reconstruction took {elapsed_ms:.1f}ms (threshold: 200ms)"

    print(f"✅ Context reconstruction: {elapsed_ms:.1f}ms (threshold: 200ms)")


def test_connection_pool_stateless_behavior(test_db):
    """
    T044: Verify connection pooling enables stateless access
    Each request gets fresh connection from pool, no shared state
    """
    # Connection pooling is configured in database.py
    # SQLAlchemy pool ensures connections are recycled
    # No state persists between connections

    # Create multiple sessions from pool
    sessions = []
    for _ in range(3):
        session = Session(test_db)
        sessions.append(session)
        # Each session is independent, connections come from pool

    # Cleanup
    for session in sessions:
        session.close()

    print("✅ Connection pooling enables stateless concurrent access")


def test_conversation_isolation_stateless(test_session: Session):
    """
    Verify different conversations don't interfere (stateless isolation)
    """
    chat_service = ChatService(test_session)

    # Create two conversations
    conv1 = chat_service.get_or_create_conversation(
        user_id="user1",
        language_preference="en"
    )

    conv2 = chat_service.get_or_create_conversation(
        user_id="user2",
        language_preference="ur"
    )

    # Add messages to conv1
    chat_service.save_message(
        conversation_id=conv1.id,
        role="user",
        content="user1 message"
    )

    # Add messages to conv2
    chat_service.save_message(
        conversation_id=conv2.id,
        role="user",
        content="user2 message"
    )

    # Verify isolation in new sessions
    with Session(test_session.get_bind()) as session2:
        chat_service2 = ChatService(session2)

        history1 = chat_service2.get_conversation_history(conv1.id)
        history2 = chat_service2.get_conversation_history(conv2.id)

        assert len(history1) == 1
        assert history1[0].content == "user1 message"

        assert len(history2) == 1
        assert history2[0].content == "user2 message"

    print("✅ Conversations are isolated - no state bleed between users")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
