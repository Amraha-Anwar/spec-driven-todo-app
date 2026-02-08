# Implementation Plan: Full CRUD + Reference Resolver + Proactive Personality

**Branch**: `014-agentic-chatbot` | **Date**: 2026-02-08
**Spec**: [spec.md](./spec.md) | **Status**: Phase 2 Design (ready for tasks generation)

---

## Executive Summary

This plan defines the architecture and implementation strategy for three critical enhancements to the Phase III MVP:

1. **TaskToolbox Skill Expansion** - Complete the `complete_task`, `delete_task`, and `update_task` implementations with full MCP schema compliance and database persistence
2. **Reference Resolver Skill** - New sub-agent that resolves ambiguous task references (e.g., "first task", "milk task", "dusra wala") to specific task IDs using two-tier matching
3. **Proactive Personality Agent Instructions** - Enhanced system prompts that enforce personality injection and proactive follow-ups after successful tool execution

---

## 1. TaskToolbox Skill Expansion

### Current State (✅ Completed)
- ✅ `add_task(user_id, title, description, priority, due_date)` → TaskToolbox
- ✅ `list_tasks(user_id, status_filter)` → TaskToolbox
- ✅ OpenAI schema wrapping: `{"type": "function", "function": {...}}`

### Implementation Required

#### 1.1 `complete_task(task_id: int) -> Dict[str, Any]`

**File**: `backend/src/tools/task_toolbox.py` (new method)

**Purpose**: Mark a task as completed and persist to database

**Signature**:
```python
def complete_task(
    self,
    user_id: str,
    task_id: str
) -> Dict[str, Any]:
    """
    Mark a task as completed.

    Args:
        user_id: User ID from JWT token (enforces user isolation)
        task_id: Task ID to complete

    Returns:
        {
            "success": true/false,
            "data": {
                "task_id": str,
                "title": str,
                "status": "completed",
                "completed_at": ISO timestamp
            },
            "error": error message if success=false
        }
    """
```

**Implementation Steps**:
1. Query database with user isolation: `SELECT * FROM task WHERE id=? AND user_id=?`
2. Validate task exists; return 404 error if not found
3. Update task status: `task.status = "completed"`
4. Set completion timestamp: `task.completed_at = datetime.utcnow()`
5. Call `self.session.add(task)` then `self.session.commit()` for persistence
6. Return success response with task details

**MCP Schema**:
```json
{
  "type": "function",
  "function": {
    "name": "complete_task",
    "description": "Mark a task as completed and set completion timestamp",
    "parameters": {
      "type": "object",
      "properties": {
        "task_id": {
          "type": "string",
          "description": "ID of the task to mark as completed"
        }
      },
      "required": ["task_id"]
    }
  }
}
```

**Error Handling**:
- Task not found → `{"success": false, "error": "Task not found", "status_code": 404}`
- Invalid task_id format → `{"success": false, "error": "Invalid task_id format"}`
- Database error → `{"success": false, "error": "Database error: ..."}`

**Session Commit**: ✅ Must call `self.session.commit()` inside method (no caller responsibility)

---

#### 1.2 `delete_task(task_id: int) -> Dict[str, Any]`

**File**: `backend/src/tools/task_toolbox.py` (new method)

**Purpose**: Permanently remove a task from the database

**Signature**:
```python
def delete_task(
    self,
    user_id: str,
    task_id: str
) -> Dict[str, Any]:
    """
    Delete a task permanently.

    Args:
        user_id: User ID from JWT token (enforces user isolation)
        task_id: Task ID to delete

    Returns:
        {
            "success": true/false,
            "data": {
                "task_id": str,
                "title": str,
                "status": "deleted"
            },
            "error": error message if success=false
        }
    """
```

**Implementation Steps**:
1. Query database with user isolation: `SELECT * FROM task WHERE id=? AND user_id=?`
2. Validate task exists; return 404 error if not found
3. Delete task: `self.session.delete(task)`
4. Commit transaction: `self.session.commit()`
5. Return success response with deleted task info

**MCP Schema**:
```json
{
  "type": "function",
  "function": {
    "name": "delete_task",
    "description": "Delete a task permanently from the database",
    "parameters": {
      "type": "object",
      "properties": {
        "task_id": {
          "type": "string",
          "description": "ID of the task to delete"
        }
      },
      "required": ["task_id"]
    }
  }
}
```

**Error Handling**:
- Task not found → `{"success": false, "error": "Task not found", "status_code": 404}`
- Invalid task_id format → `{"success": false, "error": "Invalid task_id format"}`
- Database error → `{"success": false, "error": "Database error: ..."}`

**Session Commit**: ✅ Must call `self.session.commit()` inside method

---

#### 1.3 `update_task(task_id: int, **kwargs) -> Dict[str, Any]`

**File**: `backend/src/tools/task_toolbox.py` (new method)

**Purpose**: Update one or more task attributes (title, description, priority, due_date, status)

**Signature**:
```python
def update_task(
    self,
    user_id: str,
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    priority: Optional[str] = None,
    due_date: Optional[str] = None,
    status: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update specific fields of a task.

    Args:
        user_id: User ID from JWT token
        task_id: Task ID to update
        title: New title (optional)
        description: New description (optional)
        priority: New priority: low|medium|high (optional)
        due_date: New due date in ISO format or 'tomorrow' (optional)
        status: New status: pending|completed (optional)

    Returns:
        {
            "success": true/false,
            "data": {
                "task_id": str,
                "title": str,
                "description": str,
                "priority": str,
                "due_date": str,
                "status": str,
                "updated_at": ISO timestamp
            },
            "error": error message if success=false
        }
    """
```

**Implementation Steps**:
1. Query database with user isolation: `SELECT * FROM task WHERE id=? AND user_id=?`
2. Validate task exists; return 404 error if not found
3. Validate each provided field:
   - `title`: Must not be empty if provided
   - `priority`: Must be one of ['low', 'medium', 'high']
   - `due_date`: Parse ISO format or special strings ('tomorrow')
   - `status`: Must be one of ['pending', 'completed']
4. Update only provided fields:
   ```python
   if title is not None:
       task.title = title
   if description is not None:
       task.description = description
   # ... etc for other fields
   ```
5. Set `updated_at` timestamp
6. Commit transaction: `self.session.commit()`
7. Return success response with updated task

**MCP Schema**:
```json
{
  "type": "function",
  "function": {
    "name": "update_task",
    "description": "Update specific fields of an existing task",
    "parameters": {
      "type": "object",
      "properties": {
        "task_id": {
          "type": "string",
          "description": "ID of the task to update"
        },
        "title": {
          "type": "string",
          "description": "New task title (optional)"
        },
        "description": {
          "type": "string",
          "description": "New task description (optional)"
        },
        "priority": {
          "type": "string",
          "enum": ["low", "medium", "high"],
          "description": "New priority level (optional)"
        },
        "due_date": {
          "type": "string",
          "description": "New due date in ISO format or 'tomorrow' (optional)"
        },
        "status": {
          "type": "string",
          "enum": ["pending", "completed"],
          "description": "New status (optional)"
        }
      },
      "required": ["task_id"]
    }
  }
}
```

**Error Handling**:
- Task not found → 404 error
- Invalid priority value → `{"success": false, "error": "Priority must be low, medium, or high"}`
- Invalid status value → `{"success": false, "error": "Status must be pending or completed"}`
- Invalid date format → `{"success": false, "error": "Invalid date format: ..."`
- Empty title → `{"success": false, "error": "Title cannot be empty"}`

**Session Commit**: ✅ Must call `self.session.commit()` inside method

---

#### 1.4 Updated `get_tools_schema()` Method

**File**: `backend/src/tools/task_toolbox.py`

**Purpose**: Return all 5 task tools wrapped in OpenAI format

**Current Tools** (from implementation):
- ✅ `add_task`
- ✅ `list_tasks`
- ✅ `complete_task` (NEW)
- ✅ `delete_task` (NEW)
- ✅ `update_task` (NEW)

**Return Format**:
```python
@staticmethod
def get_tools_schema() -> List[Dict[str, Any]]:
    """Returns all 5 task tools wrapped in OpenAI format"""
    tool_definitions = [
        # ... add_task definition
        # ... list_tasks definition
        # ... complete_task definition (NEW)
        # ... delete_task definition (NEW)
        # ... update_task definition (NEW)
    ]

    # Wrap each tool in OpenAI format
    return [
        {
            "type": "function",
            "function": tool
        }
        for tool in tool_definitions
    ]
```

---

## 2. Reference Resolver Skill (New Sub-Agent)

### Purpose

Resolve ambiguous and contextual task references to specific task IDs. Enables natural language references like:
- "Complete the first one"
- "Delete the last task"
- "Mark the milk task done"
- "Dusra wala complete karo" (Complete the second one)
- "Purana wala delete kardo" (Delete the old one)

### Architecture

#### 2.1 New File: `backend/src/tools/reference_resolver.py`

**Class**: `ReferenceResolver`

**Purpose**: Two-tier resolution algorithm for task references

**Methods**:

##### 2.1.1 `resolve_reference(reference: str, user_id: str, available_tasks: List[Task]) -> Dict[str, Any]`

**Purpose**: Main entry point for reference resolution

**Signature**:
```python
def resolve_reference(
    self,
    reference: str,
    user_id: str,
    available_tasks: List[Task]
) -> Dict[str, Any]:
    """
    Resolve ambiguous task reference to a specific task.

    Two-tier approach:
    1. Tier 1: Direct match on task titles/descriptions
    2. Tier 2: Contextual match on temporal/positional keywords

    Args:
        reference: User's reference text (e.g., "first task", "milk task")
        user_id: User ID for task isolation
        available_tasks: List of Task objects to search

    Returns:
        {
            "success": true/false,
            "task_id": str (if success),
            "task_title": str (if success),
            "confidence": "high" | "medium" | "low",
            "method": "direct_match" | "temporal_match" | "positional_match" | "fuzzy_match",
            "suggestions": [...] (if multiple matches),
            "error": str (if success=false)
        }
    """
```

**Implementation Algorithm**:

```
Input: reference="milk task", available_tasks=[Task1, Task2, Task3]

Step 1: Tier 1 - Direct Match (Fuzzy Title Matching)
  - For each task in available_tasks:
    - Calculate string similarity (Levenshtein distance or similar)
    - If match threshold > 80%: return {success: true, task_id, confidence: "high"}
  - Example: "milk task" matches Task2 with title "Buy milk" (similarity 85%)

Step 2: If no Tier 1 match → Tier 2 - Contextual Match

  A. Temporal Keywords (English):
     - Keyword "first" → Return tasks[0] (oldest created_at)
     - Keyword "last" → Return tasks[-1] (newest created_at)
     - Keyword "oldest" / "purana" (Urdu) → Return min(created_at)
     - Keyword "newest" / "latest" → Return max(created_at)

  B. Positional Keywords:
     - Keyword "second" / "dusra" (Urdu) → Return tasks[1]
     - Keyword "third" / "tisra" (Urdu) → Return tasks[2]
     - Keyword "last" → Return tasks[-1]

  C. Status-Based Keywords:
     - Keyword "completed" / "done" → Return first completed task
     - Keyword "pending" → Return first pending task

  D. Numeric References:
     - Input "3" / "task 3" → Return task at index 2 (0-indexed)

Step 3: If single match found → Return success
  - Example: "purana wala" (old one) matches single oldest task

Step 4: If multiple matches → Return suggestions list
  - Return up to 5 suggestions with (task_id, task_title, created_at)
  - User must clarify which task

Step 5: If no match → Return error
  - "I couldn't find that task. Here are your tasks: ..."
```

---

##### 2.1.2 `_tier1_direct_match(reference: str, available_tasks: List[Task]) -> Optional[Dict]`

**Purpose**: Direct match on task titles/descriptions using fuzzy matching

**Implementation**:
```python
def _tier1_direct_match(self, reference: str, available_tasks: List[Task]) -> Optional[Dict]:
    """
    Tier 1: Direct match on task titles and descriptions.
    Use difflib.SequenceMatcher or similar for fuzzy matching.
    """
    from difflib import SequenceMatcher

    best_match = None
    best_ratio = 0
    threshold = 0.8  # 80% similarity threshold

    for task in available_tasks:
        # Check title match
        title_ratio = SequenceMatcher(None, reference.lower(), task.title.lower()).ratio()

        # Check description match (if available)
        desc_ratio = 0
        if task.description:
            desc_ratio = SequenceMatcher(None, reference.lower(), task.description.lower()).ratio()

        # Take best match
        max_ratio = max(title_ratio, desc_ratio)

        if max_ratio > best_ratio:
            best_ratio = max_ratio
            best_match = task

    # Return match if above threshold
    if best_ratio >= threshold:
        return {
            "success": True,
            "task_id": str(best_match.id),
            "task_title": best_match.title,
            "confidence": "high" if best_ratio > 0.9 else "medium",
            "method": "direct_match"
        }

    return None
```

---

##### 2.1.3 `_tier2_contextual_match(reference: str, available_tasks: List[Task]) -> Optional[Dict]`

**Purpose**: Contextual match on temporal/positional keywords

**Implementation**:
```python
def _tier2_contextual_match(self, reference: str, available_tasks: List[Task]) -> Optional[Dict]:
    """
    Tier 2: Contextual match on temporal keywords (old, new, first, last, etc.)
    and positional keywords (first, second, third, etc.)
    """
    ref_lower = reference.lower()

    # Define keyword mappings
    temporal_keywords = {
        "first": "oldest",
        "oldest": "oldest",
        "purana": "oldest",  # Roman Urdu for "old"
        "sabse purana": "oldest",  # "oldest" in Urdu

        "last": "newest",
        "latest": "newest",
        "newest": "newest",
        "naya": "newest",  # Roman Urdu for "new"
        "sabse naya": "newest",  # "newest" in Urdu
    }

    positional_keywords = {
        "first": 0,
        "second": 1,
        "dusra": 1,  # Roman Urdu for "second"
        "third": 2,
        "tisra": 2,  # Roman Urdu for "third"
    }

    # Check temporal keywords
    for keyword, temporal_type in temporal_keywords.items():
        if keyword in ref_lower:
            if temporal_type == "oldest":
                task = min(available_tasks, key=lambda t: t.created_at) if available_tasks else None
            else:  # newest
                task = max(available_tasks, key=lambda t: t.created_at) if available_tasks else None

            if task:
                return {
                    "success": True,
                    "task_id": str(task.id),
                    "task_title": task.title,
                    "confidence": "medium",
                    "method": "temporal_match"
                }

    # Check positional keywords
    for keyword, index in positional_keywords.items():
        if keyword in ref_lower:
            if 0 <= index < len(available_tasks):
                task = available_tasks[index]
                return {
                    "success": True,
                    "task_id": str(task.id),
                    "task_title": task.title,
                    "confidence": "medium",
                    "method": "positional_match"
                }

    # Check numeric references (e.g., "Task 3")
    import re
    match = re.search(r'\b(\d+)\b', ref_lower)
    if match:
        index = int(match.group(1)) - 1  # Convert 1-indexed to 0-indexed
        if 0 <= index < len(available_tasks):
            task = available_tasks[index]
            return {
                "success": True,
                "task_id": str(task.id),
                "task_title": task.title,
                "confidence": "medium",
                "method": "positional_match"
            }

    return None
```

---

#### 2.2 Integration with ChatService

**File**: `backend/src/services/chat_service.py`

**Usage**: Before executing `complete_task`, `delete_task`, or `update_task`, resolve ambiguous references

**Pattern**:
```python
# In ChatService._execute_tools()

# Check if reference_resolver is needed
if tool_name in ['complete_task', 'delete_task', 'update_task']:
    task_ref = tool_args.get('task_id') or tool_args.get('task_reference')

    # If task_id looks ambiguous (not a pure number), try to resolve
    if task_ref and not task_ref.isdigit():
        # Fetch all user's tasks
        available_tasks = task_toolbox.list_tasks(user_id=user_id)['data']

        # Resolve reference
        resolved = reference_resolver.resolve_reference(
            reference=task_ref,
            user_id=user_id,
            available_tasks=available_tasks
        )

        if resolved['success']:
            tool_args['task_id'] = resolved['task_id']
            # Log which task was resolved
            print(f"Resolved '{task_ref}' to task {resolved['task_id']}: {resolved['task_title']}")
        else:
            # Return error to user
            return {
                "success": False,
                "error": f"Could not find task matching '{task_ref}'. Here are your tasks: ...",
                "suggestions": resolved.get('suggestions', [])
            }
```

---

## 3. Proactive Personality Agent Instructions

### Purpose

Enforce warm, friendly tone with proactive follow-ups asking about missing task details (priority, due_date, description) after successful creation.

### Implementation

#### 3.1 System Prompt Enhancement

**File**: `backend/src/services/agent_runner.py`

**Method**: Update `_synthesize_response()` system prompt (already implemented in PHR 0012)

**Current Implementation** (PHR 0012 - ✅ Already done):
```python
if language_hint == "ur":
    synthesis_system = """Aap ek helpful aur dost ki tarah assistant ho.

Jab user ne koi task action (add, delete, complete, update) kiya hota hai, to aap:
1. Warmly confirm karo ke action successfully complete hua
2. Proactive way se ask karo ke kya unhe priority set karna chahiye (low/medium/high)?
3. Puchho ke due date add karna chahte ho?
4. Friendly aur supportive tone use karo - jaise aap unka assistant friend ho
5. Always Roman Urdu mein respond karo
6. Emoji use karo engagement ke liye (🎉, ✅, 📝, etc.)"""

else:
    synthesis_system = """You are a helpful, warm task management assistant - like a supportive friend.

When the user completes a task action (add, delete, complete, update), you should:
1. Warmly confirm that the action was successful
2. Proactively ask if they'd like to set a priority level (low/medium/high)
3. Ask if they'd like to add a due date
4. Use a conversational, encouraging, friendly tone
5. Use emojis to add warmth and engagement (🎉, ✅, 📝, etc.)
6. Be brief and focused - confirm action first, then ask about missing details
7. Always suggest next steps to make their task more complete"""
```

**Status**: ✅ **Already implemented in PHR 0012**

---

#### 3.2 Proactive Follow-up Rules

**Rule Set for Second Turn (Response Synthesis)**:

**When**: Tool result indicates `action: "add_task"` (creation successful)

**Then**:
1. **Always** ask about at least 1 missing attribute:
   - If `priority` not provided in original request → Ask about priority
   - If `due_date` not provided → Ask about due date
   - If `description` not provided → Ask about description

2. **Follow-up Examples**:
   - English: "Got it! Task created! 🎉 Would you like to set a priority (low/medium/high) or add a due date?"
   - Roman Urdu: "Bilkul! Task create ho gaya! 🎉 Kya aap iska priority set karna chahenge?"

3. **When**: Tool result indicates `action: "delete_task"` or `action: "complete_task"`

4. **Then**:
   - Congratulate/acknowledge: "Done! Task marked as complete! ✅" or "Perfect! Task deleted! ✅"
   - Suggest next action: "Want to create another task?" or "Anything else?"
   - Show personality: Use encouraging tone

5. **When**: Tool result indicates `action: "update_task"`

6. **Then**:
   - Confirm specific change: "Priority set to high! ✅"
   - Ask for more details if partial update: "Want to add a due date too?"

---

#### 3.3 Integration with Response Synthesis

**File**: `backend/src/services/agent_runner.py`

**Method**: Enhanced `_synthesize_response()` to detect action type

**Logic**:
```python
async def _synthesize_response(
    self,
    messages: List[Dict[str, str]],
    tool_results: List[Dict[str, Any]],
    language_hint: str,
    model: str,
    max_tokens: int
) -> Dict[str, Any]:
    # ... existing code ...

    # Detect action type from tool results
    action_type = None
    for result in tool_results:
        action = result.get('action', '').lower()
        if 'add' in action or 'create' in action:
            action_type = 'add_task'
        elif 'delete' in action:
            action_type = 'delete_task'
        elif 'complete' in action or 'done' in action:
            action_type = 'complete_task'
        elif 'update' in action:
            action_type = 'update_task'

    # Enhance system prompt based on action type
    if action_type == 'add_task':
        # Enforce proactive follow-up for missing details
        if language_hint == "ur":
            synthesis_system += "\n\n**IMPORTANT**: After task creation, ALWAYS ask about missing details: priority, due date, or description. The user wants to know what to do next."
        else:
            synthesis_system += "\n\n**IMPORTANT**: After task creation, ALWAYS ask about missing details: priority, due date, or description. This helps users complete their task setup in one conversation."

    # ... rest of synthesis logic ...
```

---

### Proactive Personality Checklist

| Feature | Implementation | Status |
|---------|----------------|--------|
| Warm confirmations with emojis | Synthesis system prompt | ✅ Done (PHR 0012) |
| Ask about priority after creation | Synthesis prompt + reference resolver | ✅ Done (PHR 0012) |
| Ask about due date after creation | Synthesis prompt + reference resolver | ✅ Done (PHR 0012) |
| Ask about description after creation | Synthesis prompt + reference resolver | ✅ Done (PHR 0012) |
| Encourage on completion | Synthesis prompt | ✅ Done (PHR 0012) |
| Multi-language support | Synthesis prompt (English + Urdu) | ✅ Done (PHR 0012) |
| Follow-up after deletion | Synthesis prompt | ✅ Done (PHR 0012) |
| Contextual response based on action type | Reference resolver logic | 🔄 New (this plan) |

---

## Implementation Tasks Breakdown

### Phase A: TaskToolbox Expansion (3 tasks)

1. **Task A1**: Implement `complete_task()` method in TaskToolbox
   - Add method signature, validation, database query
   - Call `session.commit()` after update
   - Return success/error response
   - Write unit tests

2. **Task A2**: Implement `delete_task()` method in TaskToolbox
   - Add method signature, validation, database query
   - Call `session.commit()` after delete
   - Return success/error response
   - Write unit tests

3. **Task A3**: Implement `update_task()` method in TaskToolbox
   - Add method signature with optional parameters
   - Field validation (priority, due_date, status)
   - Update only provided fields
   - Call `session.commit()` after update
   - Return success/error response
   - Write unit tests

4. **Task A4**: Update `get_tools_schema()` to include all 5 tools
   - Add schema for complete_task, delete_task, update_task
   - Wrap in OpenAI format
   - Test schema validation

### Phase B: Reference Resolver Skill (4 tasks)

5. **Task B1**: Create `ReferenceResolver` class structure
   - File: `backend/src/tools/reference_resolver.py`
   - Add class definition, `resolve_reference()` main method
   - Add Tier 1 placeholder

6. **Task B2**: Implement Tier 1 - Direct Match
   - Add `_tier1_direct_match()` method
   - Implement fuzzy string matching (Levenshtein distance)
   - Test with title/description matching
   - Define confidence levels

7. **Task B3**: Implement Tier 2 - Contextual Match
   - Add `_tier2_contextual_match()` method
   - Implement temporal keyword detection (first, last, old, new, purana, etc.)
   - Implement positional keyword detection (second, third, dusra, tisra)
   - Implement numeric reference parsing ("Task 3")
   - Test all keyword variants

8. **Task B4**: Integrate ReferenceResolver into ChatService
   - Modify `_execute_tools()` to use resolver
   - Handle ambiguous references before tool execution
   - Return suggestions if multiple matches
   - Log resolved references

### Phase C: Proactive Personality (2 tasks)

9. **Task C1**: Enhance synthesis prompts with action-type awareness
   - Detect action type from tool results
   - Conditionally enforce proactive follow-ups for `add_task`
   - Test with multiple action types

10. **Task C2**: Add proactive follow-up validation tests
    - Test that add_task triggers follow-up prompts
    - Test that delete_task and complete_task acknowledge action
    - Test multi-language personality consistency
    - Test never-empty response guarantee

---

## Test Coverage Plan

### Unit Tests

**TaskToolbox**:
- `test_complete_task_success()` - Mark pending task as completed
- `test_complete_task_not_found()` - Handle missing task
- `test_delete_task_success()` - Delete existing task
- `test_delete_task_not_found()` - Handle missing task
- `test_update_task_success()` - Update with valid fields
- `test_update_task_invalid_priority()` - Reject invalid priority
- `test_update_task_empty_title()` - Reject empty title
- `test_update_task_multiple_fields()` - Update multiple fields at once

**ReferenceResolver**:
- `test_direct_match_exact()` - "milk" matches "Buy milk"
- `test_direct_match_fuzzy()` - "milk task" matches "Buy milk" (80%+ similarity)
- `test_temporal_first()` - "first task" returns oldest task
- `test_temporal_last()` - "last task" returns newest task
- `test_temporal_old()` - "purana wala" returns oldest task
- `test_positional_second()` - "dusra wala" returns second task
- `test_numeric_reference()` - "Task 3" returns third task
- `test_no_match()` - Return error and suggestions

### Integration Tests

**CRUD Flow**:
- `test_add_then_complete()` - Create task, then mark complete
- `test_add_then_delete()` - Create task, then delete
- `test_add_then_update()` - Create task, then update priority

**Reference Resolution**:
- `test_ambiguous_complete()` - "Complete the bread task" finds and completes
- `test_numeric_delete()` - "Task 3 delete karo" deletes correct task
- `test_temporal_update()` - "Update the last task" updates newest task

**Proactive Personality**:
- `test_add_task_asks_priority()` - Response includes priority question
- `test_add_task_asks_due_date()` - Response includes due date question
- `test_complete_task_celebrates()` - Response uses congratulatory tone
- `test_delete_task_suggests_next()` - Response suggests next action

---

## File Structure After Implementation

```
backend/src/tools/
├── task_toolbox.py           (UPDATED: +3 methods: complete_task, delete_task, update_task)
├── reference_resolver.py      (NEW: ReferenceResolver class)
├── roman_urdu_handler.py      (EXISTING: no changes)
└── ...

backend/src/services/
├── agent_runner.py            (EXISTING: proactive personality already in _synthesize_response())
├── chat_service.py            (UPDATED: integrate ReferenceResolver)
└── ...

backend/tests/
├── unit/
│   ├── test_task_toolbox_complete.py      (NEW)
│   ├── test_task_toolbox_delete.py        (NEW)
│   ├── test_task_toolbox_update.py        (NEW)
│   └── test_reference_resolver.py         (NEW)
└── integration/
    ├── test_crud_flows.py                 (NEW)
    ├── test_reference_resolution.py       (NEW)
    └── test_proactive_personality.py      (NEW)
```

---

## Success Criteria

### Functional

✅ **TaskToolbox Expansion**:
- [ ] `complete_task()` marks task as completed and persists to DB
- [ ] `delete_task()` removes task from DB
- [ ] `update_task()` updates specified fields and persists
- [ ] All 3 tools wrapped in OpenAI schema format
- [ ] All 3 tools call `session.commit()` internally

✅ **Reference Resolver**:
- [ ] Resolves "first task" to oldest task ID
- [ ] Resolves "milk task" to task with matching title/description
- [ ] Resolves "dusra wala" (second) to correct task by position
- [ ] Resolves "Task 3" to third task in list
- [ ] Returns suggestions when multiple matches found
- [ ] Returns error when no match found
- [ ] Achieves 95%+ accuracy on ambiguous references

✅ **Proactive Personality**:
- [ ] After `add_task`, asks about priority/due_date/description
- [ ] After `delete_task`, acknowledges and suggests next action
- [ ] After `complete_task`, celebrates with warm message
- [ ] Uses emojis and friendly tone in all confirmations
- [ ] Responses NEVER empty (fallback confirmations exist)
- [ ] Responses in Roman Urdu when user input is Roman Urdu

---

## Risk Analysis & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Fuzzy matching produces false positives | Users complete wrong task | Set high similarity threshold (85%+); return suggestions on multiple matches |
| Numeric reference parsing errors | User deletes wrong task | Validate index bounds; return error if out of range |
| Session commit failures | Data not persisted | Wrap in try-except; return error message; queue for retry |
| Performance: Reference resolver query all tasks | Latency increase | Cache available_tasks in ChatService; reuse across request |
| Multi-language keyword mismatch | "Purana" not recognized | Maintain comprehensive keyword mapping; add Urdu variants |

---

## Dependencies & Assumptions

**Code Dependencies**:
- ✅ OpenAI Agents SDK (already integrated in agent_runner.py)
- ✅ SQLModel ORM (already used in task_toolbox.py)
- ✅ difflib for fuzzy string matching (Python stdlib)

**External Assumptions**:
- ✅ Neon PostgreSQL available with credentials in .env
- ✅ Task model has id, user_id, title, description, priority, due_date, created_at fields
- ✅ Message table available for conversation history
- ✅ User isolation enforced via user_id in all queries

---

## Timeline & Effort Estimate

| Component | Tasks | Effort | Timeline |
|-----------|-------|--------|----------|
| TaskToolbox Expansion | 4 | 8 hours | 1 day |
| Reference Resolver | 4 | 12 hours | 1.5 days |
| Proactive Personality | 2 | 4 hours | 0.5 days |
| Testing (unit + integration) | 10+ | 16 hours | 2 days |
| **Total** | **20+** | **40 hours** | **5 days** |

---

## Conclusion

This plan establishes a clear, testable implementation roadmap for:

1. **TaskToolbox Expansion** - Complete the CRUD tool set with `complete_task`, `delete_task`, `update_task`
2. **Reference Resolver** - New skill to handle ambiguous task references with high accuracy
3. **Proactive Personality** - Enhanced agent instructions enforcing warm, helpful tone with follow-ups

All three components work together to deliver the fully-featured agentic chatbot specified in `spec.md` with natural language handling, persistent database operations, and delightful user experience.

**Next Step**: Run `/sp.tasks` to generate detailed implementation tasks based on this plan.
