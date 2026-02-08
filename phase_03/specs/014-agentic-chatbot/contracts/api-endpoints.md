# API Contracts: Chat Endpoint & Task Operations

**Date**: 2026-02-08
**Feature**: 014-agentic-chatbot
**Format**: OpenAPI 3.0 (REST)

---

## Authentication

All requests require JWT Bearer token in Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

The JWT token contains:
- `sub`: user_id (matched against URL parameter)
- `iat`: issued at timestamp
- `exp`: expiration timestamp

**Validation**:
- If user_id in URL does NOT match JWT sub claim → 401 Unauthorized
- If token is expired → 401 Unauthorized
- If token is missing → 401 Unauthorized

---

## Endpoint: POST /api/{user_id}/chat

**Purpose**: Submit a user message to the chat and receive agent response

**Method**: POST

**Path Parameters**:
- `user_id` (string, required): User identifier; must match JWT `sub` claim

**Request Headers**:
- `Authorization` (string, required): Bearer JWT token
- `Content-Type` (string, required): application/json

**Request Body** (application/json):
```json
{
  "message": "Add task: buy groceries by Friday",
  "conversation_id": "optional_integer"
}
```

**Request Body Schema**:
- `message` (string, required): User input; 1-5000 characters
- `conversation_id` (integer, optional): Existing conversation to continue; if omitted, creates new conversation

**Success Response** (200 OK):
```json
{
  "status": "success",
  "response": {
    "message": "I've added 'buy groceries' to your task list with a due date of Friday!",
    "task_created": {
      "id": 123,
      "title": "buy groceries",
      "due_date": "2026-02-14",
      "priority": "medium",
      "status": "pending"
    },
    "tasks": [
      {
        "id": 123,
        "title": "buy groceries",
        "status": "pending",
        "priority": "medium",
        "due_date": "2026-02-14"
      }
    ],
    "conversation_id": 456
  }
}
```

**Response Body Schema**:
- `status` (string): "success" or "error"
- `response` (object):
  - `message` (string): Friendly assistant response
  - `task_created` (object, nullable): Task object if a task was created
  - `task_updated` (object, nullable): Task object if a task was updated
  - `task_deleted` (object, nullable): Task object that was deleted
  - `tasks` (array): All user tasks (after operation)
  - `conversation_id` (integer): Conversation ID for this session

**Error Responses**:

**400 Bad Request** - Invalid input:
```json
{
  "status": "error",
  "error_code": "INVALID_INPUT",
  "message": "message field is required"
}
```

**401 Unauthorized** - Token invalid or expired:
```json
{
  "status": "error",
  "error_code": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}
```

**404 Not Found** - User not found:
```json
{
  "status": "error",
  "error_code": "USER_NOT_FOUND",
  "message": "User does not exist"
}
```

**500 Internal Server Error** - Database or agent error:
```json
{
  "status": "error",
  "error_code": "INTERNAL_ERROR",
  "message": "An unexpected error occurred. Please try again."
}
```

**Performance Targets**:
- p50 latency: <1 second
- p95 latency: <3 seconds
- p99 latency: <5 seconds

**Idempotency**: Not idempotent (repeated requests may create duplicate tasks)

---

## Endpoint: GET /api/{user_id}/tasks

**Purpose**: Fetch all tasks for user (for Task List UI refresh)

**Method**: GET

**Path Parameters**:
- `user_id` (string, required): User identifier; must match JWT `sub` claim

**Query Parameters**:
- `status` (string, optional): Filter by status; "pending", "completed", or omit for all

**Request Headers**:
- `Authorization` (string, required): Bearer JWT token

**Success Response** (200 OK):
```json
{
  "status": "success",
  "tasks": [
    {
      "id": 123,
      "title": "buy groceries",
      "description": "weekly shopping",
      "status": "pending",
      "priority": "medium",
      "due_date": "2026-02-14",
      "created_at": "2026-02-08T10:30:00Z",
      "updated_at": "2026-02-08T10:30:00Z"
    },
    {
      "id": 124,
      "title": "call dentist",
      "description": null,
      "status": "completed",
      "priority": "high",
      "due_date": null,
      "created_at": "2026-02-07T14:22:00Z",
      "updated_at": "2026-02-08T09:15:00Z"
    }
  ]
}
```

**Response Body Schema**:
- `status` (string): "success"
- `tasks` (array of objects):
  - `id` (integer): Task ID
  - `title` (string): Task title
  - `description` (string, nullable): Task description
  - `status` (string): "pending" or "completed"
  - `priority` (string): "low", "medium", or "high"
  - `due_date` (string, nullable): ISO 8601 date
  - `created_at` (string): ISO 8601 timestamp
  - `updated_at` (string): ISO 8601 timestamp

**Error Responses**: Same as /chat endpoint (401, 404, 500)

**Performance Targets**:
- p50 latency: <500ms
- p95 latency: <1 second

---

## Endpoint: WebSocket /ws/{user_id}

**Purpose**: Establish bidirectional WebSocket for real-time chat and task updates

**Protocol**: WebSocket (wss:// for production, ws:// for development)

**Path Parameters**:
- `user_id` (string, required): User identifier; must match JWT `sub` claim

**Query Parameters**:
- `token` (string, optional): JWT token as query param (if not in Authorization header)

**Connection Handshake**:
```javascript
// Client
const ws = new WebSocket(`wss://api.example.com/ws/${user_id}?token=${jwt_token}`);

ws.onopen = () => {
  console.log("Connected to chat");
};
```

**Server Response on Connection**:
```json
{
  "type": "connection_established",
  "conversation_id": 456,
  "session_start": "2026-02-08T10:35:00Z"
}
```

**Client → Server Message Format**:
```json
{
  "type": "chat_message",
  "content": "Add task: buy groceries by Friday"
}
```

**Server → Client Response Format** (on chat action):
```json
{
  "type": "chat_response",
  "message": "I've added 'buy groceries' to your task list!",
  "task_created": {
    "id": 123,
    "title": "buy groceries",
    "status": "pending",
    "priority": "medium",
    "due_date": "2026-02-14"
  },
  "tasks": [
    {
      "id": 123,
      "title": "buy groceries",
      "status": "pending"
    }
  ]
}
```

**Server → Client Task Update** (when task changes):
```json
{
  "type": "task_updated",
  "tasks": [
    {
      "id": 123,
      "title": "buy groceries",
      "status": "completed"
    }
  ]
}
```

**Error Messages**:
```json
{
  "type": "error",
  "error_code": "INVALID_TOKEN",
  "message": "Token expired or invalid"
}
```

**Connection Closure**:
- Code 1000 (Normal Closure): User explicitly closed
- Code 1001 (Going Away): Server shutdown
- Code 1008 (Policy Violation): Unauthorized token
- Code 1011 (Server Error): Internal error

---

## MCP Tool Contracts

### TaskToolbox Tool: add_task

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {"type": "string"},
    "title": {"type": "string", "minLength": 1, "maxLength": 255},
    "description": {"type": "string", "nullable": true, "maxLength": 5000},
    "priority": {"enum": ["low", "medium", "high"], "default": "medium"},
    "due_date": {"type": "string", "format": "date", "nullable": true}
  },
  "required": ["user_id", "title"]
}
```

**Output**:
```json
{
  "success": true,
  "data": {
    "task_id": 123,
    "title": "buy groceries",
    "status": "pending",
    "priority": "medium",
    "due_date": "2026-02-14"
  }
}
```

**Errors**:
- `{"success": false, "error": "Title cannot be empty"}` (400)
- `{"success": false, "error": "Invalid priority"}` (400)
- `{"success": false, "error": "Task not found"}` (404)

---

### TaskToolbox Tool: complete_task

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {"type": "string"},
    "task_id": {"type": "string"}
  },
  "required": ["user_id", "task_id"]
}
```

**Output**:
```json
{
  "success": true,
  "data": {
    "task_id": 123,
    "title": "buy groceries",
    "status": "completed"
  }
}
```

---

### TaskToolbox Tool: delete_task

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {"type": "string"},
    "task_id": {"type": "string"}
  },
  "required": ["user_id", "task_id"]
}
```

**Output**:
```json
{
  "success": true,
  "data": {
    "task_id": 123,
    "title": "buy groceries",
    "status": "deleted"
  }
}
```

---

### TaskToolbox Tool: update_task

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {"type": "string"},
    "task_id": {"type": "string"},
    "title": {"type": "string", "nullable": true},
    "priority": {"enum": ["low", "medium", "high"], "nullable": true},
    "due_date": {"type": "string", "format": "date", "nullable": true}
  },
  "required": ["user_id", "task_id"]
}
```

**Output**:
```json
{
  "success": true,
  "data": {
    "task_id": 123,
    "title": "buy groceries",
    "priority": "high",
    "due_date": "2026-02-14"
  }
}
```

---

### TaskToolbox Tool: list_tasks

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {"type": "string"},
    "status_filter": {"enum": ["all", "pending", "completed"], "default": "all"}
  },
  "required": ["user_id"]
}
```

**Output**:
```json
{
  "success": true,
  "data": [
    {
      "task_id": 123,
      "title": "buy groceries",
      "status": "pending",
      "priority": "medium"
    }
  ]
}
```

---

### ContextManager Tool: get_message_history

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {"type": "string"},
    "limit": {"type": "integer", "default": 10, "maximum": 20}
  },
  "required": ["user_id"]
}
```

**Output**:
```json
{
  "success": true,
  "data": [
    {
      "role": "user",
      "content": "Add task: buy groceries"
    },
    {
      "role": "assistant",
      "content": "I've added that to your list!"
    }
  ]
}
```

---

### RomanUrduHandler Tool: parse_urdu_intent

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_input": {"type": "string"}
  },
  "required": ["user_input"]
}
```

**Output**:
```json
{
  "success": true,
  "data": {
    "operation": "add_task",
    "params": {
      "title": "milk khareedna"
    }
  }
}
```

---

## Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| INVALID_INPUT | 400 | Missing or malformed request body |
| UNAUTHORIZED | 401 | Token invalid, expired, or missing |
| FORBIDDEN | 403 | User lacks permission for resource |
| NOT_FOUND | 404 | Task, conversation, or user does not exist |
| CONFLICT | 409 | Operation conflicts with existing state |
| INTERNAL_ERROR | 500 | Unhandled server exception |
| DATABASE_ERROR | 503 | Database unavailable |

---

## Rate Limiting

**Plan**: Implement in Phase 2 (not in MVP)

**Future Strategy**:
- 60 requests/minute per user (chat endpoint)
- 100 requests/minute per user (task list endpoint)
- 429 Too Many Requests response with Retry-After header

---

## Versioning

**Current Version**: v1

**Strategy**: URL versioning (v1, v2, etc. in path)

**Backward Compatibility**:
- Old endpoints deprecated but supported for 6 months
- New major versions support parallel operation
- Client must specify version explicitly

---

## CORS Policy

**Allowed Origins**: https://example.com (production), http://localhost:3000 (development)

**Allowed Methods**: GET, POST, OPTIONS

**Allowed Headers**: Authorization, Content-Type

**Credentials**: allowed (cookies/auth headers)

---

## Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/{user_id}/chat | POST | Submit message and get agent response |
| /api/{user_id}/tasks | GET | Fetch all tasks for user |
| /ws/{user_id} | WebSocket | Real-time bidirectional chat + task updates |

All endpoints require JWT authentication and enforce user_id isolation per Constitution Principle III (Privacy & Isolation).
