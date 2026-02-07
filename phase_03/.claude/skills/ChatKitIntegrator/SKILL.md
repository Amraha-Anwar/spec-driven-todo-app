---
name: chatkit-integrator
description: FastAPI skill for integrating ChatKit frontend with OpenAI Agents SDK backend. Use when you need to handle request/response mapping between ChatKit and agents, attach MCP skills (TaskToolbox, ContextManager, RomanUrduHandler), and secure endpoints with JWT token verification. Implements POST /api/{user_id}/chat endpoint that enforces user_id matches JWT session token for data isolation.
---

# chatkit-integrator

## Overview

ChatKitIntegrator bridges ChatKit frontend with OpenAI Agents SDK backend. It secures endpoints with JWT authentication, attaches MCP skills, routes messages to agents, and streams responses back—all while enforcing strict user_id isolation.

## Quick Start

### 1. Install Dependencies

```bash
pip install fastapi openai pydantic httpx PyJWT
```

### 2. Configure Environment

```bash
export OPENAI_API_KEY="sk-..."
export JWT_SECRET_KEY="your-secret-key"
```

### 3. Add Routes to FastAPI App

```python
from fastapi import FastAPI
from scripts.fastapi_routes import router

app = FastAPI()
app.include_router(router)
```

### 4. Run FastAPI

```bash
uvicorn main:app --reload
```

## API Endpoints

### POST /api/{user_id}/chat

Send chat message and get agent response.

**Request:**
```bash
curl -X POST "http://localhost:8000/api/user-456/chat" \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Mera meeting wala task delete kar do",
    "conversation_id": "conv-123"
  }'
```

**Response:**
```json
{
  "response": "Theek hai, 'meeting' task delete ho gaya.",
  "conversation_id": "conv-123",
  "timestamp": "2026-02-06T16:30:00+00:00"
}
```

### POST /api/{user_id}/chat/stream

Stream responses using Server-Sent Events for real-time updates.

### GET /api/{user_id}/conversations

List user's conversations (via ContextManager).

### GET /api/health

Health check endpoint.

## Security Features

### JWT Token Verification

Every request validates:
1. Authorization header present
2. JWT token valid and not expired
3. user_id matches URL path
4. All operations scoped to authenticated user_id

**Returns:**
- `401 Unauthorized` - Invalid/missing token
- `403 Forbidden` - user_id mismatch
- `200 OK` - Success

### User Data Isolation

- TaskToolbox operations filtered by user_id
- ContextManager conversations scoped by user_id
- Cannot access other users' tasks or conversations

## Skill Integration

### Attached MCP Skills

**TaskToolbox:** Manage tasks
- add_task(user_id, title, priority)
- list_tasks(user_id)
- complete_task(user_id, task_id)
- delete_task(user_id, task_id)

**ContextManager:** Manage conversation context
- fetch_chat_history(conversation_id)
- record_interaction(conversation_id, user_msg, response)

**RomanUrduHandler:** Parse Urdu intents
- parse_urdu_intent(user_input) → operation, title, priority
- generate_urdu_response(operation, title) → Urdu response

## Request Flow

```
ChatKit Frontend
    ↓ POST /api/{user_id}/chat
    ↓
[Verify JWT + user_id]
    ↓
[Fetch context from ContextManager]
    ↓
[Create OpenAI Agent with MCP skills]
    ↓
[Process message with agent]
    ↓
[Record interaction in ContextManager]
    ↓
[Stream response to ChatKit]
    ↓
ChatKit Frontend
```

## Configuration

**Environment Variables:**

```env
OPENAI_API_KEY=sk-xxx
JWT_SECRET_KEY=your-secret-key
OPENAI_MODEL=gpt-4-turbo
```

## References

For detailed API documentation, see:
- **[api-schema.md](references/api-schema.md)** - Complete endpoint specifications, security, error handling, and examples

## Script

The `fastapi_routes.py` script includes:
- JWT token verification and user_id validation
- ChatKitAgentRunner class for OpenAI Agents SDK integration
- FastAPI routes for chat, streaming, conversations, and health check
- Error handling and logging
- MCP skill attachment and coordination

Add to FastAPI app:
```python
from scripts.fastapi_routes import router
app.include_router(router)
```

## Example Usage

### Task Management in Roman Urdu

```
User: "Mera meeting wala task delete kar do"
  ↓
Agent (via RomanUrduHandler):
  parse_urdu_intent() → operation: delete, title: meeting
  
Agent (via TaskToolbox):
  Find task with title "meeting" for user_id
  delete_task(user_id, task_id)
  
Agent (via RomanUrduHandler):
  generate_urdu_response() → "Theek hai, 'meeting' task delete ho gaya."
  
Response: "Theek hai, 'meeting' task delete ho gaya."
```

### Multi-Turn Conversation

```
Turn 1:
User: "Create a task for tomorrow"
Agent: "I'll create a task for tomorrow"

Turn 2:
User: "What's my priority item?"
Agent: (uses ContextManager to fetch history)
       "Based on our conversation, you wanted to create a task for tomorrow.
        Let me list your current tasks..."
```
