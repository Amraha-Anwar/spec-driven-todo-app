# Phase 1 Design: Data Model

**Date**: 2026-02-08
**Feature**: 014-agentic-chatbot
**Purpose**: Define entities, relationships, validation rules, and state transitions

---

## Entity Relationships

```
User (from Phase II authentication)
  ├── Task (user owns many tasks)
  ├── Conversation (user owns many conversations)
  └── Message (user owns many messages via conversation)

Conversation
  └── Message (one-to-many; cascade delete on conversation)

Task
  (standalone; no conversation reference; task creation may be triggered by conversation but state is independent)
```

---

## Core Entities

### 1. User (Existing, from Phase II)

**Purpose**: Represents an authenticated user; established by signup/signin flow

**Fields**:
- `id` (VARCHAR 255, PRIMARY KEY): Unique user identifier from auth system
- `email` (VARCHAR 255, UNIQUE): User email
- `name` (VARCHAR 255): Display name
- `created_at` (TIMESTAMP): Account creation timestamp
- `updated_at` (TIMESTAMP): Last profile update

**Constraints**:
- `id` MUST match JWT `sub` claim for authorization
- Email must be valid per email validation rules

**Relationships**:
- Owns many Task (one-to-many, CASCADE on delete)
- Owns many Conversation (one-to-many, CASCADE on delete)
- Owns many Message (one-to-many, CASCADE on delete)

---

### 2. Task (Existing from Phase II, Extended)

**Purpose**: Represents a single task created by user; can be created via chat or task list UI

**Fields**:
- `id` (INTEGER, PRIMARY KEY AUTO_INCREMENT): Unique task ID
- `user_id` (VARCHAR 255, FOREIGN KEY): Reference to User.id (CASCADE on delete)
- `title` (VARCHAR 255, NOT NULL): Task title/name (max 255 chars)
- `description` (TEXT, NULLABLE): Optional detailed description
- `status` (VARCHAR 20, DEFAULT='pending', CHECK): One of ['pending', 'completed']
- `priority` (VARCHAR 20, DEFAULT='medium', CHECK): One of ['low', 'medium', 'high']
- `due_date` (DATE, NULLABLE): Optional deadline
- `created_at` (TIMESTAMP, DEFAULT=NOW()): Created timestamp
- `updated_at` (TIMESTAMP, DEFAULT=NOW()): Last modified timestamp

**Constraints**:
- `title` is required and must not be empty or whitespace-only
- `priority` must be one of the enumerated values
- `status` must be one of the enumerated values
- `due_date` must be valid date format (YYYY-MM-DD)
- `user_id` must exist in User table

**Validation Rules**:
- Title: 1-255 characters, no null
- Description: 0-5000 characters, optional
- Priority: Default to 'medium' if not specified
- Due Date: Future-preferred but past dates allowed
- Status: Immutable once set to 'completed' (soft constraint in application logic)

**Indexes**:
```sql
CREATE INDEX idx_task_user_id ON task(user_id);
CREATE INDEX idx_task_user_status ON task(user_id, status);
CREATE INDEX idx_task_due_date ON task(user_id, due_date) WHERE due_date IS NOT NULL;
```

**State Transitions**:
```
pending → [add_task] ─→ pending (initial state)
pending → [complete_task] ─→ completed
completed → (no transition back to pending in MVP)
pending/completed → [update_task] ─→ pending/completed (fields updated, status may remain same)
pending/completed → [delete_task] ─→ (removed from database)
```

---

### 3. Conversation (New for Phase III)

**Purpose**: Represents a chat session; groups related messages and context

**Fields**:
- `id` (INTEGER, PRIMARY KEY AUTO_INCREMENT): Unique conversation ID
- `user_id` (VARCHAR 255, FOREIGN KEY): Reference to User.id (CASCADE on delete)
- `created_at` (TIMESTAMP, DEFAULT=NOW()): Conversation start time
- `last_activity` (TIMESTAMP, DEFAULT=NOW()): Timestamp of last message
- `context_token_count` (INTEGER, DEFAULT=0): Estimated token count (for billing/limits)

**Constraints**:
- `user_id` must exist in User table
- `created_at` must not be null
- `last_activity` updated automatically on each message add

**Indexes**:
```sql
CREATE INDEX idx_conversation_user_id ON conversation(user_id);
CREATE INDEX idx_conversation_last_activity ON conversation(user_id, last_activity DESC);
```

**State Transitions**:
```
(new conversation) → [POST /api/{user_id}/chat] → active
active → [add message] → active (last_activity updated)
active → [delete conversation] → (removed)
```

**Note**: Conversations can be pruned/archived if inactive for >90 days (not in MVP).

---

### 4. Message (New for Phase III)

**Purpose**: Represents a single message in a conversation; persists user input and assistant responses

**Fields**:
- `id` (INTEGER, PRIMARY KEY AUTO_INCREMENT): Unique message ID
- `user_id` (VARCHAR 255, FOREIGN KEY): Reference to User.id (CASCADE on delete)
- `conversation_id` (INTEGER, FOREIGN KEY): Reference to Conversation.id (CASCADE on delete)
- `role` (VARCHAR 20, NOT NULL, CHECK): One of ['user', 'assistant']
- `content` (TEXT, NOT NULL): Message text (no length limit; may be large)
- `timestamp` (TIMESTAMP, DEFAULT=NOW()): When message was created

**Constraints**:
- `user_id` must exist in User table
- `conversation_id` must exist in Conversation table
- `role` must be exactly 'user' or 'assistant'
- `content` must not be empty or null

**Validation Rules**:
- Role: Immutable after creation
- Content: 1+ characters (no empty messages)
- Timestamp: Set automatically; user cannot override

**Indexes**:
```sql
CREATE INDEX idx_message_user_timestamp ON message(user_id, timestamp DESC);
CREATE INDEX idx_message_conversation ON message(conversation_id);
CREATE INDEX idx_message_role ON message(user_id, role);
```

**State Transitions**:
```
(new message) → [ContextManager.store_message] → persisted
persisted → (immutable) → persisted
persisted → [conversation delete] → deleted (cascade)
```

**Retention Policy**:
- Messages retained indefinitely in MVP
- Future: Archive messages >6 months old (out of scope)

---

## SQLModel Definitions

### Python Model: Task

```python
# backend/src/models/task.py
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    """Task entity persisted to PostgreSQL"""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, foreign_key="user.id")
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=5000)
    status: str = Field(default="pending")  # pending | completed
    priority: str = Field(default="medium")  # low | medium | high
    due_date: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<Task id={self.id} title={self.title} status={self.status}>"
```

### Python Model: Conversation

```python
# backend/src/models/conversation.py
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Conversation(SQLModel, table=True):
    """Chat conversation session"""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    context_token_count: int = Field(default=0)

    def __repr__(self) -> str:
        return f"<Conversation id={self.id} user_id={self.user_id}>"
```

### Python Model: Message

```python
# backend/src/models/message.py
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional, Literal

class Message(SQLModel, table=True):
    """Single message in a conversation"""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, foreign_key="user.id")
    conversation_id: int = Field(foreign_key="conversation.id")
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1)
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)

    def __repr__(self) -> str:
        return f"<Message id={self.id} role={self.role} timestamp={self.timestamp}>"
```

---

## Query Patterns

### Task Queries

**Get all tasks for user** (for display):
```python
stmt = select(Task).where(
    Task.user_id == user_id,
    Task.status == "pending"
).order_by(Task.due_date.asc().nullsfirst(), Task.created_at.desc())
tasks = session.exec(stmt).all()
```

**Get task by ID (with authorization check)**:
```python
stmt = select(Task).where(
    Task.id == task_id,
    Task.user_id == user_id
)
task = session.exec(stmt).first()
if not task:
    raise NotFoundException("Task not found")
```

**Update task status**:
```python
task = session.exec(
    select(Task).where(Task.id == task_id, Task.user_id == user_id)
).first()
if task:
    task.status = "completed"
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
```

### Message Queries

**Get last N messages for conversation context**:
```python
stmt = select(Message).where(
    Message.user_id == user_id
).order_by(Message.timestamp.desc()).limit(10)
messages = session.exec(stmt).all()
return list(reversed(messages))  # Oldest first for context
```

**Store new message**:
```python
message = Message(
    user_id=user_id,
    conversation_id=conversation_id,
    role=role,
    content=content
)
session.add(message)
session.commit()
session.refresh(message)
```

---

## Migration Strategy (Alembic)

**Initial migration** (from Phase II):
```sql
-- 001_init_conversation_tables.sql
CREATE TABLE conversation (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversation_user_id ON conversation(user_id);

CREATE TABLE message (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    conversation_id INTEGER NOT NULL REFERENCES conversation(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_message_user_timestamp ON message(user_id, timestamp DESC);
CREATE INDEX idx_message_conversation ON message(conversation_id);
```

**Backward Compatibility**:
- Existing Task table unchanged (only new Conversation/Message tables added)
- No breaking changes to Phase II schema
- Migrations are additive only (no drops)

---

## Data Integrity Constraints

### Referential Integrity
- All foreign keys have CASCADE on delete
- Orphaned records cannot exist

### Check Constraints
- Task.status: pending | completed
- Task.priority: low | medium | high
- Message.role: user | assistant

### Uniqueness Constraints
- Task.id (primary key)
- Message.id (primary key)
- Conversation.id (primary key)
- User.id (primary key)
- User.email (unique)

### NOT NULL Constraints
- Task.user_id, title, status, priority (required)
- Message.user_id, conversation_id, role, content (required)
- Conversation.user_id, created_at, last_activity (required)

---

## Performance Considerations

### Indexes
- `idx_task_user_status`: Speed up "get pending tasks for user" queries (common in chat context retrieval)
- `idx_message_user_timestamp`: Speed up "last 10 messages" queries (critical on every chat request)
- `idx_conversation_user_id`: Speed up conversation listing (not critical for MVP)

### Query Optimization
- Always filter by user_id first (ensures user isolation and fast index lookup)
- Limit message history to 10 (no full table scans)
- Use column selection (SELECT id, content, role) not SELECT * when possible

### Connection Pooling
- Neon pgBouncer handles pooling automatically
- FastAPI session manager creates new connection per request (stateless pattern)
- No connection caching or reuse across requests

---

## Schema Diagram (ASCII)

```
┌─────────────────┐
│     User        │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ name            │
│ created_at      │
└────────┬────────┘
         │ owns
         ├─────────────────────────┐
         │                         │
    ┌────▼──────────────┐   ┌──────▼─────────────┐
    │     Task          │   │  Conversation      │
    ├───────────────────┤   ├────────────────────┤
    │ id (PK)           │   │ id (PK)            │
    │ user_id (FK)      │   │ user_id (FK)       │
    │ title             │   │ created_at         │
    │ description       │   │ last_activity      │
    │ status            │   └────────┬───────────┘
    │ priority          │            │ contains
    │ due_date          │            │
    │ created_at        │      ┌─────▼────────────┐
    │ updated_at        │      │    Message       │
    └───────────────────┘      ├──────────────────┤
                               │ id (PK)          │
                               │ user_id (FK)     │
                               │ conversation_id  │
                               │ role             │
                               │ content          │
                               │ timestamp        │
                               └──────────────────┘
```

---

## Summary

**Total Entities**: 4 (User [existing], Task [extended], Conversation [new], Message [new])
**Total Fields**: 21 fields across new/extended entities
**Total Indexes**: 7 performance-critical indexes
**Foreign Keys**: 6 relationships (all with CASCADE delete)
**Check Constraints**: 4 (status, priority, role enums)
**Migrations**: 1 additive migration (backward compatible)

All entities follow ACID properties, referential integrity, and Constitution Principle III (Privacy & Isolation via user_id foreign keys).
