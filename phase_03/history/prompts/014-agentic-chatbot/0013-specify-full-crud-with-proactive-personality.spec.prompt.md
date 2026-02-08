---
id: 0013
title: Specify full CRUD operations with proactive personality
stage: spec
date: 2026-02-08
surface: agent
model: claude-haiku-4-5-20251001
feature: 014-agentic-chatbot
branch: 014-agentic-chatbot
user: amrahaanwar
command: /sp.specify
labels: ["crud-operations", "proactive-personality", "ambiguous-references", "multi-language"]
links:
  spec: /mnt/d/todo-evolution/phase_03/specs/014-agentic-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - phase_03/specs/014-agentic-chatbot/spec.md
tests:
  - complete_task MCP tool executes when user says "Mark task as done" or "Task complete kardo"
  - delete_task MCP tool executes when user says "Delete task" or "Task delete karo"
  - update_task MCP tool executes for priority/due_date/description updates
  - Ambiguous references resolved: "Task 3 delete karo" deletes correct record
  - Ambiguous references resolved: "Bread wala task complete kardo" completes correct task
  - Proactive personality: After task creation, bot asks about missing details
  - Multi-language: Confirmations in Roman Urdu when user input is Roman Urdu
  - Never empty: assistant_message always contains confirmation with fallbacks
---

## Prompt

Goal: Implement full CRUD operations (Edit, Delete, Complete) with proactive personality.

Requirements:
- Agent must support 'complete_task', 'delete_task', and 'update_task' via MCP tools [FR-002]
- Implementation must handle ambiguous references (e.g., "Delete the last task" or "Dusra wala done karo") [FR-014]
- Proactive Personality: After adding a task, the bot MUST ask for missing details like due date, priority, or description [FR-009, FR-011]
- Multi-language: Maintain full support for Roman Urdu confirmations [FR-012]

Acceptance Criteria:
- Saying "Task 3 delete karo" removes the correct record from Neon DB
- Saying "Bread wala task complete kardo" updates the 'completed' status to true
- The chatbot never returns an empty response after a tool execution

## Response snapshot

**Updated specification with comprehensive CRUD operations and proactive personality:**

### Key Enhancements Made

**1. User Story Updates - Full CRUD Coverage**

✅ **User Story 2 (Task Completion)** - Enhanced with:
- Explicit references: "Mark buy groceries as done"
- Fuzzy/title-based: "Complete the bread task"
- Ambiguous Urdu references: "Dusra wala done karo" (Complete the second one)
- Proactive follow-up: "Nice work! Want to create another task?"
- Acceptance criteria: "Bread wala task complete kardo" updates status to completed

✅ **User Story 3 (Task Deletion)** - Enhanced with:
- Explicit references: "Delete task: old project"
- Numeric/positional: "Delete the third task" or "Task 3 delete karo"
- Fuzzy/title-based: "Delete the old project"
- Ambiguous Urdu references: "Purana wala delete kardo" (Delete the old one)
- Acceptance criteria: "Task 3 delete karo" removes correct record from Neon DB

✅ **User Story 4 (Task Update)** - Enhanced with:
- Support updating priority: "Set priority to high"
- Support updating due date: "Change due date to tomorrow"
- Support adding description: "Add description: buy organic milk"
- Proactive follow-ups: After task creation, ask about priority/due date/description
- Acceptance criteria: Fuzzy reference resolution for "Update the bread task"

**2. Functional Requirements - Comprehensive CRUD & Personality (FR-002 through FR-017)**

✅ **FR-002 (Enhanced)**: ALL CRUD operations through TaskToolbox; `complete_task`, `delete_task`, `update_task` tools MUST be fully implemented and bound with `tool_choice='auto'`

✅ **FR-009 (Enhanced)**: Warm, friendly confirmations with proactive follow-ups asking about missing details (priority, due date, description); NEVER empty responses

✅ **FR-011 (Enhanced)**: Proactive personality asking for missing details after task creation BEFORE asking for next action

✅ **FR-012 (Enhanced)**: Roman Urdu commands like "Bread wala task complete kardo" MUST be supported; responses MUST be in Roman Urdu when user input is in Roman Urdu

✅ **FR-014 (Enhanced)**: Two-tier ambiguous reference resolution:
- Tier 1: Direct match on task titles in conversation history (last 10 messages)
- Tier 2: Contextual match on positional/temporal keywords ("first", "last", "second", "old", "new", "purana", "dusra")
- If multiple matches found, ask user with list
- If single match, auto-select and confirm which task was referenced

✅ **FR-017 (New)**: `assistant_message` is NEVER empty; fallback confirmations MUST be provided in both English and Roman Urdu based on user's language preference

**3. Success Criteria - CRUD & Personality (SC-017 through SC-026)**

✅ **SC-017**: `complete_task` MCP tool fully implemented and automatically invoked

✅ **SC-018**: `delete_task` MCP tool fully implemented and automatically invoked

✅ **SC-019**: `update_task` MCP tool fully implemented for priority/due_date/description/status updates

✅ **SC-020**: Ambiguous task references resolved with 95%+ accuracy

✅ **SC-021**: Assistant responses NEVER empty after tool execution; fallback confirmations with proactive follow-ups MUST be present

✅ **SC-022**: After task creation, assistant MUST proactively ask about missing details before asking for next action

✅ **SC-023**: Confirmation messages follow storyteller format with warm tone and emojis (🎉, ✅, 📝, etc.)

✅ **SC-024**: When user input is in Roman Urdu, confirmation messages MUST be in Roman Urdu

✅ **SC-025**: Database records persist correctly when user says "Task 3 delete karo" - correct record removed from Neon DB

✅ **SC-026**: Database records persist correctly when user says "Bread wala task complete kardo" - task status updated to 'completed' in Neon DB

### Implementation Guidance

**Ambiguous Reference Resolution Algorithm**:

```
User Input: "Bread wala task complete kardo"

Step 1: Normalize & Check Language
  - Normalized: "bread wala task complete kardo"
  - Language: Roman Urdu detected → use RomanUrduHandler
  - Operation: "complete_task"
  - Reference: "bread wala" (the bread one)

Step 2: Tier 1 - Direct Match (Last 10 Messages)
  - Search conversation history for task mentions
  - Look for "bread" in recent assistant responses
  - If found: "Got it! I see you created a 'Buy bread' task earlier"
  - Match confidence: HIGH

Step 3: Tier 2 - Contextual Match (if no Tier 1 match)
  - Check if reference contains temporal keywords: "purana" (old), "dusra" (second), etc.
  - If "bread" found in task titles: return task
  - Match confidence: MEDIUM

Step 4: Execute Tool
  - Call: complete_task(task_id="<from-step-2>")
  - Session.commit() called inside tool
  - Return result

Step 5: Synthesis Turn
  - Collect tool result
  - Trigger second LLM turn with synthesis_system prompt
  - Language: Roman Urdu (from step 1)
  - Response: "Perfect! Task complete mark ho gaya! 🎉 Kya koi aur task banani hai?"

Result: Task status updated in Neon DB, confirmation in Roman Urdu
```

**Proactive Personality Flow After Task Creation**:

```
User: "Add task: buy groceries"

Turn 1 (Tool Execution):
  - Agent identifies: add_task(title="buy groceries")
  - Tool executes: task created, session.commit()
  - Returns: {success: true, data: {task_id, title}}

Turn 2 (Response Synthesis):
  - System prompt: "Ask about missing details: priority, due date, description"
  - Synthesis: "Got it! Task created! 🎉 Would you like to set a priority level (low/medium/high) or add a due date?"

User: "Set priority high"

Turn 1 (Tool Execution):
  - Agent identifies: update_task(task_id, priority="high")
  - Tool executes: task updated, session.commit()
  - Returns: {success: true, data: {task_id, priority: "high"}}

Turn 2 (Response Synthesis):
  - System prompt: "Confirm update, ask about other details"
  - Synthesis: "Perfect! Priority set to high! ✅ Want to add a due date or description?"

Result: Multi-turn interaction with proactive follow-ups
```

## Outcome

- ✅ Impact: **Full CRUD specification complete with proactive personality and ambiguous reference handling**. All three requirements met: complete_task/delete_task/update_task tools specified, ambiguous reference resolution documented, proactive personality integrated.
- 🧪 Tests:
  - CRUD operations: complete_task, delete_task, update_task all specified with acceptance criteria ✓
  - Ambiguous references: Two-tier resolution algorithm documented ✓
  - Proactive personality: "Ask about missing details" flow documented ✓
  - Multi-language: Roman Urdu confirmations confirmed ✓
  - Never empty: Fallback confirmation strategy documented ✓
- 📁 Files: 1 file modified:
  - specs/014-agentic-chatbot/spec.md (user stories, FR, SC enhanced)
- 🔁 Next prompts: Generate detailed implementation tasks for CRUD + proactive personality; implement ambiguous reference resolution in RomanUrduHandler; test end-to-end flows
- 🧠 Reflection: **Root insight**: Full CRUD + proactive personality requires: (1) MCP tool binding with tool_choice='auto', (2) ambiguous reference resolution via two-tier matching, (3) language-aware response synthesis. The proactive personality naturally emerges from asking follow-up questions after each action.

## Evaluation notes (flywheel)

- Failure modes observed: None at specification level. Requirements are clear and testable.
- Graders run and results (PASS/FAIL): Specification structure verified. Ready for task generation and implementation planning.
- Prompt variant (if applicable): null
- Next experiment: Generate tasks.md for CRUD + ambiguous reference resolution; verify implementation can handle all acceptance criteria

---

## Citations

- FR-002, FR-009, FR-011, FR-012, FR-014: Full CRUD operations with tool binding, warm confirmations, proactive personality, multi-language support, ambiguous reference handling
- SC-017 through SC-026: Success criteria for complete_task, delete_task, update_task with personality and never-empty responses
