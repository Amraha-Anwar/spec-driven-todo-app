---
name: context-manager
description: MCP Server skill for stateless conversation context management using Neon PostgreSQL. Use when you need to maintain multi-turn conversation history with automatic context rebuild on every request. Implements fetch_chat_history (retrieve last N messages) and record_interaction (save user/assistant messages) tools for building stateless request cycles that don't require in-memory session state.
---

# context-manager

## Overview

ContextManager is an MCP Server that manages conversation context using Neon PostgreSQL. It enables stateless request cycles where each prompt rebuilds context from the database, eliminating in-memory state and enabling horizontal scaling. Perfect for multi-agent systems and long-running conversations that need persistent memory.

## Quick Start

### 1. Install Dependencies

```bash
pip install mcp sqlmodel python-dotenv psycopg2-binary
```

### 2. Configure Neon Database

Get connection string from https://neon.tech:

```bash
export NEON_DATABASE_URL="postgresql://user:password@ep-xxxx.us-east-1.neon.tech/dbname?sslmode=require"
```

### 3. Run the Server

```bash
python scripts/mcp_server.py
```

## Available Tools

ContextManager exposes 5 tools for conversation management:

### fetch_chat_history
Retrieve the last N messages from a conversation to rebuild context.

**Usage:**
```
fetch_chat_history(
  conversation_id="conv-123",
  limit=10
)
```

Returns conversation metadata and messages array ordered chronologically.

### record_interaction
Save a user message and assistant response to the conversation history.

**Usage:**
```
record_interaction(
  conversation_id="conv-123",
  user_message="What's the capital of France?",
  assistant_response="The capital of France is Paris.",
  metadata='{"model": "claude-opus", "tokens": 150}'
)
```

Both messages created in a single transaction. Updates conversation `updated_at`.

### create_conversation
Create a new conversation for a user.

**Usage:**
```
create_conversation(
  user_id="user-456",
  title="Technical Discussion"
)
```

Returns conversation ID and metadata.

### get_conversation
Get conversation metadata.

**Usage:**
```
get_conversation(conversation_id="conv-123")
```

Lightweight metadata query (no messages).

### list_conversations
List recent conversations for a user.

**Usage:**
```
list_conversations(
  user_id="user-456",
  limit=20
)
```

Ordered by most recently updated first.

## Key Design Principles

### Stateless Request Cycle

1. **Fetch:** `fetch_chat_history()` to rebuild context
2. **Process:** Execute request with context (LLM reasoning)
3. **Record:** `record_interaction()` to persist exchange
4. **Release:** All state released; next request rebuilds

No session affinity required. Safe for concurrent execution.

### Database as Source of Truth

- All state stored in Neon PostgreSQL
- No in-memory caching
- Every request queries database
- Enables horizontal scaling

### Data Isolation

Each conversation scoped by:
- `conversation_id` - Groups messages together
- `user_id` - Isolates user's conversations
- Automatic cascade delete on conversation removal

## Stateless Request Pattern

```
┌─────────────────────────────────────────────┐
│ New Request (No prior state)                │
├─────────────────────────────────────────────┤
│ 1. fetch_chat_history(conv_id, limit=10)   │
│    ↓ Rebuild context from DB               │
│ 2. Process request with context            │
│    ↓ LLM reasoning using history           │
│ 3. record_interaction(conv_id, msg, resp)  │
│    ↓ Persist to DB                         │
│ 4. Response sent; state released           │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ Next Request (DB rebuilt context)          │
├─────────────────────────────────────────────┤
│ 1. fetch_chat_history(conv_id, limit=10)   │
│    ↓ Includes previous interaction         │
│ ...continues...                             │
└─────────────────────────────────────────────┘
```

## Performance

### Query Indexes

Optimized for common operations:
- `conversation.user_id` + `updated_at` - List user's conversations
- `message.conversation_id` + `created_at` - Fetch history
- All foreign keys indexed for integrity

### Latency

- `fetch_chat_history(limit=10)` - ~50-100ms (single round-trip)
- `record_interaction()` - ~100-200ms (two INSERTs + UPDATE)
- `list_conversations(limit=20)` - ~50-100ms

### Scalability

- **Horizontal:** Stateless = no session affinity needed
- **Vertical:** Neon handles 100+ concurrent connections
- **Typical:** 1000+ messages/second write throughput

## References

For detailed information, see:

- **[api-schema.md](references/api-schema.md)** - Complete API reference with all tool signatures, return values, error handling, and examples
- **[setup-guide.md](references/setup-guide.md)** - Installation, Neon setup, troubleshooting, performance tuning, advanced patterns

## Script

The `mcp_server.py` script is the complete MCP server implementation. It includes:

- `Conversation` and `Message` SQLModel definitions
- `ContextService` class with all 5 CRUD operations
- MCP server setup with tool definitions
- Neon PostgreSQL connection with SSL
- Error handling and logging
- Connection pooling and auto-recycling

Run with:
```bash
python scripts/mcp_server.py
```

## Example: Multi-Turn Conversation

```python
from scripts.mcp_server import ContextService

# Create conversation
conv = ContextService.create_conversation("user-456", "Debug Session")
conv_id = conv["id"]

# Turn 1
history = ContextService.fetch_chat_history(conv_id, limit=10)
response1 = llm.generate("What's a mutex?", history["messages"])
ContextService.record_interaction(conv_id, "What's a mutex?", response1)

# Turn 2 (includes Turn 1 in context)
history = ContextService.fetch_chat_history(conv_id, limit=10)
response2 = llm.generate("How about semaphores?", history["messages"])
ContextService.record_interaction(conv_id, "How about semaphores?", response2)

# Turn 3 (includes all previous)
history = ContextService.fetch_chat_history(conv_id, limit=10)
print(f"Context contains {history['message_count']} messages")
```
