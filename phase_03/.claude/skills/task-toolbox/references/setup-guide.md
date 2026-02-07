# TaskToolbox Setup Guide

## Overview

TaskToolbox is an MCP Server that wraps Task CRUD operations as standardized tools. It requires a database backend and the official MCP SDK.

## Prerequisites

- Python 3.8+
- PostgreSQL or SQLite database
- pip package manager

## Installation

### Step 1: Install Dependencies

```bash
pip install mcp sqlmodel python-dotenv
```

**Required packages:**
- `mcp` - Official Anthropic Model Context Protocol SDK
- `sqlmodel` - SQL models with Pydantic integration
- `python-dotenv` - Environment variable management

### Step 2: Database Setup

#### Using PostgreSQL (Recommended for production)

```bash
# Create a database
createdb todo_db

# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://username:password@localhost:5432/todo_db"
```

#### Using SQLite (Development)

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="sqlite:///./todo.db"
```

### Step 3: Configure Environment

Create or update your `.env` file:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/todo_db
# or for SQLite:
# DATABASE_URL=sqlite:///./todo.db
```

The server automatically creates tables on startup if they don't exist.

## Running the Server

### Standalone Mode

```bash
python scripts/mcp_server.py
```

The server will:
1. Load the DATABASE_URL from `.env`
2. Create database tables if needed
3. Initialize the MCP server
4. Wait for client connections

### Integrated with Claude Code

Configure in your Claude Code settings to use the TaskToolbox MCP server.

## Integration with Existing Phase 02 Backend

The TaskToolbox server is compatible with the Phase 02 backend:

1. **Database Models:** TaskToolbox uses the same SQLModel definitions as Phase 02
2. **Schema:** Identical to Phase 02 task schema (title, description, is_completed, priority, due_date)
3. **Data Isolation:** All operations scoped by `user_id` for multi-tenancy
4. **Connection Pooling:** Configured with connection recycling for long-running processes

### Migration from FastAPI to MCP

If migrating from Phase 02's FastAPI routes to MCP tools:

**Phase 02 (FastAPI):**
```python
POST /users/{user_id}/tasks
GET /users/{user_id}/tasks
PATCH /users/{user_id}/tasks/{task_id}
DELETE /users/{user_id}/tasks/{task_id}
```

**Phase 03 (MCP Server):**
```
add_task(user_id, title, ...)
list_tasks(user_id)
update_task(user_id, task_id, ...)
delete_task(user_id, task_id)
```

Both use the same database schema and can share a database.

## Architecture

### Stateless Design

All tools are stateless:
- No session persistence
- Each call is independent
- Database connections created/closed per call
- Safe for concurrent execution

### Data Isolation

Every tool requires `user_id` parameter:
- All queries filtered by `user_id`
- No cross-user data access possible
- Foreign key constraints enforce referential integrity

### Error Handling

Errors are caught and returned as MCP ToolResult with `isError=true`:
- Database errors logged to stderr
- User-friendly error messages returned
- Invalid input (e.g., bad date format) rejected gracefully

## Troubleshooting

### "DATABASE_URL environment variable is not set"

**Solution:** Ensure `.env` file exists with `DATABASE_URL` set:
```bash
export DATABASE_URL="postgresql://user:pass@localhost/todo_db"
```

### "Connection pool exhausted"

**Solution:** The server recycles connections every 3600 seconds. If you see persistent pool errors:
1. Increase pool size in connection settings
2. Reduce timeout values
3. Check for hanging connections in the database

### "Task not found for user {user_id}"

**Solution:** Verify:
1. The `task_id` exists
2. The task belongs to the specified `user_id`
3. The task wasn't deleted by another process

### Database table doesn't exist

**Solution:** The server creates tables automatically on startup. If tables don't exist:
1. Ensure DATABASE_URL is correct
2. Check database user has CREATE TABLE permissions
3. Run manually: `python -c "from scripts.mcp_server import engine, SQLModel; SQLModel.metadata.create_all(engine)"`

## Development

### Running Tests

Add tests by creating a `tests/` directory:

```python
# tests/test_mcp_server.py
import pytest
from scripts.mcp_server import TaskService

def test_add_task():
    result = TaskService.add_task(
        user_id="test_user",
        title="Test task",
        description="Test description"
    )
    assert result["title"] == "Test task"
    assert result["user_id"] == "test_user"

def test_data_isolation():
    # User A creates task
    task_a = TaskService.add_task("user_a", "Task A")

    # User B cannot access task A
    with pytest.raises(ValueError):
        TaskService.get_task("user_b", task_a["id"])
```

Run tests:
```bash
pytest tests/
```

### Extending TaskService

To add new operations, extend the `TaskService` class:

```python
class TaskService:
    @staticmethod
    def get_completed_tasks(user_id: str) -> list:
        """Get all completed tasks for a user"""
        with get_session() as session:
            statement = select(Task).where(
                Task.user_id == user_id,
                Task.is_completed == True
            )
            tasks = session.exec(statement).all()
            return [TaskService._task_to_dict(task) for task in tasks]
```

Then expose via MCP:

```python
@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        # ... existing tools ...
        Tool(
            name="get_completed_tasks",
            description="Get all completed tasks for a user",
            inputSchema={...}
        )
    ]
```

## Performance Considerations

### Connection Pooling

- Pool size: Default (5-10 connections)
- Pool recycle: 3600 seconds (1 hour)
- Pool pre-ping: Enabled (verifies connections)

Adjust if needed:
```python
engine = create_engine(
    DATABASE_URL,
    pool_size=20,          # Increase for high concurrency
    max_overflow=10,       # Additional overflow connections
    pool_recycle=1800,     # Recycle faster for unstable networks
)
```

### Query Optimization

Current queries use indexed fields:
- `user_id` - Foreign key, indexed
- `created_at` - Used for sorting
- `id` - Primary key

Add indexes if needed:
```python
class Task(SQLModel, table=True):
    # ...
    __table_args__ = (
        Index('idx_user_id_created_at', 'user_id', 'created_at', postgresql_using='btree'),
    )
```

## Security Considerations

### User ID Validation

Currently, `user_id` is trusted from the caller. In production, validate:

```python
@staticmethod
def add_task(user_id: str, ...) -> dict:
    # Validate user_id format
    if not user_id or len(user_id) > 255:
        raise ValueError("Invalid user_id")

    # Verify user exists in User table
    with get_session() as session:
        user = session.get(User, user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
```

### SQL Injection Prevention

All queries use SQLModel's query builder (SQLAlchemy under the hood), which provides parameterized queries. Never construct SQL strings manually.

### Database Credentials

Always use environment variables (not hardcoded):
```python
DATABASE_URL = os.getenv("DATABASE_URL")  # ✅ Good
DATABASE_URL = "postgresql://user:pass@localhost/db"  # ❌ Bad
```

## Additional Resources

- **MCP Protocol:** https://spec.anthropic.com/
- **SQLModel Documentation:** https://sqlmodel.tiangolo.com/
- **Phase 02 Implementation:** See `/mnt/d/todo-evolution/phase_02/backend/src/api/tasks.py`
- **API Schema:** See `api-schema.md` in this directory
