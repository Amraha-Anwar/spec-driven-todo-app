# ContextManager MCP API Schema

## Overview

ContextManager exposes 5 stateless tools for managing conversation context in Neon PostgreSQL. The service maintains conversation history and enables stateless request cycles by rebuilding context from the database for every prompt.

## Core Design

**Stateless Request Cycle:**
1. User sends prompt with `conversation_id`
2. Agent calls `fetch_chat_history()` to rebuild context
3. Agent processes request with full context
4. Agent calls `record_interaction()` to persist messages
5. Next request rebuilds context again from DB

This ensures no in-memory state and enables horizontal scaling.

## Tools

### 1. fetch_chat_history

**Purpose:** Retrieve the last N messages from a conversation for context rebuilding.

**Parameters:**
- `conversation_id` (string, required): Conversation ID
- `limit` (integer, optional): Number of messages to retrieve (default: 10, max: 100)

**Returns:**
```json
{
  "conversation_id": "conv-123",
  "user_id": "user-456",
  "title": "Project Discussion",
  "message_count": 10,
  "created_at": "2026-02-06T15:30:00+00:00",
  "updated_at": "2026-02-06T16:00:00+00:00",
  "messages": [
    {
      "id": "msg-001",
      "conversation_id": "conv-123",
      "role": "user",
      "content": "How do I implement authentication?",
      "metadata": null,
      "created_at": "2026-02-06T15:30:00+00:00"
    },
    {
      "id": "msg-002",
      "conversation_id": "conv-123",
      "role": "assistant",
      "content": "You can use JWT tokens...",
      "metadata": null,
      "created_at": "2026-02-06T15:31:00+00:00"
    }
  ]
}
```

**Error Cases:**
- `ValueError: Conversation {id} not found` - Conversation does not exist
- Invalid `limit` - Must be between 1 and 100

**Notes:**
- Messages are returned in chronological order (oldest first)
- Ideal for rebuilding context at the start of each request
- Fetching 10 messages is typical for LLM context windows

---

### 2. record_interaction

**Purpose:** Save a user message and assistant response to the conversation history.

**Parameters:**
- `conversation_id` (string, required): Conversation ID
- `user_message` (string, required): User's message content
- `assistant_response` (string, required): Assistant's response content
- `metadata` (string, optional): JSON metadata about the interaction

**Returns:**
```json
{
  "conversation_id": "conv-123",
  "user_message": {
    "id": "msg-003",
    "conversation_id": "conv-123",
    "role": "user",
    "content": "What about OAuth?",
    "metadata": null,
    "created_at": "2026-02-06T16:00:00+00:00"
  },
  "assistant_message": {
    "id": "msg-004",
    "conversation_id": "conv-123",
    "role": "assistant",
    "content": "OAuth 2.0 is an authorization framework...",
    "metadata": null,
    "created_at": "2026-02-06T16:00:00+00:00"
  },
  "recorded_at": "2026-02-06T16:00:00+00:00"
}
```

**Error Cases:**
- `ValueError: Conversation {id} not found` - Conversation does not exist
- Empty content strings - Both messages must have content

**Notes:**
- Saves both messages and updates conversation `updated_at` timestamp
- Call this at the end of each request to persist the exchange
- Metadata can be used for tags, tokens, performance metrics, etc.
- Both messages are created in a single transaction

---

### 3. create_conversation

**Purpose:** Create a new conversation for a user.

**Parameters:**
- `user_id` (string, required): User ID
- `title` (string, optional): Conversation title

**Returns:**
```json
{
  "id": "conv-789",
  "user_id": "user-456",
  "title": "Authentication Discussion",
  "created_at": "2026-02-06T16:00:00+00:00",
  "updated_at": "2026-02-06T16:00:00+00:00"
}
```

**Error Cases:** None (always succeeds)

**Notes:**
- ID is auto-generated (UUID)
- Title can be updated later by storing in `metadata` of messages
- New conversations start empty (no messages)

---

### 4. get_conversation

**Purpose:** Get conversation metadata.

**Parameters:**
- `conversation_id` (string, required): Conversation ID

**Returns:**
```json
{
  "id": "conv-123",
  "user_id": "user-456",
  "title": "Project Discussion",
  "created_at": "2026-02-06T15:30:00+00:00",
  "updated_at": "2026-02-06T16:00:00+00:00"
}
```

**Error Cases:**
- `ValueError: Conversation {id} not found` - Conversation does not exist

**Notes:**
- Fast metadata-only query
- Does not include messages; use `fetch_chat_history()` for messages

---

### 5. list_conversations

**Purpose:** List recent conversations for a user.

**Parameters:**
- `user_id` (string, required): User ID
- `limit` (integer, optional): Number of conversations to retrieve (default: 20, max: 100)

**Returns:**
```json
[
  {
    "id": "conv-123",
    "user_id": "user-456",
    "title": "Project Discussion",
    "created_at": "2026-02-06T15:30:00+00:00",
    "updated_at": "2026-02-06T16:00:00+00:00"
  },
  {
    "id": "conv-456",
    "user_id": "user-456",
    "title": "Database Design",
    "created_at": "2026-02-05T10:00:00+00:00",
    "updated_at": "2026-02-06T14:00:00+00:00"
  }
]
```

**Error Cases:** None (returns empty array if no conversations)

**Notes:**
- Sorted by `updated_at` descending (most recently updated first)
- Does not include messages

---

## Data Model

### Conversation

```
{
  "id": string (UUID, primary key),
  "user_id": string (indexed, required),
  "title": string or null (optional),
  "created_at": datetime (ISO 8601, indexed),
  "updated_at": datetime (ISO 8601, indexed)
}
```

### Message

```
{
  "id": string (UUID, primary key),
  "conversation_id": string (foreign key, indexed),
  "role": string (indexed, required, "user" or "assistant"),
  "content": string (required),
  "metadata": string or null (JSON, optional),
  "created_at": datetime (ISO 8601, indexed)
}
```

## Stateless Request Cycle Pattern

```
Request Start
  ↓
1. fetch_chat_history(conversation_id, limit=10)  # Rebuild context
  ↓
2. Process request with context (LLM reasoning)
  ↓
3. record_interaction(conversation_id, user_msg, assistant_msg)  # Persist
  ↓
Request End (No state retained)
  ↓
Next Request Start (Context rebuilt from DB)
```

## Performance Characteristics

### Queries

| Operation | Query | Indexes | Performance |
|-----------|-------|---------|-------------|
| fetch_chat_history | SELECT * FROM message WHERE conversation_id = ? ORDER BY created_at DESC LIMIT N | (conversation_id, created_at) | O(log n + N) |
| record_interaction | INSERT 2 messages + UPDATE conversation | (conversation_id) | O(1) |
| get_conversation | SELECT * FROM conversation WHERE id = ? | (id) | O(1) |
| list_conversations | SELECT * FROM conversation WHERE user_id = ? ORDER BY updated_at DESC LIMIT N | (user_id, updated_at) | O(log n + N) |

### Scalability

- **Stateless:** No in-memory state = horizontal scaling
- **Database Bottleneck:** Neon PostgreSQL handles read/write scaling
- **Connection Pooling:** 5-10 connections per process
- **Typical Load:** 100+ concurrent conversations, 1000+ messages/second

## Error Handling

All errors returned as `ToolResult` with `isError=true`:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: Conversation xyz not found"
    }
  ],
  "isError": true
}
```

## Security Considerations

### Data Isolation

Currently `user_id` is trusted from caller. Production should:
1. Validate `user_id` format
2. Verify user exists in User table
3. Authenticate caller's identity before accepting `user_id`

### Message Content

- Messages stored as plaintext in database
- Use application-level encryption if sensitive
- Metadata can store encrypted tokens or hashes

### Database Access

All queries use SQLModel's parameterized queries (SQLAlchemy ORM), preventing SQL injection.

## Examples

### Rebuild context at request start
```python
history = ContextService.fetch_chat_history(
    conversation_id="conv-123",
    limit=10
)
messages = history["messages"]
# Use messages to reconstruct LLM context
```

### Record exchange after processing
```python
result = ContextService.record_interaction(
    conversation_id="conv-123",
    user_message="What's the capital of France?",
    assistant_response="The capital of France is Paris.",
    metadata='{"model": "claude-opus", "tokens": 150}'
)
```

### Start new conversation
```python
conversation = ContextService.create_conversation(
    user_id="user-456",
    title="Technical Discussion"
)
conversation_id = conversation["id"]
```

### List user's conversations
```python
conversations = ContextService.list_conversations(
    user_id="user-456",
    limit=20
)
```
