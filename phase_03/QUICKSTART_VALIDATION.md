# Quickstart Validation Checklist (T070)

This document guides manual validation of the quickstart.md procedure to ensure new developers can reproduce the system locally.

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (or Neon account for remote DB)
- pip and npm installed

## Setup Validation (5-10 minutes)

### 1. Clone Repository
```bash
cd /tmp/test-plannior-setup
git clone https://github.com/your-org/todo-evolution.git
cd todo-evolution/phase_03
```

- [ ] Repository cloned successfully
- [ ] Git history present (`.git` directory)
- [ ] All source files present

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

- [ ] All dependencies installed (FastAPI, SQLModel, OpenAI SDK, etc.)
- [ ] No version conflicts
- [ ] Virtual environment isolated

### 3. Environment Configuration
```bash
cp .env.example .env
# Edit with test values:
# DATABASE_URL=postgresql://user:password@localhost:5432/test_db
# OPENROUTER_API_KEY=sk-or-v1-test-key
# JWT_SECRET=test-secret-do-not-use-in-prod
```

- [ ] `.env` file created
- [ ] All required variables set
- [ ] No hardcoded secrets in code

### 4. Database Initialization
```bash
python reset_database.py
```

- [ ] Conversation table created
- [ ] Message table created
- [ ] Foreign key relationships verified
- [ ] No migration errors

### 5. Frontend Setup
```bash
cd ../frontend
npm install
```

- [ ] All npm packages installed
- [ ] node_modules not committed to git
- [ ] package-lock.json present

### 6. Environment Setup
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
```

- [ ] `.env.local` created
- [ ] `.env.local` not committed to git

## Runtime Validation (10-15 minutes)

### 7. Start Backend
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Check logs:
```
INFO:     Application startup complete
INFO:     Uvicorn running on http://127.0.0.1:8000
```

- [ ] Backend starts without errors
- [ ] Logs show "Application startup complete"
- [ ] API accessible at http://localhost:8000

### 8. Health Check
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status":"healthy","service":"Plannior Phase III","version":"0.1.0"}
```

- [ ] HTTP 200 response
- [ ] JSON response valid
- [ ] Service name correct

### 9. Start Frontend
```bash
cd frontend
npm run dev
```

Check logs:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

- [ ] Frontend builds without errors
- [ ] Dev server starts on port 3000
- [ ] Browser can access http://localhost:3000

### 10. Generate Test JWT Token
```bash
python -c "
import jwt
secret = 'test-secret-do-not-use-in-prod'
token = jwt.encode({'user_id': 'test_user'}, secret, algorithm='HS256')
print('JWT Token:', token)
"
```

Store token for tests:
```bash
export JWT_TOKEN="<token_value>"
```

- [ ] Token generated successfully
- [ ] Token is valid JWT format
- [ ] Token contains user_id claim

## Feature Validation (15-20 minutes)

### Test 1: User Story 1 - Create Task (English)

```bash
curl -X POST http://localhost:8000/api/test_user/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": null,
    "message": "buy milk tomorrow",
    "language_hint": "en"
  }'
```

Expected response:
```json
{
  "conversation_id": "uuid-here",
  "assistant_message": "I've added milk...",
  "tool_calls": [...],
  "messages": [
    {"role": "user", "content": "buy milk tomorrow"},
    {"role": "assistant", "content": "..."}
  ]
}
```

- [ ] HTTP 200 response
- [ ] conversation_id returned
- [ ] assistant_message contains confirmation
- [ ] messages array has user and assistant messages

**Verify in database:**
```sql
SELECT * FROM conversation WHERE id = 'uuid-here';
SELECT * FROM message WHERE conversation_id = 'uuid-here';
```

- [ ] Conversation record created
- [ ] Message records created
- [ ] user_id matches token

### Test 2: User Story 2 - Delete Task (Roman Urdu)

Using same conversation_id from Test 1:

```bash
curl -X POST http://localhost:8000/api/test_user/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "uuid-from-test1",
    "message": "Mera milk wala task delete kar do",
    "language_hint": "ur"
  }'
```

Expected response: Roman Urdu response (e.g., "Bilkul, maine delete kar diya")

- [ ] HTTP 200 response
- [ ] assistant_message contains Roman Urdu text
- [ ] language_hint='ur' was processed correctly

### Test 3: User Story 3 - Conversation History

```bash
curl http://localhost:8000/api/test_user/conversations \
  -H "Authorization: Bearer $JWT_TOKEN"
```

Expected response:
```json
[
  {
    "id": "uuid-here",
    "language_preference": "en",
    "created_at": "2026-02-07T...",
    "updated_at": "2026-02-07T...",
    "message_count": 2
  }
]
```

- [ ] HTTP 200 response
- [ ] Conversation list returned
- [ ] message_count is correct

```bash
curl "http://localhost:8000/api/test_user/conversations/uuid-from-test1/history?offset=0&limit=50" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

Expected response:
```json
{
  "messages": [...],
  "total_count": 4,
  "offset": 0,
  "limit": 50,
  "has_more": false
}
```

- [ ] HTTP 200 response
- [ ] All messages from conversation returned
- [ ] total_count reflects message count
- [ ] Messages in chronological order

### Test 4: User Story 4 - Stateless Processing

Verify that stopping and restarting the backend doesn't lose data:

1. Note the conversation_id from Test 1
2. Stop backend: Ctrl+C
3. Wait 2 seconds
4. Restart backend: `uvicorn app.main:app --reload`
5. Run Test 3 again

- [ ] Backend restarts successfully
- [ ] Same conversation_id accessible
- [ ] All messages still present
- [ ] No data loss after restart

### Test 5: User Story 5 - Access Control

Create separate token for user_b:

```bash
python -c "
import jwt
secret = 'test-secret-do-not-use-in-prod'
token = jwt.encode({'user_id': 'user_b'}, secret, algorithm='HS256')
print('JWT Token for user_b:', token)
"
export JWT_TOKEN_B="<token_value>"
```

Try to access user_a's conversation:

```bash
curl -X POST http://localhost:8000/api/user_b/chat \
  -H "Authorization: Bearer $JWT_TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "uuid-from-test1",
    "message": "test",
    "language_hint": "en"
  }'
```

Expected response: HTTP 403 Forbidden with generic message

- [ ] HTTP 403 response (not 500)
- [ ] No data leakage in error message
- [ ] Message generic (e.g., "Access denied")

Test unauthenticated access:

```bash
curl -X POST http://localhost:8000/api/test_user/chat \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": null,
    "message": "test",
    "language_hint": "en"
  }'
```

Expected response: HTTP 401 Unauthorized

- [ ] HTTP 401 response
- [ ] Message indicates missing/invalid token

## Performance Validation (5 minutes)

### Measure Task Creation Latency

```bash
time curl -X POST http://localhost:8000/api/test_user/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": null,
    "message": "buy apples",
    "language_hint": "en"
  }'
```

Expected: Real time < 5 seconds (p95 requirement)

- [ ] Latency < 5 seconds (✓ if shows "real 0m4.xxx")

### Measure History Load Time

```bash
time curl "http://localhost:8000/api/test_user/conversations/uuid-from-test1/history?offset=0&limit=50" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

Expected: Real time < 2 seconds

- [ ] Latency < 2 seconds

## Frontend Widget Validation (5 minutes)

1. Open http://localhost:3000 in browser
2. Log in with test_user credentials
3. Navigate to Dashboard

Check Chat Widget:

- [ ] Chat button visible in bottom-right corner (floating)
- [ ] Click button opens chat window
- [ ] Conversation list displayed
- [ ] Message history loaded
- [ ] Can type and send message
- [ ] Response appears from assistant
- [ ] Language selector visible (English / Roman Urdu)
- [ ] Can switch language
- [ ] Infinite scroll works (scroll up loads older messages)
- [ ] Close button (X) closes widget

## Cleanup & Notes

### Summary Checklist

- [ ] All setup steps completed
- [ ] Backend health check passed
- [ ] Frontend loads successfully
- [ ] All 5 user stories tested
- [ ] Performance targets met
- [ ] Access control verified
- [ ] No errors in logs

### Common Issues

**Issue**: `ModuleNotFoundError: No module named 'fastapi'`
**Solution**: Verify virtual environment activated and `pip install -r requirements.txt` completed

**Issue**: `Connection refused` on localhost:5432
**Solution**: Ensure PostgreSQL running or switch to Neon remote DB in `.env`

**Issue**: `401 Unauthorized` on API calls
**Solution**: Verify JWT_SECRET in `.env` matches token generation script

**Issue**: Frontend can't reach backend
**Solution**: Check `NEXT_PUBLIC_API_URL` in `.env.local`, should be `http://localhost:8000/api`

### Notes for Developers

- All tests can be run in isolation
- Each user story is independently deployable
- Quickstart should complete in < 30 minutes on modern hardware
- Performance targets verified with load tests (separate perf test file)

---

**Last Updated**: 2026-02-07
**Quickstart Version**: 1.0
**Status**: ✅ Ready for developer onboarding
