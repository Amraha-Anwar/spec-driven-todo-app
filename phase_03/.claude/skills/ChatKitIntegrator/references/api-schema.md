# ChatKitIntegrator API Schema

## Overview

ChatKitIntegrator is a FastAPI layer that bridges ChatKit (frontend UI) with OpenAI Agents SDK. It:
1. Maps ChatKit requests to agent instructions
2. Integrates TaskToolbox, ContextManager, and RomanUrduHandler MCP skills
3. Verifies JWT tokens and enforces user_id isolation
4. Streams agent responses back to ChatKit in real-time

## API Endpoints

### POST /api/{user_id}/chat

**Purpose:** Send a chat message and get agent response.

**Parameters:**
- `user_id` (path, required): User ID - must match JWT token
- `message` (body, required): User's message
- `conversation_id` (body, required): Conversation ID for context
- `metadata` (body, optional): Additional metadata
- `Authorization` (header, required): "Bearer {jwt_token}"

**Request:**
```json
{
  "message": "Mera meeting wala task delete kar do",
  "conversation_id": "conv-123",
  "metadata": {
    "language": "roman-urdu",
    "device": "mobile"
  }
}
```

**Response:**
```json
{
  "response": "Theek hai, 'meeting' task delete ho gaya.",
  "conversation_id": "conv-123",
  "timestamp": "2026-02-06T16:30:00+00:00",
  "metadata": {
    "user_id": "user-456",
    "token_verified": true
  }
}
```

**Security:**
- Verifies user_id matches JWT token
- Returns 403 Forbidden if mismatch
- All TaskToolbox operations scoped to authenticated user_id

---

### POST /api/{user_id}/chat/stream

**Purpose:** Stream chat responses in real-time using Server-Sent Events.

**Parameters:**
- `user_id` (path, required): User ID
- `message` (body, required): User's message
- `conversation_id` (body, required): Conversation ID
- `metadata` (body, optional): Additional metadata
- `Authorization` (header, required): "Bearer {jwt_token}"

**Response (Streaming):**
```
data: {"response": "You have 3 tasks:", "conversation_id": "conv-123", "status": "streaming"}
data: {"response": "1. Buy groceries", "conversation_id": "conv-123", "status": "complete"}
```

---

### GET /api/{user_id}/conversations

**Purpose:** List recent conversations for a user.

**Parameters:**
- `user_id` (path, required): User ID
- `limit` (query, optional): Number of conversations (default: 20)
- `Authorization` (header, required): "Bearer {jwt_token}"

---

### GET /api/health

**Purpose:** Health check for monitoring.

---

## JWT Token Validation

**Token Format:**
```json
{
  "sub": "user-456",
  "user_id": "user-456",
  "email": "user@example.com",
  "iat": 1707219000,
  "exp": 1707305400
}
```

**Verification Flow:**
1. Extract token from "Bearer {token}" Authorization header
2. Decode and verify signature using JWT_SECRET_KEY
3. Check token expiration
4. Verify user_id matches URL path parameter
5. Return 401/403 if any step fails

**Security:**
- All operations require valid JWT token
- user_id mismatch triggers 403 Forbidden
- Token expiration validated on every request

---

## Skill Integration

### TaskToolbox
Manages user tasks (all operations filtered by user_id):
- add_task(user_id, title, priority, due_date)
- list_tasks(user_id)
- complete_task(user_id, task_id)
- delete_task(user_id, task_id)

### ContextManager
Manages conversation context:
- fetch_chat_history(conversation_id, limit=10)
- record_interaction(conversation_id, user_msg, response)

### RomanUrduHandler
Parses Roman Urdu user intents:
- parse_urdu_intent(user_input) → operation, title, priority
- generate_urdu_response(operation, title) → Urdu response

---

## Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | user_id mismatch |
| 500 | Internal Server Error | Agent/API failure |

---

## Data Isolation

Each user can only:
- Access their own tasks (user_id filter)
- Access their own conversations (user_id filter)
- Verify against their JWT token
- Cannot access other users' data

---

## Configuration

```env
OPENAI_API_KEY=sk-xxx
JWT_SECRET_KEY=your-secret-key
OPENAI_MODEL=gpt-4-turbo
```

---

## Performance

| Operation | Latency |
|-----------|---------|
| JWT Verification | <1ms |
| Fetch Context | 50-100ms |
| Agent Execution | 1-5s |
| Record Interaction | 100-200ms |
| **Total** | **1-6s** |

Throughput: 100+ concurrent requests
