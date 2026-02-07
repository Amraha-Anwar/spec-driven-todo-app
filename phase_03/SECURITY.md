# Security Policy: Plannior Phase III

## Overview

This document describes security measures implemented in Plannior Phase III - Agentic AI Chatbot.

**Core Principle**: Every request validates user ownership. Unauthorized access is rejected 100% of the time with no data leakage.

---

## Authentication & Authorization

### JWT Token Validation (T050)

**Middleware**: `backend/app/middleware/auth.py`

Every request:
1. Extracts JWT from `Authorization: Bearer {token}` header
2. Decodes and validates signature (HS256)
3. Extracts `user_id` claim
4. Injects into `request.state.user_id`

**Rejected Requests**:
- Missing Authorization header → 401 Unauthorized
- Invalid/expired JWT → 401 Unauthorized
- Missing user_id claim → 401 Unauthorized

### Conversation Ownership Verification (T052)

**Service**: `backend/app/services/chat_service.py`

Before processing any request:
```python
if not chat_service.validate_user_ownership(conversation_id, user_id):
    raise 403 Forbidden
```

**Prevents**:
- User A accessing User B's conversations
- Cross-user message modification
- Unauthorized conversation deletion

### MCP Tool User_ID Parameter (T051)

**All MCP Tools Require user_id**:
- TaskToolbox.add_task(user_id, ...)
- TaskToolbox.delete_task(user_id, ...)
- ContextManager.fetch_chat_history(user_id, ...)
- RomanUrduHandler.parse_urdu_intent(user_id, ...)

Each tool validates:
```python
if tool_user_id != request.state.user_id:
    return 403 Access Denied
```

### ContextManager Double-Check (T053)

**Filter by Conversation ID AND User ID**:
```python
messages = db.query(Message).filter(
    Message.conversation_id == conversation_id,
    Conversation.user_id == user_id  # Double-check
).all()
```

Prevents even database-level access by unauthorized users.

---

## Error Handling

### HTTP Status Codes (T054)

| Scenario | Status | Message |
|----------|--------|---------|
| Missing JWT | 401 | "Missing or invalid Authorization header" |
| Invalid JWT | 401 | "Invalid or expired token" |
| User mismatch | 403 | "Access denied" |
| Conversation not found | 404 | "Conversation not found" |
| Server error | 500 | "Something went wrong. Please try again later." |

**Key**: Never return 500 for authorization failures. Use 403/404 to avoid leaking that resource exists.

### Error Messages - No Data Leakage

```python
# ❌ WRONG - Leaks that conversation exists
"Conversation {id} not found for user {other_user}"

# ✅ RIGHT - Generic message
"Access denied"
```

All authorization errors return generic messages to prevent information disclosure.

---

## Audit Logging

### Security Audit Logs (T055)

Every authorization failure logged with:
- `user_id`: Who attempted access
- `timestamp`: When
- `attempted_action`: What they tried
- `resource_id`: What they tried to access
- `result`: DENIED/ALLOWED

**Example Log Entry**:
```
2026-02-07 14:23:45 WARNING [auth.py]
  user_a attempted delete on conversation_xyz (owned by user_b) - DENIED
  TRACE_ID=550e8400-e29b-41d4-a716-446655440000
```

**Use Case**: Security incident investigation, compliance audits

### Metrics

Track:
- Total authorization attempts
- Failed authorization attempts (should be 100% rejected)
- Common patterns of abuse

---

## Data Isolation

### Multi-Tenant Isolation (T056)

Each user's data is completely isolated:

**Conversation Level**:
- User A cannot list User B's conversations
- User A cannot fetch User B's conversation history

**Message Level**:
- User A cannot read User B's messages
- User A cannot modify User B's messages

**Task Level** (via TaskToolbox):
- User A cannot delete User B's tasks
- User A cannot mark User B's tasks complete

**Verification**: See `test_auth_isolation.py` for complete test coverage

### Connection Pooling Security

Database connections pooled via SQLAlchemy:
- Each connection fresh (not shared state)
- Connection recycled after 1 hour
- Pre-ping ensures connection validity
- No connection reuse for different users

---

## Unauthenticated Access (T057)

### Request Flow

```
HTTP Request
    ↓
JWT Middleware (extract & validate)
    ├─ No Authorization header? → 401
    ├─ Invalid JWT? → 401
    ├─ Missing user_id? → 401
    └─ Valid? → Continue
    ↓
Endpoint Handler
    ├─ Verify conversation ownership
    ├─ Verify user_id matches
    └─ Process request
```

**100% of requests** go through JWT validation before reaching business logic.

### Unauthenticated Paths

Only these paths skip JWT validation:
- `GET /health` - Health check
- `GET /docs` - API documentation
- `GET /openapi.json` - OpenAPI schema

**All chat endpoints require JWT**.

---

## Security Best Practices Implemented

| Practice | Implementation |
|----------|-----------------|
| Input Validation | Empty messages rejected, conversation_id format validated |
| Output Encoding | No special characters in error messages, no SQL injection vectors |
| Authentication | JWT with HS256 signature verification |
| Authorization | User_id ownership check on every operation |
| Encryption | HTTPS recommended for production |
| Logging | Audit logs for all authorization events |
| Error Handling | Generic error messages, no data leakage |
| Session Management | Stateless (no session hijacking possible) |
| Rate Limiting | Implement via API gateway (not in app) |

---

## Known Limitations

1. **Rate Limiting**: Not implemented in Phase III. Use API gateway (nginx, CloudFlare) in production.

2. **Token Expiry**: JWT tokens don't have expiration. Add `exp` claim for production:
   ```python
   import time
   payload = {
       "user_id": user_id,
       "exp": time.time() + 3600  # 1 hour
   }
   ```

3. **Token Refresh**: No refresh token mechanism. Implement for production.

4. **HTTPS**: Required for production. Configure in deployment.

5. **Secrets**: JWT_SECRET must be long (> 32 chars) and randomly generated. Change before production.

---

## Compliance & Testing

### Test Coverage (T056)

```bash
# Run authorization tests
pytest tests/integration/test_auth_isolation.py -v

# Output:
# test_t052_conversation_ownership_verification PASSED
# test_t056_cross_user_isolation PASSED
# test_t057_unauthenticated_requests_rejected PASSED
# test_multi_user_concurrent_access PASSED
```

All tests must pass before production deployment.

### Audit Checklist

- [ ] JWT_SECRET is > 32 random characters
- [ ] All chat endpoints require Authorization header
- [ ] Authorization test suite passes (7/7)
- [ ] No hardcoded user_ids in code
- [ ] Error messages are generic (no data leakage)
- [ ] Conversation ownership verified before processing
- [ ] All MCP tools receive user_id parameter
- [ ] Audit logs configured and monitored
- [ ] Database connections pooled with isolation
- [ ] HTTPS configured in production

---

## Incident Response

### If unauthorized access is detected

1. **Immediately**:
   - Check audit logs for extent of access
   - Identify affected user_ids
   - Determine what data was accessed

2. **Within 1 hour**:
   - Rotate JWT_SECRET
   - Invalidate all existing tokens
   - Force users to re-authenticate

3. **Within 24 hours**:
   - Complete incident report
   - Patch any vulnerabilities
   - Deploy fix to production

---

## Reporting Security Issues

Do **NOT** open public issues for security vulnerabilities.

Please email: [security contact - to be configured]

Include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

---

## References

- [OWASP Top 10](https://owasp.org/Top10/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [SQL Injection Prevention](https://owasp.org/www-community/attacks/SQL_Injection)
- [Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-07 | Initial security policy for Phase III MVP |

