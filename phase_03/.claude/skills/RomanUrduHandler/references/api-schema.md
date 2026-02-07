# RomanUrduHandler MCP API Schema

## Overview

RomanUrduHandler is an MCP server that parses Roman Urdu (Urdu written in Latin characters) user input and maps it to TaskToolbox operations. It bridges the gap between natural language task commands in Roman Urdu and structured task APIs, while providing responses in Roman Urdu.

## Tools

### 1. parse_urdu_intent

**Purpose:** Parse Roman Urdu user input and extract task intent.

**Parameters:**
- `user_input` (string, required): User's message in Roman Urdu

**Returns:**
```json
{
  "original_text": "Mera meeting wala task delete kar do",
  "operation": "delete",
  "title": "meeting",
  "priority": "medium",
  "confidence": 0.95,
  "raw_parsed": {
    "delete": true
  }
}
```

**Supported Operations:**
- `delete` - Delete a task
- `create` - Create new task
- `complete` - Mark task as complete
- `update` - Update task
- `list` - List all tasks

**Supported Priorities:**
- `high` - Urgent tasks
- `medium` - Normal priority (default)
- `low` - Low priority tasks

**Roman Urdu Examples:**

| Input | Parsed |
|-------|--------|
| "Mera meeting wala task delete kar do" | operation: delete, title: meeting |
| "Shopping ke liye naya task banao" | operation: create, title: shopping |
| "Homework task mukkammal kar do" | operation: complete, title: homework |
| "Saare tasks dikhao" | operation: list |
| "Meeting urgent hai" | operation: None, priority: high (context-dependent) |

**Confidence Score:**
- `0.95` - Operation detected with title
- `0.75` - Operation detected, no title
- `0.0` - Operation not detected

---

### 2. generate_urdu_response

**Purpose:** Generate Roman Urdu response for a completed task operation.

**Parameters:**
- `operation` (string, required): Task operation - "delete", "create", "complete", "update", "list"
- `title` (string, optional): Task title
- `success` (boolean, optional): Success status (default: true)
- `error` (string, optional): Error message if failed

**Returns:**
```json
{
  "urdu_response": "Theek hai, 'meeting' task delete ho gaya.",
  "operation": "delete"
}
```

**Roman Urdu Responses:**

**Delete:**
- Success: "Theek hai, '{title}' task delete ho gaya."
- Failure: "'{title}' task delete nahi ho saki."

**Create:**
- Success: "Bilkul, '{title}' task banaya gaya."
- Failure: "'{title}' task banane mein problem hua."

**Complete:**
- Success: "Shukriya, '{title}' task mukkammal ho gaya."
- Failure: "'{title}' task complete nahi ho saki."

**Update:**
- Success: "Theek hai, '{title}' task update ho gaya."
- Failure: "'{title}' task update nahi ho saki."

**List:**
- Success: "Theek hai, aapke saare tasks yahan hain."
- Failure: "Tasks dikhane mein problem hua."

---

## Intent Mapping

### Roman Urdu to TaskToolbox Mapping

```
Roman Urdu Input
    ↓
parse_urdu_intent()
    ↓
Extracted: operation, title, priority
    ↓
TaskToolbox Operations:
  - delete_task(user_id, task_id)
  - add_task(user_id, title, priority)
  - complete_task(user_id, task_id)
  - update_task(user_id, task_id, ...)
  - list_tasks(user_id)
    ↓
Operation Result
    ↓
generate_urdu_response()
    ↓
Roman Urdu Response
```

## Supported Roman Urdu Patterns

### Delete Patterns
- "delete kar do"
- "delete kar de"
- "hatao"
- "hata do"
- "nikalo"

### Create Patterns
- "add kar do"
- "add kar de"
- "banao"
- "naya task"
- "create kar do"

### Complete Patterns
- "complete kar do"
- "mukkammal kar do"
- "ho gaya"
- "tayyar kar do"
- "khatam kar do"

### Update Patterns
- "change kar do"
- "badal do"
- "modify kar do"
- "update kar do"

### List Patterns
- "dikhao"
- "show kar do"
- "list kar do"
- "sab dekho"

### Priority Patterns

**High Priority:**
- "urgent"
- "zaruri"
- "high priority"
- "pehle"

**Medium Priority:**
- "normal"
- "medium priority"

**Low Priority:**
- "low priority"
- "baad mein"
- "chhoti bat"

## Integration Flow

### Standard Usage

```
1. User Input (Roman Urdu)
   "Mera meeting wala task delete kar do"

2. parse_urdu_intent()
   {
     "operation": "delete",
     "title": "meeting",
     "priority": "medium",
     "confidence": 0.95
   }

3. Map to TaskToolbox
   Find task with title="meeting"
   Call delete_task(user_id, task_id)

4. generate_urdu_response()
   {
     "urdu_response": "Theek hai, 'meeting' task delete ho gaya.",
     "operation": "delete"
   }

5. Respond to User (Roman Urdu)
   "Theek hai, 'meeting' task delete ho gaya."
```

## Error Handling

**Errors return:**
```json
{
  "urdu_response": "Maafi chahta hoon, error hua: [error message]",
  "operation": "delete"
}
```

## Confidence Scoring

Used to determine whether to proceed automatically or ask for confirmation:

- `0.95`: High confidence (operation + title detected) → Execute immediately
- `0.75`: Medium confidence (operation detected, no title) → Ask for clarification
- `0.0`: No operation detected → Ask user to rephrase

## Examples

### Example 1: Delete Task

```
Input: "Mera meeting wala task delete kar do"

parse_urdu_intent()
→ operation: "delete"
→ title: "meeting"
→ confidence: 0.95

generate_urdu_response("delete", "meeting", success=true)
→ "Theek hai, 'meeting' task delete ho gaya."
```

### Example 2: Create Task

```
Input: "Shopping ke liye naya task banao"

parse_urdu_intent()
→ operation: "create"
→ title: "shopping"
→ confidence: 0.95

generate_urdu_response("create", "shopping", success=true)
→ "Bilkul, 'shopping' task banaya gaya."
```

### Example 3: Complete Task with Priority

```
Input: "Homework task urgent hai, mukkammal kar do"

parse_urdu_intent()
→ operation: "complete"
→ title: "homework"
→ priority: "high"
→ confidence: 0.95

generate_urdu_response("complete", "homework", success=true)
→ "Shukriya, 'homework' task mukkammal ho gaya."
```

### Example 4: List Tasks

```
Input: "Saare mera tasks dikhao"

parse_urdu_intent()
→ operation: "list"
→ title: null
→ confidence: 0.95

generate_urdu_response("list", success=true)
→ "Theek hai, aapke saare tasks yahan hain."
```

## Roman Urdu Lexicon

Common Roman Urdu task-related vocabulary:

| Roman Urdu | English | Context |
|-----------|---------|---------|
| task | task | noun |
| delete/hatao/nikalo | delete | verb |
| create/banao | create | verb |
| add/joro | add | verb |
| complete/mukkammal | complete | verb |
| update/badal | update | verb |
| show/dikhao | show | verb |
| karein | do | imperative |
| kar do | do (polite) | imperative |
| kar de | do (casual) | imperative |
| wala/ka | of/related to | preposition |
| mera | my | possessive |
| aapka | your (formal) | possessive |
| urgent/zaruri | urgent | adjective |
| high | high | adjective |
| low | low | adjective |
| normal | normal | adjective |
| sab | all | quantifier |

## Security Notes

- Parser is stateless (no database access)
- Confidence scores can be used to require confirmation for low-confidence operations
- Integration with TaskToolbox should verify user_id before executing operations
- Roman Urdu input is case-insensitive and space-flexible
