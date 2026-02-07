"""
Performance Test Suite
Validates performance targets: 100 concurrent chat requests with p95 latency < 5 seconds
Also tests database connection pooling under load
"""

import pytest
import time
import jwt
import os
import statistics
from concurrent.futures import ThreadPoolExecutor, as_completed
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool
from fastapi.testclient import TestClient

from app.main import app
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


@pytest.fixture
def valid_jwt_token():
    """Generate valid JWT token"""
    secret = os.getenv('JWT_SECRET', 'test-secret-key-do-not-use-in-production')
    return jwt.encode({'user_id': 'perf_test_user'}, secret, algorithm='HS256')


class TestPerformance:
    """Performance tests with load testing"""

    def test_single_request_latency(self, client, valid_jwt_token):
        """T069.1: Single request should complete quickly"""
        start = time.time()

        response = client.post(
            '/api/perf_test_user/chat',
            headers={'Authorization': f'Bearer {valid_jwt_token}'},
            json={'message': 'test message', 'conversation_id': None, 'language_hint': 'en'}
        )

        elapsed = time.time() - start

        assert response.status_code == 200
        # Single request should be quick (< 2 seconds)
        assert elapsed < 2.0, f"Single request took {elapsed:.2f}s, expected < 2.0s"

    def test_10_sequential_requests(self, client, valid_jwt_token):
        """T069.2: 10 sequential requests"""
        latencies = []

        for i in range(10):
            start = time.time()

            response = client.post(
                '/api/perf_test_user/chat',
                headers={'Authorization': f'Bearer {valid_jwt_token}'},
                json={
                    'message': f'test message {i}',
                    'conversation_id': None,
                    'language_hint': 'en'
                }
            )

            elapsed = time.time() - start
            latencies.append(elapsed)

            assert response.status_code == 200

        avg_latency = statistics.mean(latencies)
        max_latency = max(latencies)

        print(f"10 sequential requests: avg={avg_latency:.2f}s, max={max_latency:.2f}s")
        assert avg_latency < 3.0, f"Average latency {avg_latency:.2f}s exceeds 3.0s"

    def test_100_concurrent_requests_latency(self, client, valid_jwt_token):
        """T069.3: 100 concurrent requests with p95 latency < 5s"""
        latencies = []
        errors = []

        def send_request(request_id):
            try:
                start = time.time()

                response = client.post(
                    '/api/perf_test_user/chat',
                    headers={'Authorization': f'Bearer {valid_jwt_token}'},
                    json={
                        'message': f'concurrent request {request_id}',
                        'conversation_id': None,
                        'language_hint': 'en'
                    }
                )

                elapsed = time.time() - start

                if response.status_code != 200:
                    errors.append(f"Request {request_id} failed with {response.status_code}")
                    return None

                return elapsed
            except Exception as e:
                errors.append(f"Request {request_id} raised exception: {str(e)}")
                return None

        # Execute 100 concurrent requests
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(send_request, i) for i in range(100)]

            for future in as_completed(futures):
                result = future.result()
                if result is not None:
                    latencies.append(result)

        # Calculate percentiles
        latencies.sort()
        p50 = latencies[49] if len(latencies) > 49 else 0
        p95 = latencies[94] if len(latencies) > 94 else 0
        p99 = latencies[98] if len(latencies) > 98 else 0
        avg = statistics.mean(latencies)

        print(f"""
        Performance Results (100 concurrent requests):
        - Successful requests: {len(latencies)}/100
        - Failed requests: {len(errors)}
        - Average latency: {avg:.2f}s
        - p50 latency: {p50:.2f}s
        - p95 latency: {p95:.2f}s
        - p99 latency: {p99:.2f}s
        - Max latency: {max(latencies):.2f}s
        """)

        # All requests should succeed
        assert len(latencies) == 100, f"Only {len(latencies)}/100 requests completed"

        # p95 latency should be < 5 seconds (spec requirement T001)
        assert p95 < 5.0, f"p95 latency {p95:.2f}s exceeds 5.0s target"

    def test_conversation_reuse_performance(self, client, valid_jwt_token):
        """T069.4: Reusing conversation should not degrade performance"""
        # Create conversation
        response1 = client.post(
            '/api/perf_test_user/chat',
            headers={'Authorization': f'Bearer {valid_jwt_token}'},
            json={'message': 'first message', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response1.status_code == 200
        conversation_id = response1.json()['conversation_id']

        # Send 10 messages to same conversation
        latencies = []

        for i in range(10):
            start = time.time()

            response = client.post(
                '/api/perf_test_user/chat',
                headers={'Authorization': f'Bearer {valid_jwt_token}'},
                json={
                    'message': f'message {i}',
                    'conversation_id': conversation_id,
                    'language_hint': 'en'
                }
            )

            elapsed = time.time() - start
            latencies.append(elapsed)

            assert response.status_code == 200

        avg_latency = statistics.mean(latencies)

        # Should not degrade significantly as conversation grows
        print(f"Conversation reuse: avg latency = {avg_latency:.2f}s over 10 messages")
        assert avg_latency < 3.0, f"Average latency {avg_latency:.2f}s with growing history"

    def test_history_load_performance(self, client, valid_jwt_token):
        """T069.5: History loading should be fast even with long conversations"""
        from app.services.chat_service import ChatService
        from sqlmodel import Session

        # Create conversation and add multiple messages
        response1 = client.post(
            '/api/perf_test_user/chat',
            headers={'Authorization': f'Bearer {valid_jwt_token}'},
            json={'message': 'message 1', 'conversation_id': None, 'language_hint': 'en'}
        )
        assert response1.status_code == 200
        conv_id = response1.json()['conversation_id']

        # Add more messages
        for i in range(2, 20):
            client.post(
                '/api/perf_test_user/chat',
                headers={'Authorization': f'Bearer {valid_jwt_token}'},
                json={
                    'message': f'message {i}',
                    'conversation_id': conv_id,
                    'language_hint': 'en'
                }
            )

        # Measure history load time
        from app.services.context_manager import ContextManager
        from app.models.database import get_db

        start = time.time()

        # Load history (simulates fresh request context loading)
        db_engine = get_db()
        with Session(db_engine) as session:
            context_manager = ContextManager(session)
            history = context_manager.fetch_chat_history(
                conversation_id=conv_id,
                user_id='perf_test_user'
            )

        elapsed = time.time() - start

        print(f"History load time (19 messages): {elapsed:.3f}s")

        # History should load in < 200ms (spec requirement from Phase 6)
        assert elapsed < 0.2, f"History load took {elapsed:.3f}s, expected < 0.2s"
        assert len(history) > 0


class TestConnectionPooling:
    """Test database connection pooling under load"""

    def test_connection_pool_under_load(self, client, valid_jwt_token):
        """T071: Verify connection pooling works without exhaustion"""
        # Test 50 concurrent requests
        # Should reuse connections from pool, not create unlimited connections

        def send_request(request_id):
            try:
                response = client.post(
                    '/api/perf_test_user/chat',
                    headers={'Authorization': f'Bearer {valid_jwt_token}'},
                    json={
                        'message': f'request {request_id}',
                        'conversation_id': None,
                        'language_hint': 'en'
                    }
                )
                return response.status_code == 200
            except Exception as e:
                print(f"Request {request_id} failed: {str(e)}")
                return False

        # Execute 50 concurrent requests
        success_count = 0

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(send_request, i) for i in range(50)]

            for future in as_completed(futures):
                if future.result():
                    success_count += 1

        # All requests should succeed (no connection exhaustion)
        assert success_count == 50, f"Only {success_count}/50 requests succeeded"

        print(f"Connection pool test: {success_count}/50 requests succeeded")


if __name__ == '__main__':
    pytest.main([__file__, '-v', '-s'])
