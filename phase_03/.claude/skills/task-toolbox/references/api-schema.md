# TaskToolbox MCP API Schema

## Overview

TaskToolbox exposes 6 standardized tools for Task CRUD operations via the Model Context Protocol (MCP). Each tool is stateless and requires a `user_id` parameter to ensure data isolation.

## Tools

### 1. add_task

**Purpose:** Add a new task for a user.

**Parameters:**
- `user_id` (string, required): User ID for data isolation
- `title` (string, required): Task title
- `description` (string, optional): Task description
- `priority` (string, optional): Priority level - `low`, `medium`, or `high` (default: `medium`)
- `due_date` (string, optional): Due date in ISO 8601 format (e.g., `2026-02-15T10:30:00Z`)

**Returns:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "is_completed": false,
  "priority": "high",
  "due_date": "2026-02-15T10:30:00+00:00",
  "user_id": "user123",
  "created_at": "2026-02-06T15:30:00+00:00",
  "updated_at": "2026-02-06T15:30:00+00:00"
}
```

**Error Cases:**
- `ValueError: Invalid due_date format` - Invalid ISO 8601 date format

---

### 2. list_tasks

**Purpose:** List all tasks for a user, ordered by creation date (newest first).

**Parameters:**
- `user_id` (string, required): User ID for data isolation

**Returns:**
Array of task objects (same structure as `add_task` response):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Buy groceries",
    "is_completed": false,
    "priority": "high",
    ...
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Write report",
    "is_completed": true,
    "priority": "medium",
    ...
  }
]
```

**Error Cases:** None (returns empty array if no tasks exist)

---

### 3. get_task

**Purpose:** Get a specific task by ID.

**Parameters:**
- `user_id` (string, required): User ID for data isolation
- `task_id` (string, required): Task ID

**Returns:** Single task object (same structure as `add_task` response)

**Error Cases:**
- `ValueError: Task {task_id} not found for user {user_id}` - Task does not exist or belongs to different user

---

### 4. update_task

**Purpose:** Update one or more fields of a task. All fields except `user_id` and `task_id` are optional.

**Parameters:**
- `user_id` (string, required): User ID for data isolation
- `task_id` (string, required): Task ID
- `title` (string, optional): New title
- `description` (string, optional): New description
- `is_completed` (boolean, optional): Completion status
- `priority` (string, optional): Priority level - `low`, `medium`, or `high`
- `due_date` (string, optional): Due date in ISO 8601 format

**Returns:** Updated task object (same structure as `add_task` response)

**Error Cases:**
- `ValueError: Task {task_id} not found for user {user_id}` - Task does not exist or belongs to different user
- `ValueError: Invalid due_date format` - Invalid ISO 8601 date format

---

### 5. complete_task

**Purpose:** Mark a task as complete (sets `is_completed` to `true`).

**Parameters:**
- `user_id` (string, required): User ID for data isolation
- `task_id` (string, required): Task ID

**Returns:** Updated task object (same structure as `add_task` response)

**Error Cases:**
- `ValueError: Task {task_id} not found for user {user_id}` - Task does not exist or belongs to different user

---

### 6. delete_task

**Purpose:** Delete a task.

**Parameters:**
- `user_id` (string, required): User ID for data isolation
- `task_id` (string, required): Task ID

**Returns:**
```json
{
  "success": true,
  "message": "Task {task_id} deleted"
}
```

**Error Cases:**
- `ValueError: Task {task_id} not found for user {user_id}` - Task does not exist or belongs to different user

---

## Data Model

### Task Object

```
{
  "id": string (UUID),
  "title": string (max 255 chars),
  "description": string or null,
  "is_completed": boolean,
  "priority": string ("low" | "medium" | "high"),
  "due_date": string (ISO 8601) or null,
  "user_id": string,
  "created_at": string (ISO 8601),
  "updated_at": string (ISO 8601)
}
```

### Field Constraints

| Field | Type | Constraints | Mutable |
|-------|------|-----------|---------|
| `id` | UUID | Auto-generated, immutable | No |
| `title` | string | Max 255 chars, required | Yes |
| `description` | string \| null | Optional | Yes |
| `is_completed` | boolean | Default: false | Yes |
| `priority` | string | low \| medium \| high (default: medium) | Yes |
| `due_date` | datetime \| null | ISO 8601 format | Yes |
| `user_id` | string | Foreign key, immutable | No |
| `created_at` | datetime | Auto-generated, immutable | No |
| `updated_at` | datetime | Auto-updated on every change | No |

---

## Data Isolation

All tools enforce strict data isolation via `user_id`:

- **add_task:** Creates task scoped to `user_id`
- **list_tasks:** Returns only tasks for the specified `user_id`
- **get_task:** Returns task only if it belongs to `user_id`
- **update_task:** Updates task only if it belongs to `user_id`
- **complete_task:** Completes task only if it belongs to `user_id`
- **delete_task:** Deletes task only if it belongs to `user_id`

No cross-user access is possible.

---

## Statelessness

All tools are **stateless**:
- No session persistence required
- Each call is independent
- Database connections are created and closed per call
- Safe for concurrent use
- No shared state between calls

---

## Error Handling

Errors are returned as `ToolResult` with `isError=true`:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: Task xyz not found for user user123"
    }
  ],
  "isError": true
}
```

Common error patterns:
- `ValueError: Invalid due_date format` - Date parsing failed
- `ValueError: Task {id} not found for user {user_id}` - Authorization or not found
- Database connectivity errors - Connection pool issues

---

## Examples

### Create a task
```
add_task(
  user_id="user123",
  title="Review pull request",
  description="Check code quality and tests",
  priority="high",
  due_date="2026-02-08T17:00:00Z"
)
```

### List all tasks
```
list_tasks(user_id="user123")
```

### Complete a task
```
complete_task(user_id="user123", task_id="550e8400-e29b-41d4-a716-446655440000")
```

### Update a task's priority
```
update_task(
  user_id="user123",
  task_id="550e8400-e29b-41d4-a716-446655440000",
  priority="low"
)
```

### Delete a task
```
delete_task(user_id="user123", task_id="550e8400-e29b-41d4-a716-446655440000")
```
