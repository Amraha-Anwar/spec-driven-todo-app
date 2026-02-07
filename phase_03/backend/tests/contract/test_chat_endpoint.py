"""
Contract Tests for POST /api/{user_id}/chat Endpoint
Validates request/response schema, required fields, and response structure
"""

import pytest
import json
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool

from app.main import app
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.database import get_session


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


class TestChatEndpointContract:
    """Contract tests for POST /api/{user_id}/chat"""

    @pytest.fixture
    def valid_jwt_token(self):
        """Generate valid JWT token for testing"""
        import jwt
        import os
        secret = os.getenv('JWT_SECRET', 'test-secret-key-do-not-use-in-production')
        return jwt.encode({'user_id': 'test_user_123'}, secret, algorithm='HS256')

    def test_request_requires_user_id_in_path(self, client, valid_jwt_token):
        """T067.1: user_id must be present in URL path"""
        response = client.post(
            '/api//chat',  # Missing user_id
            headers={'Authorization': f'Bearer {valid_jwt_token}'},
            json={'message': 'test', 'conversation_id': None, 'language_hint': 'en'}
        )
        # Should redirect or error (FastAPI routing)
        assert response.status_code in [404, 307, 308]

    def test_request_requires_jwt_authorization(self, client):
        """T067.2: JWT token must be present in Authorization header"""
        response = client.post(
            '/api/test_user/chat',
            json={'message': 'test', 'conversation_id': None, 'language_hint': 'en'}
            # No Authorization header
        )
        assert response.status_code == 401
        data = response.json()
        assert 'detail' in data or 'message' in data

    def test_request_body_required_fields(self, client, valid_jwt_token):
        """T067.3: message field is required in request body"""
        response = client.post(
            '/api/test_user/chat',
            headers={'Authorization': f'Bearer {valid_jwt_token}'},
            json={'conversation_id': None, 'language_hint': 'en'}
            # Missing 'message' field
        )
        assert response.status_code == 422  # Validation error

    def test_request_accepts_conversation_id_null(self, client, valid_jwt_token):
        """T067.4: conversation_id can be null to create new conversation"""
        response = client.post(
            '/api/test_user/chat',
            headers={'Authorization': f'Bearer {valid_jwt_token}'},
            json={'message': 'test message', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response.status_code == 200

    def test_request_accepts_language_hint_en(self, client, valid_jwt_token):
        """T067.5: language_hint='en' is valid"""
        response = client.post(
            '/api/test_user/chat',
            headers={'Authorization': f'Bearer {valid_jwt_token}'},
            json={'message': 'test', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response.status_code == 200

    def test_request_accepts_language_hint_ur(self, client, valid_jwt_token):
        """T067.6: language_hint='ur' is valid"""
        response = client.post(
            '/api/test_user/chat',
            headers={'Authorization': f'Bearer {valid_jwt_token}'},
            json={'message': 'test', 'conversation_id': None, 'language_hint': 'ur'}
        )
        assert response.status_code == 200

    def test_response_includes_conversation_id(self, client, valid_jwt_token):
        """T067.7: Response must include conversation_id"""
        response = client.post(
            '/api/test_user/chat',
            headers={'Authorization': f'Bearer {valid_jwt_token}'},
            json={'message': 'test message', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response.status_code == 200
        data = response.json()
        assert 'conversation_id' in data
        assert isinstance(data['conversation_id'], str)
        assert len(data['conversation_id']) > 0

    def test_response_includes_assistant_message(self, client, valid_jwt_token):
        """T067.8: Response must include assistant_message"""
        response = client.post(
            '/api/test_user/chat',
            headers={'Authorization': f'Bearer {valid_jwt_token}'},
            json={'message': 'test message', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response.status_code == 200
        data = response.json()
        assert 'assistant_message' in data
        assert isinstance(data['assistant_message'], str)

    def test_response_includes_tool_calls(self, client, valid_jwt_token):
        """T067.9: Response must include tool_calls array"""
        response = client.post(
            '/api/test_user/chat',
            headers={'Authorization': f'Bearer {valid_jwt_token}'},
            json={'message': 'test message', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response.status_code == 200
        data = response.json()
        assert 'tool_calls' in data
        assert isinstance(data['tool_calls'], list)

    def test_response_includes_messages(self, client, valid_jwt_token):
        """T067.10: Response must include full messages array"""
        response = client.post(
            '/api/test_user/chat',
            headers={'Authorization': f'Bearer {valid_jwt_token}'},
            json={'message': 'test message', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response.status_code == 200
        data = response.json()
        assert 'messages' in data
        assert isinstance(data['messages'], list)
        # Should have at least user message and assistant response
        assert len(data['messages']) >= 2

    def test_response_message_structure(self, client, valid_jwt_token):
        """T067.11: Each message must have required fields"""
        response = client.post(
            '/api/test_user/chat',
            headers={'Authorization': f'Bearer {valid_jwt_token}'},
            json={'message': 'test message', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response.status_code == 200
        data = response.json()
        messages = data['messages']

        for msg in messages:
            assert 'id' in msg
            assert 'role' in msg
            assert msg['role'] in ['user', 'assistant']
            assert 'content' in msg
            assert 'created_at' in msg

    def test_empty_message_rejected(self, client, valid_jwt_token):
        """T067.12: Empty message should be rejected"""
        response = client.post(
            '/api/test_user/chat',
            headers={'Authorization': f'Bearer {valid_jwt_token}'},
            json={'message': '', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response.status_code == 400

    def test_invalid_jwt_token_rejected(self, client):
        """T067.13: Invalid JWT token should be rejected"""
        response = client.post(
            '/api/test_user/chat',
            headers={'Authorization': 'Bearer invalid-token-xyz'},
            json={'message': 'test', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response.status_code == 401

    def test_user_id_mismatch_rejected(self, client):
        """T067.14: Mismatched user_id in JWT and URL should be rejected"""
        import jwt
        import os
        secret = os.getenv('JWT_SECRET', 'test-secret-key-do-not-use-in-production')
        token = jwt.encode({'user_id': 'different_user'}, secret, algorithm='HS256')

        response = client.post(
            '/api/test_user/chat',  # URL has test_user
            headers={'Authorization': f'Bearer {token}'},  # Token has different_user
            json={'message': 'test', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response.status_code == 403

    def test_invalid_conversation_id_rejected(self, client, valid_jwt_token):
        """T067.15: Invalid conversation_id format should be rejected or return 404"""
        response = client.post(
            '/api/test_user/chat',
            headers={'Authorization': f'Bearer {valid_jwt_token}'},
            json={
                'message': 'test',
                'conversation_id': 'invalid-non-existent-id',
                'language_hint': 'en'
            }
        )
        # Either validation error or not found
        assert response.status_code in [400, 404]

    def test_response_content_type_json(self, client, valid_jwt_token):
        """T067.16: Response Content-Type must be application/json"""
        response = client.post(
            '/api/test_user/chat',
            headers={'Authorization': f'Bearer {valid_jwt_token}'},
            json={'message': 'test', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response.status_code == 200
        assert 'application/json' in response.headers['content-type']

    def test_response_valid_json(self, client, valid_jwt_token):
        """T067.17: Response must be valid JSON"""
        response = client.post(
            '/api/test_user/chat',
            headers={'Authorization': f'Bearer {valid_jwt_token}'},
            json={'message': 'test', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response.status_code == 200
        try:
            data = response.json()
            assert isinstance(data, dict)
        except json.JSONDecodeError:
            pytest.fail("Response is not valid JSON")

    def test_response_http_200_success(self, client, valid_jwt_token):
        """T067.18: Successful request should return HTTP 200"""
        response = client.post(
            '/api/test_user/chat',
            headers={'Authorization': f'Bearer {valid_jwt_token}'},
            json={'message': 'buy milk', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response.status_code == 200

    def test_response_error_400_bad_request(self, client, valid_jwt_token):
        """T067.19: Bad request (empty message) should return HTTP 400"""
        response = client.post(
            '/api/test_user/chat',
            headers={'Authorization': f'Bearer {valid_jwt_token}'},
            json={'message': '', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response.status_code == 400

    def test_response_error_401_unauthorized(self, client):
        """T067.20: Missing JWT should return HTTP 401"""
        response = client.post(
            '/api/test_user/chat',
            json={'message': 'test', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response.status_code == 401

    def test_response_error_403_forbidden(self, client):
        """T067.21: Access denied should return HTTP 403, not 500"""
        import jwt
        import os
        secret = os.getenv('JWT_SECRET', 'test-secret-key-do-not-use-in-production')
        token = jwt.encode({'user_id': 'user_a'}, secret, algorithm='HS256')

        # Create conversation for user_a
        response1 = client.post(
            '/api/user_a/chat',
            headers={'Authorization': f'Bearer {token}'},
            json={'message': 'test', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response1.status_code == 200

        # Try to access with different user
        token_b = jwt.encode({'user_id': 'user_b'}, secret, algorithm='HS256')
        response2 = client.post(
            '/api/user_b/chat',
            headers={'Authorization': f'Bearer {token_b}'},
            json={
                'message': 'test',
                'conversation_id': response1.json()['conversation_id'],
                'language_hint': 'en'
            }
        )
        assert response2.status_code == 403


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
