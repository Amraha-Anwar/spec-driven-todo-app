# ContextManager Setup Guide

## Overview

ContextManager is an MCP Server that manages stateless conversation context using Neon PostgreSQL. It enables agents to rebuild conversation context from the database on every request, eliminating the need for in-memory state management.

## Prerequisites

- Python 3.8+
- Neon PostgreSQL account (https://neon.tech)
- pip package manager

## Installation

### Step 1: Install Dependencies

```bash
pip install mcp sqlmodel python-dotenv psycopg2-binary
```

**Required packages:**
- `mcp` - Official Anthropic Model Context Protocol SDK
- `sqlmodel` - SQL models with Pydantic integration
- `python-dotenv` - Environment variable management
- `psycopg2-binary` - PostgreSQL adapter

### Step 2: Set Up Neon Database

#### Create Neon Project

1. Go to https://neon.tech and create a free account
2. Create a new project
3. Copy the connection string from "Connection string" tab

#### Set Environment Variable

```bash
export NEON_DATABASE_URL="postgresql://user:password@ep-xxxx.us-east-1.neon.tech/dbname?sslmode=require"
```

Or add to `.env` file:

```env
NEON_DATABASE_URL=postgresql://user:password@ep-xxxx.us-east-1.neon.tech/dbname?sslmode=require
```

**Note:** The server automatically appends `?sslmode=require` for Neon.

### Step 3: Create Tables

The server automatically creates tables on startup:

```bash
python scripts/mcp_server.py
```

Tables created:
- `conversation` - Stores conversation metadata
- `message` - Stores individual messages

## Running the Server

### Standalone Mode

```bash
python scripts/mcp_server.py
```

The server will:
1. Load NEON_DATABASE_URL from `.env`
2. Create database tables if they don't exist
3. Initialize the MCP server
4. Wait for client connections

### Integrated with Claude Code

Configure in your Claude Code settings to use the ContextManager MCP server.

## Architecture

### Stateless Design

Every request:
1. Fetches context from database
2. Processes request with context
3. Persists interaction to database
4. Releases all state

This enables:
- Horizontal scaling (no session affinity needed)
- Zero data loss (database is source of truth)
- Concurrent execution (each request independent)

### Data Model

**Conversations:** Group messages by conversation_id and user_id
**Messages:** Individual user/assistant exchanges with timestamps

```
Conversation (1) ← → (Many) Message
  id                  id
  user_id             conversation_id
  title               role
  created_at          content
  updated_at          metadata
                      created_at
```

### Indexes

Optimized for common queries:
- `conversation.user_id` - Find user's conversations
- `conversation.updated_at` - Sort by most recent
- `message.conversation_id` - Fetch history
- `message.created_at` - Sort chronologically
- `message.role` - Filter by user/assistant

## Usage Pattern

### Standard Request Cycle

```python
# Start of request
history = fetch_chat_history(conversation_id, limit=10)
context = history["messages"]

# Process with context (LLM reasoning)
response = llm.generate(prompt, context)

# End of request
record_interaction(
    conversation_id=conversation_id,
    user_message=user_input,
    assistant_response=response
)
```

### Create Conversation

```python
conversation = create_conversation(
    user_id="user-456",
    title="Technical Discussion"
)
conversation_id = conversation["id"]
```

### List Conversations

```python
conversations = list_conversations(user_id="user-456", limit=20)
```

## Development

### Testing

Create a test script:

```python
import os
from dotenv import load_dotenv
from scripts.mcp_server import ContextService

load_dotenv()

# Create conversation
conv = ContextService.create_conversation("test-user", "Test Chat")
conv_id = conv["id"]

# Record interaction
ContextService.record_interaction(
    conv_id,
    "Hello, how are you?",
    "I'm doing well, thank you for asking!"
)

# Fetch history
history = ContextService.fetch_chat_history(conv_id, limit=10)
print(f"Messages in conversation: {history['message_count']}")
for msg in history["messages"]:
    print(f"  {msg['role']}: {msg['content'][:50]}...")
```

Run:
```bash
python test_context.py
```

### Extending ContextService

Add new operations:

```python
class ContextService:
    @staticmethod
    def search_messages(conversation_id: str, query: str) -> list:
        """Search messages by content"""
        with get_session() as session:
            statement = select(Message).where(
                Message.conversation_id == conversation_id,
                Message.content.ilike(f"%{query}%")
            )
            messages = session.exec(statement).all()
            return [ContextService._message_to_dict(msg) for msg in messages]
```

Expose via MCP:

```python
@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        # ... existing tools ...
        Tool(
            name="search_messages",
            description="Search messages in a conversation",
            inputSchema={...}
        )
    ]
```

## Performance Tuning

### Connection Pool

Default configuration:
- Pool size: 5-10 connections
- Pool recycle: 3600 seconds (1 hour)
- Pre-ping: Enabled (verify connections)

Adjust if needed:

```python
engine = create_engine(
    DATABASE_URL,
    pool_size=20,          # For high concurrency
    max_overflow=10,       # Additional overflow connections
    pool_recycle=1800,     # More frequent recycle
    pool_pre_ping=True,
    connect_args={"sslmode": "require"}
)
```

### Query Optimization

Current indexes support:

```sql
-- Fast: Fetch recent conversations for user
SELECT * FROM conversation
WHERE user_id = ?
ORDER BY updated_at DESC
LIMIT 20;

-- Fast: Fetch history for conversation
SELECT * FROM message
WHERE conversation_id = ?
ORDER BY created_at DESC
LIMIT 10;

-- Slow: Search all messages (use pagination)
SELECT * FROM message
WHERE content LIKE ?;
```

Add index for search:

```python
class Message(SQLModel, table=True):
    # ...
    __table_args__ = (
        Index('idx_content_search', 'content', postgresql_using='gin'),
    )
```

## Troubleshooting

### "NEON_DATABASE_URL environment variable is not set"

**Solution:** Set environment variable:
```bash
export NEON_DATABASE_URL="postgresql://..."
```

Or create `.env` file:
```
NEON_DATABASE_URL=postgresql://...
```

### SSL Certificate Verification Error

**Solution:** Ensure connection string includes `?sslmode=require`:
```
postgresql://user:pass@host/db?sslmode=require
```

Neon requires SSL connections.

### "Conversation not found" Error

**Solution:** Verify conversation exists:
```python
conv = get_conversation(conversation_id)
```

Or create new:
```python
conv = create_conversation(user_id, title)
```

### Connection Pool Exhausted

**Solution:**
1. Check for hanging connections (long-running transactions)
2. Increase pool size
3. Reduce timeout values
4. Verify connection is properly closed

### Slow Queries

**Solution:**
1. Check indexes exist: `\d message` in psql
2. Use `EXPLAIN` to analyze query plan
3. Add indexes for frequently searched fields
4. Paginate large result sets

## Security Best Practices

### User Validation

Current implementation trusts `user_id`. Production should:

```python
@staticmethod
def fetch_chat_history_secure(conversation_id: str, user_id: str, limit: int = 10) -> dict:
    """Fetch history with user authorization check"""
    with get_session() as session:
        # Verify conversation belongs to user
        conversation = session.get(Conversation, conversation_id)
        if not conversation or conversation.user_id != user_id:
            raise ValueError("Unauthorized")
        # ... rest of implementation
```

### Connection String Security

Never hardcode credentials:
```bash
# ✅ Good
export NEON_DATABASE_URL="postgresql://..."

# ❌ Bad
DATABASE_URL = "postgresql://user:password@host/db"
```

### Message Content

Consider encryption for sensitive data:
```python
from cryptography.fernet import Fernet

cipher = Fernet(key)
encrypted_content = cipher.encrypt(message_content.encode())
```

## Monitoring

### Log Performance

```python
import time
start = time.time()
history = fetch_chat_history(conv_id)
duration = time.time() - start
logger.info(f"fetch_chat_history took {duration:.3f}s")
```

### Database Metrics

In Neon dashboard:
- Query count and duration
- Connection count
- Storage usage
- Replication lag

### Application Metrics

Track:
- fetch_chat_history latency (should be <100ms)
- record_interaction latency (should be <200ms)
- Error rates
- Conversation size distribution

## Advanced Topics

### Multi-Turn Conversations

Use the standard cycle:

```python
# Turn 1
history = fetch_chat_history(conv_id, limit=10)
response1 = process(history["messages"])
record_interaction(conv_id, user_msg_1, response1)

# Turn 2 (context includes Turn 1)
history = fetch_chat_history(conv_id, limit=10)
response2 = process(history["messages"])
record_interaction(conv_id, user_msg_2, response2)
```

Context automatically includes previous exchange.

### Branching Conversations

Create multiple conversations to explore alternatives:

```python
# Original conversation
conv1 = create_conversation(user_id, "Approach A")

# Alternative path
conv2 = create_conversation(user_id, "Approach B")
```

Both maintain independent histories.

### Metadata for Analytics

Store metadata about interactions:

```python
import json

metadata = json.dumps({
    "model": "claude-opus",
    "tokens": 1500,
    "temperature": 0.7,
    "latency_ms": 450,
    "user_action": "like"  # Feedback
})

record_interaction(
    conv_id,
    user_msg,
    response,
    metadata=metadata
)
```

Query metadata:

```python
history = fetch_chat_history(conv_id)
for msg in history["messages"]:
    if msg["metadata"]:
        meta = json.loads(msg["metadata"])
        print(f"Model: {meta.get('model')}, Tokens: {meta.get('tokens')}")
```

## Additional Resources

- **MCP Protocol:** https://spec.anthropic.com/
- **SQLModel Documentation:** https://sqlmodel.tiangolo.com/
- **Neon Documentation:** https://neon.tech/docs/
- **PostgreSQL Indexing:** https://www.postgresql.org/docs/current/indexes.html
- **API Schema:** See `api-schema.md` in this directory
