"""
Unit tests for src.core.security

The app uses opaque session-token auth (Better Auth `session` table lookup),
NOT JWT decoding. These tests exercise the functions that actually exist:
- get_password_hash / verify_password (pure bcrypt round-trip)
- verify_session_token (DB session lookup + expiry check)

The DB session is mocked so these stay fast, hermetic unit tests that don't
touch the real database, auth flow, or any application logic.
"""
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import patch, MagicMock

from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from src.core.security import (
    get_password_hash,
    verify_password,
    verify_session_token,
)


# ---------------------------------------------------------------------------
# Password hashing (pure, no DB)
# ---------------------------------------------------------------------------

class TestPasswordHashing:
    def test_hash_and_verify_roundtrip(self):
        """A correct password verifies against its hash."""
        hashed = get_password_hash("s3cret-password")
        assert hashed != "s3cret-password", "Hash must not equal the plaintext"
        assert verify_password("s3cret-password", hashed) is True

    def test_verify_rejects_wrong_password(self):
        """An incorrect password fails verification."""
        hashed = get_password_hash("s3cret-password")
        assert verify_password("wrong-password", hashed) is False

    def test_hash_is_salted_unique(self):
        """The same password hashed twice yields different hashes (random salt)."""
        assert get_password_hash("same") != get_password_hash("same")


# ---------------------------------------------------------------------------
# Session-token validation (DB session mocked)
# ---------------------------------------------------------------------------

def _creds(token: str) -> HTTPAuthorizationCredentials:
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


def _mock_db_yielding(session_record):
    """Build a mock DB session whose .exec(...).first() returns session_record."""
    db = MagicMock()
    db.exec.return_value.first.return_value = session_record
    # get_db_session is a generator dependency: next(get_db_session()) -> db
    gen = MagicMock()
    gen.__next__ = lambda _self=None: db
    return iter([db])


class TestVerifySessionToken:
    def test_invalid_token_raises_401(self):
        """No matching session row -> 401 invalid token."""
        with patch(
            "src.core.security.get_db_session",
            return_value=_mock_db_yielding(None),
        ):
            with pytest.raises(HTTPException) as excinfo:
                verify_session_token(_creds("does-not-exist"))
        assert excinfo.value.status_code == 401
        assert "invalid token" in excinfo.value.detail.lower()

    def test_expired_token_raises_401(self):
        """A session whose expiresAt is in the past -> 401 expired."""
        expired = MagicMock()
        expired.token = "expired-token"
        expired.userId = "user123"
        expired.expiresAt = datetime.now(timezone.utc) - timedelta(days=1)

        with patch(
            "src.core.security.get_db_session",
            return_value=_mock_db_yielding(expired),
        ):
            with pytest.raises(HTTPException) as excinfo:
                verify_session_token(_creds("expired-token"))
        assert excinfo.value.status_code == 401
        assert "expired" in excinfo.value.detail.lower()

    def test_valid_token_returns_user(self):
        """A valid, unexpired session returns the wrapped user id."""
        valid = MagicMock()
        valid.token = "valid-token"
        valid.userId = "user123"
        valid.expiresAt = datetime.now(timezone.utc) + timedelta(days=7)

        with patch(
            "src.core.security.get_db_session",
            return_value=_mock_db_yielding(valid),
        ):
            result = verify_session_token(_creds("valid-token"))
        assert result == {"user": {"id": "user123"}}


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
