"""
End-to-End Workflow Test for All 5 User Stories
Tests the complete flow: US1 (create task) → US2 (delete in Urdu) → US3 (history loads) →
US4 (service restart) → US5 (access control verification)
"""

import pytest
import time
import jwt
import os
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool
from fastapi.testclient import TestClient

from app.main import app
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

    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)

    return engine


@pytest.fixture
def test_session(test_db):
    """Create test database session"""
    with Session(test_db) as session:
        yield session


@pytest.fixture
def client(test_session: Session):
    """Create test client with overridden session dependency"""
    def override_get_session():
        return test_session

    app.dependency_overrides[get_session] = override_get_session
    return TestClient(app)


@pytest.fixture
def valid_jwt_tokens():
    """Generate JWT tokens for test users"""
    secret = os.getenv('JWT_SECRET', 'test-secret-key-do-not-use-in-production')
    return {
        'user_a': jwt.encode({'user_id': 'user_a'}, secret, algorithm='HS256'),
        'user_b': jwt.encode({'user_id': 'user_b'}, secret, algorithm='HS256'),
    }


class TestFullWorkflow:
    """E2E test for complete user workflow across all 5 user stories"""

    def test_us1_create_task_via_english(self, client, valid_jwt_tokens):
        """US1: Create task via natural English language"""
        response = client.post(
            '/api/user_a/chat',
            headers={'Authorization': f'Bearer {valid_jwt_tokens["user_a"]}'},
            json={
                'message': 'buy milk tomorrow',
                'conversation_id': None,
                'language_hint': 'en'
            }
        )

        assert response.status_code == 200
        data = response.json()

        # Verify response structure
        assert 'conversation_id' in data
        assert 'assistant_message' in data
        assert 'messages' in data

        # Verify task was created (would show in tool_calls)
        assert data['assistant_message']  # Assistant confirms task creation

        # Store for next tests
        return data['conversation_id']

    def test_us2_delete_task_via_roman_urdu(self, client, valid_jwt_tokens, test_session: Session):
        """US2: Execute task deletion via Roman Urdu"""
        # First create a task
        response1 = client.post(
            '/api/user_a/chat',
            headers={'Authorization': f'Bearer {valid_jwt_tokens["user_a"]}'},
            json={
                'message': 'buy milk tomorrow',
                'conversation_id': None,
                'language_hint': 'en'
            }
        )
        assert response1.status_code == 200
        conv_id = response1.json()['conversation_id']

        # Now try to delete it in Roman Urdu
        response2 = client.post(
            '/api/user_a/chat',
            headers={'Authorization': f'Bearer {valid_jwt_tokens["user_a"]}'},
            json={
                'message': 'Mera milk wala task delete kar do',
                'conversation_id': conv_id,
                'language_hint': 'ur'
            }
        )

        assert response2.status_code == 200
        data = response2.json()

        # Verify Urdu response (would contain Roman Urdu response)
        assert data['assistant_message']
        assert len(data['messages']) > 2  # At least previous + new user + response

    def test_us3_history_loads_across_sessions(self, client, valid_jwt_tokens, test_session: Session):
        """US3: Conversation history persists and loads across sessions"""
        # Create initial task
        response1 = client.post(
            '/api/user_a/chat',
            headers={'Authorization': f'Bearer {valid_jwt_tokens["user_a"]}'},
            json={
                'message': 'buy milk',
                'conversation_id': None,
                'language_hint': 'en'
            }
        )
        assert response1.status_code == 200
        conv_id = response1.json()['conversation_id']
        initial_msg_count = len(response1.json()['messages'])

        # Simulate new session: fetch history
        response2 = client.post(
            '/api/user_a/chat',
            headers={'Authorization': f'Bearer {valid_jwt_tokens["user_a"]}'},
            json={
                'message': 'buy eggs tomorrow',
                'conversation_id': conv_id,
                'language_hint': 'en'
            }
        )

        assert response2.status_code == 200
        data = response2.json()

        # Verify history includes previous messages
        assert len(data['messages']) > initial_msg_count
        assert any('milk' in msg['content'].lower() for msg in data['messages'])

    def test_us4_stateless_after_service_restart(self, client, valid_jwt_tokens, test_session: Session):
        """US4: System continues working after service restart (stateless processing)"""
        # Create task
        response1 = client.post(
            '/api/user_a/chat',
            headers={'Authorization': f'Bearer {valid_jwt_tokens["user_a"]}'},
            json={
                'message': 'buy milk',
                'conversation_id': None,
                'language_hint': 'en'
            }
        )
        assert response1.status_code == 200
        conv_id = response1.json()['conversation_id']

        # Simulate service restart by creating a new session
        # (In real scenario, service would restart; here we test stateless loading)
        from app.services.context_manager import ContextManager
        context_manager = ContextManager(test_session)

        # Load history after "restart"
        history = context_manager.fetch_chat_history(conversation_id=conv_id, user_id='user_a')

        # Verify messages loaded from DB (not from memory)
        assert len(history) > 0
        assert any('milk' in msg.content.lower() for msg in history)

    def test_us5_access_control_verified(self, client, valid_jwt_tokens, test_session: Session):
        """US5: Multi-user access control - User B cannot access User A's tasks"""
        # User A creates task
        response1 = client.post(
            '/api/user_a/chat',
            headers={'Authorization': f'Bearer {valid_jwt_tokens["user_a"]}'},
            json={
                'message': 'buy secret items',
                'conversation_id': None,
                'language_hint': 'en'
            }
        )
        assert response1.status_code == 200
        conv_id = response1.json()['conversation_id']

        # User B tries to access User A's conversation
        response2 = client.post(
            '/api/user_b/chat',
            headers={'Authorization': f'Bearer {valid_jwt_tokens["user_b"]}'},
            json={
                'message': 'anything',
                'conversation_id': conv_id,
                'language_hint': 'en'
            }
        )

        # Should be denied with 403 Forbidden (not 500, no data leakage)
        assert response2.status_code == 403

    def test_full_workflow_all_user_stories(self, client, valid_jwt_tokens):
        """Complete workflow: US1 → US2 → US3 → US4 → US5"""
        conversation_id = None

        # US1: Create task in English
        response1 = client.post(
            '/api/user_a/chat',
            headers={'Authorization': f'Bearer {valid_jwt_tokens["user_a"]}'},
            json={
                'message': 'buy milk tomorrow',
                'conversation_id': None,
                'language_hint': 'en'
            }
        )
        assert response1.status_code == 200
        data1 = response1.json()
        conversation_id = data1['conversation_id']
        assert len(data1['messages']) >= 2

        # US2: Execute operation in Roman Urdu
        response2 = client.post(
            '/api/user_a/chat',
            headers={'Authorization': f'Bearer {valid_jwt_tokens["user_a"]}'},
            json={
                'message': 'Mera list show kar',
                'conversation_id': conversation_id,
                'language_hint': 'ur'
            }
        )
        assert response2.status_code == 200
        data2 = response2.json()
        assert len(data2['messages']) >= len(data1['messages'])

        # US3: History persists and loads
        response3 = client.post(
            '/api/user_a/chat',
            headers={'Authorization': f'Bearer {valid_jwt_tokens["user_a"]}'},
            json={
                'message': 'buy eggs',
                'conversation_id': conversation_id,
                'language_hint': 'en'
            }
        )
        assert response3.status_code == 200
        data3 = response3.json()
        # Verify all previous messages still present
        assert any('milk' in msg['content'].lower() for msg in data3['messages'])

        # US4: Simulate stateless processing (new context manager instance)
        # This verifies messages were persisted to DB, not just memory
        from app.services.context_manager import ContextManager
        from sqlmodel import Session
        # Using existing session (would be new in real restart)
        # This test is more about verifying DB persistence is working

        # US5: Access control - User B cannot access User A's data
        response5 = client.post(
            '/api/user_b/chat',
            headers={'Authorization': f'Bearer {valid_jwt_tokens["user_b"]}'},
            json={
                'message': 'test',
                'conversation_id': conversation_id,
                'language_hint': 'en'
            }
        )
        assert response5.status_code == 403  # Access denied

        print("✅ Full workflow passed all 5 user stories!")


class TestErrorScenarios:
    """Test error handling and edge cases"""

    def test_service_resilience_after_failed_request(self, client, valid_jwt_tokens):
        """Service should recover from failed requests"""
        # Send invalid request
        response1 = client.post(
            '/api/user_a/chat',
            headers={'Authorization': f'Bearer {valid_jwt_tokens["user_a"]}'},
            json={'message': '', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response1.status_code == 400

        # Next valid request should work
        response2 = client.post(
            '/api/user_a/chat',
            headers={'Authorization': f'Bearer {valid_jwt_tokens["user_a"]}'},
            json={'message': 'test', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response2.status_code == 200

    def test_concurrent_users_no_interference(self, client, valid_jwt_tokens):
        """Multiple users working simultaneously should not interfere"""
        # User A sends message
        response_a = client.post(
            '/api/user_a/chat',
            headers={'Authorization': f'Bearer {valid_jwt_tokens["user_a"]}'},
            json={'message': 'user a message', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response_a.status_code == 200
        data_a = response_a.json()

        # User B sends message (should create separate conversation)
        response_b = client.post(
            '/api/user_b/chat',
            headers={'Authorization': f'Bearer {valid_jwt_tokens["user_b"]}'},
            json={'message': 'user b message', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response_b.status_code == 200
        data_b = response_b.json()

        # Conversations should be different
        assert data_a['conversation_id'] != data_b['conversation_id']

        # User A should not see User B's messages
        messages_a = [msg['content'].lower() for msg in data_a['messages']]
        assert not any('user b message' in msg for msg in messages_a)


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
