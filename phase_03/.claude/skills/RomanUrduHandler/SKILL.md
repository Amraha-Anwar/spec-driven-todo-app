---
name: roman-urdu-handler
description: MCP Server skill for parsing Roman Urdu (Urdu in Latin characters) user intents and mapping to TaskToolbox operations. Use when you need to bridge natural language task commands in Roman Urdu to structured task APIs. Implements parse_urdu_intent (extract operation, title, priority from Urdu input) and generate_urdu_response (create Roman Urdu responses). Handles phrases like "Mera meeting wala task delete kar do" → delete_task(title="meeting").
---

# roman-urdu-handler

## Overview

RomanUrduHandler bridges Roman Urdu natural language to structured task operations. It parses Urdu commands, extracts intent (operation, title, priority), and generates Urdu responses—enabling multi-lingual task management for Urdu-speaking users without English dependency.

## Quick Start

### 1. Install Dependencies

```bash
pip install mcp python-dotenv
```

### 2. Run the Server

```bash
python scripts/mcp_server.py
```

## Available Tools

### parse_urdu_intent
Extract task operation, title, and priority from Roman Urdu input.

**Usage:**
```
parse_urdu_intent(
  user_input="Mera meeting wala task delete kar do"
)
```

**Returns:**
```json
{
  "operation": "delete",
  "title": "meeting",
  "priority": "medium",
  "confidence": 0.95
}
```

### generate_urdu_response
Create Roman Urdu response for completed task operation.

**Usage:**
```
generate_urdu_response(
  operation="delete",
  title="meeting",
  success=true
)
```

**Returns:**
```
"Theek hai, 'meeting' task delete ho gaya."
```

## Key Features

### Roman Urdu Pattern Recognition

Understands common Urdu task commands:
- **Delete:** "delete kar do", "hatao", "nikalo"
- **Create:** "banao", "naya task", "add kar do"
- **Complete:** "mukkammal kar do", "tayyar kar do", "khatam kar do"
- **Update:** "change kar do", "badal do", "modify kar do"
- **List:** "dikhao", "show kar do", "sab dekho"

### Priority Detection

Extracts priority from context:
- **High:** "urgent", "zaruri", "pehle"
- **Medium:** "normal" (default)
- **Low:** "baad mein", "low priority"

### Confidence Scoring

Indicates parsing reliability:
- `0.95` - Operation + title detected (execute immediately)
- `0.75` - Operation only (ask for clarification)
- `0.0` - Unrecognized (ask user to rephrase)

### Multi-Lingual Response

Generates contextual Roman Urdu responses:
- Success: "Theek hai", "Bilkul", "Shukriya"
- Failure: "Maafi chahta hoon", "problem hua"

## Integration with TaskToolbox

```
Roman Urdu Input
    ↓
parse_urdu_intent()
    ↓
Extract: operation, title, priority
    ↓
Map to TaskToolbox:
  - delete_task(user_id, task_id)
  - add_task(user_id, title, priority)
  - complete_task(user_id, task_id)
  - update_task(user_id, task_id, ...)
  - list_tasks(user_id)
    ↓
generate_urdu_response()
    ↓
Roman Urdu Response to User
```

## Examples

### Example 1: Delete Task
```
Input: "Mera meeting wala task delete kar do"
Parsed: operation=delete, title=meeting, confidence=0.95
Response: "Theek hai, 'meeting' task delete ho gaya."
```

### Example 2: Create Task
```
Input: "Shopping ke liye naya task banao"
Parsed: operation=create, title=shopping, confidence=0.95
Response: "Bilkul, 'shopping' task banaya gaya."
```

### Example 3: Complete with Priority
```
Input: "Homework urgent hai, mukkammal kar do"
Parsed: operation=complete, title=homework, priority=high, confidence=0.95
Response: "Shukriya, 'homework' task mukkammal ho gaya."
```

## References

For detailed API documentation, see:
- **[api-schema.md](references/api-schema.md)** - Complete tool signatures, patterns, and examples

## Script

The `mcp_server.py` script includes:
- `RomanUrduParser` class with pattern matching
- 2 MCP tools (parse_urdu_intent, generate_urdu_response)
- Error handling and logging

Run with:
```bash
python scripts/mcp_server.py
```
