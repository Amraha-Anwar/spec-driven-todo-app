# Data Model: Console TODO Application

**Feature**: Console TODO Application
**Branch**: `001-console-todo-app`
**Date**: 2025-12-27

## Overview

This document defines the data structures and contracts for the Console TODO Application. The application uses a simple in-memory model with one primary entity (Task) and one service layer (TaskManager).

## Entity: Task

### Purpose

Represents a single TODO item with unique identifier, title, optional description, and completion status.

### Attributes

| Attribute | Type | Mutability | Constraints | Default |
|-----------|------|------------|-------------|---------|
| `id` | `int` | Immutable | Positive integer, unique | Auto-generated |
| `title` | `str` | Mutable | Non-empty string | Required |
| `description` | `str` | Mutable | Any string (including empty) | Empty string |
| `is_complete` | `bool` | Mutable | Boolean only | `False` |

### Invariants

1. **ID Uniqueness**: No two tasks shall have the same ID
2. **ID Positivity**: ID is always >= 1
3. **Title Requirement**: Title is never empty or whitespace-only
4. **ID Immutability**: Once assigned, ID never changes
5. **Status Boolean**: is_complete is always True or False (no null/None)

### State Transitions

```
Task Creation:
  [None] → Task(id=N, title="...", description="...", is_complete=False)

Title Update:
  Task(title="Old") → Task(title="New")
  Constraint: New title must be non-empty

Description Update:
  Task(description="Old") → Task(description="New")
  Constraint: None (empty string is valid)

Status Toggle:
  Task(is_complete=False) → Task(is_complete=True)
  Task(is_complete=True) → Task(is_complete=False)

Task Deletion:
  Task(id=N) → [None]
  Side effect: ID N is never reused
```

### Example Instances

#### Minimal Task
```python
Task(
    id=1,
    title="Buy milk",
    description="",
    is_complete=False
)
```

#### Complete Task with Description
```python
Task(
    id=2,
    title="Finish project report",
    description="Include sections: intro, methodology, results, conclusion",
    is_complete=True
)
```

#### Task with Special Characters
```python
Task(
    id=3,
    title="Café meeting ☕",
    description="Discuss Q1 roadmap @ 2pm",
    is_complete=False
)
```

## Service: TaskManager

### Purpose

Manages task lifecycle, business logic, and in-memory storage. Provides CRUD operations with validation.

### State

| Property | Type | Purpose |
|----------|------|---------|
| `tasks` | `dict[int, Task]` | Maps task ID to Task object for O(1) lookup |
| `next_id` | `int` | Next available ID (starts at 1, monotonically increases) |

### State Invariants

1. **ID Consistency**: Every Task.id in `tasks` dict matches its key
2. **Next ID**: `next_id` always equals `max(tasks.keys()) + 1` or `1` if empty
3. **No Gaps in History**: `next_id` never decrements (IDs never reused)

### Operations

#### Create Task

**Signature**: `create(title: str, description: str = "") -> Task`

**Preconditions**:
- `title` is non-empty string (after stripping whitespace)

**Postconditions**:
- New Task created with unique ID
- Task added to `tasks` dict
- `next_id` incremented by 1
- Task.is_complete is False

**Side Effects**:
- Modifies TaskManager state (adds task)
- Increments internal ID counter

**Exceptions**:
- `ValidationError`: If title is empty or whitespace-only

**Example**:
```python
# Before: tasks={}, next_id=1
task = manager.create("Buy groceries", "Milk, eggs, bread")
# After: tasks={1: Task(...)}, next_id=2
# Returns: Task(id=1, title="Buy groceries", description="Milk, eggs, bread", is_complete=False)
```

#### Get Task by ID

**Signature**: `get(task_id: int) -> Task | None`

**Preconditions**: None

**Postconditions**: State unchanged (read-only operation)

**Returns**:
- Task object if `task_id` exists
- `None` if `task_id` not found

**Side Effects**: None (pure read operation)

**Example**:
```python
task = manager.get(1)  # Returns Task(id=1, ...) or None
```

#### Get All Tasks

**Signature**: `get_all() -> list[Task]`

**Preconditions**: None

**Postconditions**:
- State unchanged (read-only operation)
- Returned list is sorted by ID ascending

**Returns**: List of all tasks (empty list if no tasks exist)

**Side Effects**: None (pure read operation)

**Example**:
```python
tasks = manager.get_all()  # [Task(id=1), Task(id=2), Task(id=3)]
```

#### Update Task

**Signature**: `update(task_id: int, title: str | None = None, description: str | None = None) -> Task`

**Preconditions**:
- `task_id` exists in storage
- If `title` provided, must be non-empty string

**Postconditions**:
- Task attributes updated according to provided values
- `None` values preserve existing data

**Returns**: Updated Task object

**Side Effects**: Modifies task in storage

**Exceptions**:
- `TaskNotFoundError`: If `task_id` doesn't exist
- `ValidationError`: If provided `title` is empty

**Behavior**:
- `title=None` → Keep existing title
- `title="New"` → Update to "New"
- `description=None` → Keep existing description
- `description=""` → Update to empty string (valid)

**Example**:
```python
# Before: Task(id=1, title="Old", description="Old desc")
task = manager.update(1, title="New", description=None)
# After: Task(id=1, title="New", description="Old desc")
```

#### Delete Task

**Signature**: `delete(task_id: int) -> None`

**Preconditions**:
- `task_id` exists in storage

**Postconditions**:
- Task removed from storage
- `next_id` unchanged (ID not reused)

**Returns**: None

**Side Effects**:
- Removes task from storage
- ID becomes permanently unavailable

**Exceptions**:
- `TaskNotFoundError`: If `task_id` doesn't exist

**Example**:
```python
# Before: tasks={1: Task(...), 2: Task(...)}, next_id=3
manager.delete(1)
# After: tasks={2: Task(...)}, next_id=3 (still 3, not reused)
```

#### Toggle Completion Status

**Signature**: `toggle_complete(task_id: int) -> Task`

**Preconditions**:
- `task_id` exists in storage

**Postconditions**:
- Task.is_complete flipped (True ↔ False)

**Returns**: Updated Task object

**Side Effects**: Modifies task completion status

**Exceptions**:
- `TaskNotFoundError`: If `task_id` doesn't exist

**Example**:
```python
# Before: Task(id=1, is_complete=False)
task = manager.toggle_complete(1)
# After: Task(id=1, is_complete=True)

task = manager.toggle_complete(1)
# After: Task(id=1, is_complete=False)
```

## Exception Types

### ValidationError

**Purpose**: Indicates input validation failure

**When Raised**:
- Empty or whitespace-only title provided to `create()` or `update()`

**Attributes**:
- `message`: Description of validation failure

**Example**:
```python
try:
    manager.create("   ")  # Whitespace-only title
except ValidationError as e:
    print(e.message)  # "Title is required"
```

### TaskNotFoundError

**Purpose**: Indicates task ID doesn't exist

**When Raised**:
- `get()`, `update()`, `delete()`, or `toggle_complete()` called with non-existent ID

**Attributes**:
- `task_id`: The ID that was not found

**Example**:
```python
try:
    manager.update(999, title="New")
except TaskNotFoundError as e:
    print(f"Task {e.task_id} not found")  # "Task 999 not found"
```

## ID Generation Strategy

### Algorithm

Sequential counter starting at 1, incremented after each task creation.

```
next_id = 1

For each create() call:
    1. Assign current next_id to new task
    2. Increment next_id by 1
    3. Return created task

For delete() call:
    - Remove task from storage
    - Do NOT decrement next_id (ID never reused)
```

### Properties

1. **Deterministic**: Same sequence of operations always produces same IDs
2. **Monotonic**: IDs always increase, never decrease
3. **Gapless on Creation**: IDs 1, 2, 3, ... assigned sequentially
4. **Gaps After Deletion**: Deleting ID 2 leaves gap (1, 3, 4, ...)
5. **No Reuse**: Once assigned, ID never given to another task

### Example Sequence

```
Operation             | Result ID | next_id | tasks.keys()
---------------------|-----------|---------|-------------
create("Task 1")     | 1         | 2       | {1}
create("Task 2")     | 2         | 3       | {1, 2}
create("Task 3")     | 3         | 4       | {1, 2, 3}
delete(2)            | -         | 4       | {1, 3}
create("Task 4")     | 4         | 5       | {1, 3, 4}
                     |           |         | (Note: ID 2 is never reused)
```

## Storage Implementation

### Data Structure

**Type**: `dict[int, Task]`

**Rationale**:
- O(1) lookup by ID (required for update, delete, toggle operations)
- O(n) iteration for get_all() (acceptable for expected scale of <100 tasks)
- Maintains insertion order (Python 3.7+)
- Native Python structure (no external dependencies)

### Memory Characteristics

| Operation | Time Complexity | Space Complexity |
|-----------|-----------------|------------------|
| `create()` | O(1) | O(1) per task |
| `get()` | O(1) | O(1) |
| `get_all()` | O(n) | O(n) for list copy |
| `update()` | O(1) | O(1) |
| `delete()` | O(1) | O(1) |
| `toggle_complete()` | O(1) | O(1) |

**Scaling**: Dictionary scales well to 1000+ tasks with negligible performance impact.

### Lifetime

**Scope**: Application runtime only

**Initialization**: Empty dict on application start

**Termination**: All data lost on application exit (per specification design)

**Persistence**: None (Phase I constraint)

## Validation Rules

### Title Validation

```python
def validate_title(title: str) -> bool:
    """
    Title is valid if non-empty after stripping whitespace.

    Valid:
        "Buy milk"           → True
        "   Task   "         → True (becomes "Task")
        "a"                  → True (single character OK)
        "123"                → True (numbers OK)
        "Café ☕"            → True (unicode OK)

    Invalid:
        ""                   → False (empty)
        "   "                → False (whitespace only)
        None                 → False (not a string)
    """
    return isinstance(title, str) and len(title.strip()) > 0
```

### Description Validation

```python
def validate_description(description: str) -> bool:
    """
    Description is always valid (including empty string).

    Valid:
        "Some description"   → True
        ""                   → True (empty OK)
        "   "                → True (whitespace OK)
        None                 → False (must be string, not None)
    """
    return isinstance(description, str)
```

### Task ID Validation

```python
def validate_task_id(task_id: int, tasks: dict) -> bool:
    """
    Task ID is valid if it exists in storage.

    Valid:
        task_id=1, tasks={1: ...}     → True
        task_id=5, tasks={5: ...}     → True

    Invalid:
        task_id=99, tasks={1: ...}    → False (not found)
        task_id=-1, tasks={}          → False (negative)
        task_id="1", tasks={1: ...}   → False (not integer)
    """
    return isinstance(task_id, int) and task_id in tasks
```

## Future Extensions (Out of Scope for Phase I)

### Potential Future Enhancements

1. **Persistence**: Serialize tasks to JSON/database
   - Extension point: TaskManager can be wrapped with persistence layer
   - No changes to Task model needed

2. **Task Filtering**: Filter by status, search by title
   - Extension point: Add filter methods to TaskManager
   - Task model unchanged

3. **Task Sorting**: Sort by date, priority, status
   - Extension point: Add `created_at` field to Task
   - Minimal impact on existing code

4. **Multiple Lists**: Categories, projects, tags
   - Extension point: Add `category` field to Task
   - TaskManager methods accept optional category filter

5. **Web/GUI Interface**: Replace console UI
   - Extension point: TaskManager is UI-agnostic
   - Swap `src/ui/` module entirely
   - Task model and TaskManager unchanged

### Extensibility Design

The current design supports these extensions without breaking changes:

- **Task model**: Can add fields without affecting existing operations
- **TaskManager interface**: Methods return Task objects, not tuples/dicts (easy to extend Task)
- **Storage**: dict-based storage can be swapped for database with same interface
- **UI layer**: Completely separate from business logic, can be replaced entirely
