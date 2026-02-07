---
name: task-toolbox
description: MCP Server skill for Task CRUD operations with stateless tools requiring user_id for data isolation. Use when you need to wrap existing Task CRUD logic (Add, List, Delete, Update, Complete) into standardized MCP tools that are safe for concurrent use and enforce data isolation across multiple users.
---

# task-toolbox

## Overview

TaskToolbox is an MCP Server that exposes Task CRUD operations as stateless, standardized tools. It wraps the existing Phase 02 Task management logic into 6 tools: `add_task`, `list_tasks`, `get_task`, `update_task`, `complete_task`, and `delete_task`. Each tool is stateless, requires `user_id` for data isolation, and is designed for concurrent use by multiple AI agents.

## Quick Start

### 1. Install Dependencies

```bash
pip install mcp sqlmodel python-dotenv
```

### 2. Configure Database

Set DATABASE_URL environment variable:

```bash
export DATABASE_URL="postgresql://user:pass@localhost:5432/todo_db"
# or for SQLite:
export DATABASE_URL="sqlite:///./todo.db"
```

### 3. Run the Server

```bash
python scripts/mcp_server.py
```

## Available Tools

TaskToolbox exposes these 6 tools:

### add_task
Create a new task for a user.

**Required:** `user_id`, `title`
**Optional:** `description`, `priority` (low/medium/high), `due_date` (ISO 8601)

```
add_task(
  user_id="user123",
  title="Buy groceries",
  priority="high",
  due_date="2026-02-15T10:30:00Z"
)
```

### list_tasks
List all tasks for a user (ordered by creation date, newest first).

**Required:** `user_id`

```
list_tasks(user_id="user123")
```

### get_task
Get a specific task by ID.

**Required:** `user_id`, `task_id`

```
get_task(user_id="user123", task_id="550e8400-e29b-41d4-a716-446655440000")
```

### update_task
Update one or more fields of a task.

**Required:** `user_id`, `task_id`
**Optional:** `title`, `description`, `is_completed`, `priority`, `due_date`

```
update_task(
  user_id="user123",
  task_id="550e8400-e29b-41d4-a716-446655440000",
  is_completed=true,
  priority="low"
)
```

### complete_task
Mark a task as complete (shorthand for `update_task` with `is_completed=true`).

**Required:** `user_id`, `task_id`

```
complete_task(user_id="user123", task_id="550e8400-e29b-41d4-a716-446655440000")
```

### delete_task
Delete a task.

**Required:** `user_id`, `task_id`

```
delete_task(user_id="user123", task_id="550e8400-e29b-41d4-a716-446655440000")
```

## Key Design Principles

### Stateless

All tools are stateless:
- No session persistence
- Each call is independent
- Database connections created and closed per call
- Safe for concurrent execution by multiple agents

### Data Isolation

Every tool requires `user_id`:
- All queries filtered by `user_id`
- No cross-user data access possible
- Foreign key constraints enforce referential integrity
- Multi-tenant safety guaranteed

### Compatible with Phase 02

Uses the same database schema and models as Phase 02:
- Task model: `id`, `title`, `description`, `is_completed`, `priority`, `due_date`, `user_id`, `created_at`, `updated_at`
- SQLModel for ORM
- Connection pooling with auto-recycling

## References

For detailed information, see:

- **[api-schema.md](references/api-schema.md)** - Complete API reference with error handling, field constraints, and examples
- **[setup-guide.md](references/setup-guide.md)** - Installation, database setup, troubleshooting, and extending the server

## Script

The `mcp_server.py` script is the complete, production-ready MCP server implementation. It includes:

- Database models and schema (User, Task)
- TaskService class with all CRUD operations
- MCP server setup with tool definitions
- Error handling and logging
- Connection pooling and database recycling

Run it with:
```bash
python scripts/mcp_server.py
```
