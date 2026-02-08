---
id: 0014
title: Plan CRUD expansion, reference resolver, proactive personality
stage: plan
date: 2026-02-08
surface: agent
model: claude-haiku-4-5-20251001
feature: 014-agentic-chatbot
branch: 014-agentic-chatbot
user: amrahaanwar
command: /sp.plan
labels: ["crud-tools", "reference-resolution", "proactive-personality", "implementation-plan"]
links:
  spec: /mnt/d/todo-evolution/phase_03/specs/014-agentic-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - phase_03/specs/014-agentic-chatbot/plan-CRUD-ProactivePersonality.md
tests:
  - complete_task() persists to DB with session.commit()
  - delete_task() removes record from Neon DB
  - update_task() updates specified fields with validation
  - Reference resolver resolves "first task", "milk task", "dusra wala"
  - Reference resolver returns suggestions on multiple matches
  - Proactive personality asks about missing details after add_task
  - Proactive personality never returns empty response
---

## Prompt

Goals: Create detailed implementation plan for three major components:

1. Logic Expansion:
   - Extend 'TaskToolbox' Skill to include:
     - complete_task(task_id: int) -> session.commit()
     - delete_task(task_id: int) -> session.commit()
     - update_task(task_id: int, **kwargs) -> session.commit()

2. Reference Resolver Skill:
   - Implement a logic layer that fetches the current task list context to resolve terms like "first," "last," or "the milk task" to specific IDs.

3. Agent Instructions:
   - Update 'AgentRunner' system prompt to enforce a "Proactive Follow-up" rule: Always ask for 1 missing attribute after a successful creation.

## Response snapshot

**Comprehensive implementation plan for full CRUD + reference resolution + proactive personality:**

### 1. TaskToolbox Skill Expansion ✅

**File**: `backend/src/tools/task_toolbox.py`

**Three New Methods**:

#### complete_task(user_id, task_id) → Dict[str, Any]
- **Purpose**: Mark task as completed with timestamp
- **Logic**: Query with user isolation → validate task exists → update status="completed" → set completed_at → session.commit()
- **Returns**: `{success: true, data: {task_id, title, status: "completed", completed_at}, error?}`
- **Error Handling**: Task not found (404), invalid task_id format, database errors
- **MCP Schema**: Wrapped in `{"type": "function", "function": {...}}`

#### delete_task(user_id, task_id) → Dict[str, Any]
- **Purpose**: Permanently remove task from database
- **Logic**: Query with user isolation → validate task exists → session.delete() → session.commit()
- **Returns**: `{success: true, data: {task_id, title, status: "deleted"}, error?}`
- **Error Handling**: Task not found (404), invalid task_id, database errors
- **MCP Schema**: Wrapped in `{"type": "function", "function": {...}}`

#### update_task(user_id, task_id, title?, description?, priority?, due_date?, status?) → Dict[str, Any]
- **Purpose**: Update one or more task attributes with validation
- **Logic**: Query with user isolation → validate all provided fields → update only provided fields → set updated_at → session.commit()
- **Validation**:
  - title: must not be empty if provided
  - priority: must be in [low, medium, high]
  - due_date: parse ISO format or special strings ('tomorrow')
  - status: must be in [pending, completed]
- **Returns**: `{success: true, data: {task_id, title, description, priority, due_date, status, updated_at}, error?}`
- **Error Handling**: Task not found (404), invalid field values, empty title, invalid date
- **MCP Schema**: Wrapped with all 5 optional parameters

#### Updated get_tools_schema()
- **Returns**: List of 5 tools (add_task, list_tasks, complete_task, delete_task, update_task)
- **Format**: Each wrapped in `{"type": "function", "function": {...}}`

**Key Constraint**: All methods call `session.commit()` internally (no caller responsibility)

---

### 2. Reference Resolver Skill (New Sub-Agent) ✅

**File**: `backend/src/tools/reference_resolver.py` (NEW)

**Class**: `ReferenceResolver`

**Main Method**: resolve_reference(reference: str, user_id: str, available_tasks: List[Task]) → Dict[str, Any]

**Two-Tier Resolution Algorithm**:

**Tier 1 - Direct Match** (via _tier1_direct_match):
- Fuzzy string matching on task titles and descriptions
- Use difflib.SequenceMatcher or Levenshtein distance
- Threshold: 80% similarity
- Example: "milk task" matches "Buy milk" at 85% → HIGH confidence
- Returns: `{success: true, task_id, task_title, confidence: "high", method: "direct_match"}`

**Tier 2 - Contextual Match** (via _tier2_contextual_match):
- A. **Temporal Keywords**:
  - "first" / "oldest" / "purana" → min(created_at) = oldest task
  - "last" / "latest" / "newest" / "naya" → max(created_at) = newest task

- B. **Positional Keywords**:
  - "second" / "dusra" → tasks[1]
  - "third" / "tisra" → tasks[2]
  - Numeric: "Task 3" / "3" → tasks[2] (0-indexed)

- C. **Status-Based Keywords**:
  - "completed" / "done" → first task with status="completed"
  - "pending" → first task with status="pending"

- Returns: `{success: true, task_id, task_title, confidence: "medium", method: "temporal_match|positional_match"}`

**Resolution Flow**:
1. Try Tier 1 (direct match) → If match found with >80% confidence → return success
2. If no Tier 1 → Try Tier 2 (contextual) → If single match → return success
3. If multiple matches → return `{success: false, suggestions: [{task_id, task_title, created_at}, ...]}`
4. If no match → return `{success: false, error: "I couldn't find that task. Here are your tasks: ..."}`

**Integration with ChatService** (`backend/src/services/chat_service.py`):
- In `_execute_tools()`, before executing complete_task/delete_task/update_task:
  - If task_id looks ambiguous (not pure number):
    - Fetch available_tasks = task_toolbox.list_tasks(user_id)
    - Call reference_resolver.resolve_reference(task_ref, user_id, available_tasks)
    - If resolved → use resolved task_id for tool execution
    - If error → return error with suggestions to user
    - Log: "Resolved 'milk task' to task_id=5: 'Buy milk'"

**Example Usage**:
```
User: "Bread wala task complete kardo"

1. Extract reference: "bread wala"
2. Fetch user's tasks: [Task1: "Apples", Task2: "Buy bread", Task3: "Milk"]
3. Tier 1 - Direct match: "bread" in "Buy bread" at 90% confidence → Match found!
4. Execute: complete_task(task_id=Task2.id, user_id)
5. Return confirmation in Roman Urdu
```

**Another Example**:
```
User: "Task 3 delete karo"

1. Extract reference: "3"
2. Fetch user's tasks: [Task1, Task2, Task3, ...]
3. Tier 1 - Direct match: No match on "3"
4. Tier 2 - Contextual: Numeric "3" → tasks[2] (0-indexed) = Task3
5. Execute: delete_task(task_id=Task3.id, user_id)
6. Return confirmation
```

---

### 3. Proactive Personality Agent Instructions ✅

**Status**: ✅ **Already implemented in PHR 0012** (two-turn response synthesis)

**Current Implementation**:
- System prompt for synthesis turn (second LLM turn after tool execution)
- Language-aware: English and Roman Urdu prompts
- Asks about priority, due date, description after task creation
- Uses warm tone with emojis (🎉, ✅, 📝)
- Proactive: "Would you like to set a priority?" or "Kya aap iska priority set karna chahenge?"

**Enhancement Required** (this plan):
- Detect action type from tool results (add_task, delete_task, complete_task, update_task)
- For add_task: **ALWAYS** ask about missing attributes
- For delete_task/complete_task: Celebrate and suggest next action
- For update_task: Confirm change and ask about other details

**Enhanced System Prompt Logic**:
```python
# In _synthesize_response()

# Detect action type
action_type = detect_action_type(tool_results)  # Returns "add_task", "delete_task", etc.

# Conditionally enhance system prompt
if action_type == "add_task":
    synthesis_system += "\n\n**IMPORTANT**: ALWAYS ask about missing details: priority, due date, or description. This completes the user's task setup."
elif action_type == "complete_task":
    synthesis_system += "\n\n**IMPORTANT**: Celebrate with warm message (Nice work! 🎉) and ask what's next"
elif action_type == "delete_task":
    synthesis_system += "\n\n**IMPORTANT**: Acknowledge deletion and suggest next task"
elif action_type == "update_task":
    synthesis_system += "\n\n**IMPORTANT**: Confirm the specific change and ask about other details"

# Call LLM with enhanced prompt
response = client.chat.completions.create(
    model=model,
    messages=synthesis_messages,
    ...
)
```

**Proactive Follow-up Examples**:

**After add_task (English)**:
- "Got it! Your task has been created! 🎉 Would you like to set a priority level (low/medium/high) or add a due date?"

**After add_task (Roman Urdu)**:
- "Bilkul! Task create ho gaya! 🎉 Kya aap iska priority set karna chahenge? (low/medium/high)"

**After complete_task**:
- "Done! Task marked as complete! ✅ Nice work! Want to create another task?"

**After delete_task**:
- "Perfect! Task delete ho gaya! ✅ Agla task ke liye mujhe aage help deni hai?"

**After update_task**:
- "Perfect! Priority set to high! ✅ Want to add a due date too?"

**Never Empty Response Guarantee**:
- Fallback confirmations (English + Roman Urdu) ensure assistant_message is never empty
- Fallback examples:
  - English: "Your action has been completed successfully! 🎉 Let me know if you'd like to adjust anything."
  - Roman Urdu: "Task action complete ho gaya! 🎉 Agar kuch aur chahiye to batao!"

---

### Implementation Breakdown

**Phase A: TaskToolbox Expansion** (4 tasks, 8 hours)
- Task A1: Implement complete_task() with validation and session.commit()
- Task A2: Implement delete_task() with user isolation and session.commit()
- Task A3: Implement update_task() with field validation and session.commit()
- Task A4: Update get_tools_schema() to include all 5 tools with MCP wrapping

**Phase B: Reference Resolver** (4 tasks, 12 hours)
- Task B1: Create ReferenceResolver class structure
- Task B2: Implement Tier 1 - Direct match with fuzzy string matching
- Task B3: Implement Tier 2 - Contextual match with keyword detection
- Task B4: Integrate into ChatService._execute_tools()

**Phase C: Proactive Personality** (2 tasks, 4 hours)
- Task C1: Enhance synthesis prompts with action-type awareness
- Task C2: Add validation tests for personality consistency

**Testing** (10+ tests, 16 hours)
- Unit tests: complete_task, delete_task, update_task validation
- Unit tests: ReferenceResolver Tier 1 & Tier 2 matching
- Integration tests: CRUD flows, reference resolution accuracy
- Integration tests: Proactive personality prompts

**Total**: 20+ tasks, 40 hours, 5 days estimated effort

---

### Test Coverage

**Unit Tests**:
- ✅ complete_task success/not found/database error
- ✅ delete_task success/not found/database error
- ✅ update_task validation (priority, due_date, status, title)
- ✅ Direct match fuzzy (milk → Buy milk at 85%)
- ✅ Temporal keywords (first, last, old, new, purana)
- ✅ Positional keywords (second, dusra, third, tisra)
- ✅ Numeric references (Task 3 → tasks[2])
- ✅ Multiple match suggestions

**Integration Tests**:
- ✅ Complete task via ambiguous reference ("Complete the bread task")
- ✅ Delete task via numeric reference ("Task 3 delete karo")
- ✅ Update task via temporal reference ("Update the last task")
- ✅ Proactive follow-up after creation
- ✅ Celebration message after completion
- ✅ Suggestions when multiple matches

### Success Criteria

✅ **CRUD Tools**:
- [ ] complete_task() marks task completed and persists
- [ ] delete_task() removes task and persists
- [ ] update_task() updates fields with validation
- [ ] All wrapped in OpenAI format
- [ ] session.commit() called internally in all

✅ **Reference Resolver**:
- [ ] Resolves direct matches at 85%+ accuracy
- [ ] Resolves temporal keywords (first, last, old, new)
- [ ] Resolves positional keywords (second, third, dusra)
- [ ] Resolves numeric references (Task 3)
- [ ] Returns suggestions on multiple matches
- [ ] Achieves 95%+ overall accuracy

✅ **Proactive Personality**:
- [ ] After add_task: asks about priority/due_date/description
- [ ] After complete_task: celebrates and suggests next action
- [ ] After delete_task: acknowledges and suggests next task
- [ ] Uses warm tone with emojis
- [ ] Responses NEVER empty
- [ ] Multi-language support (English + Roman Urdu)

---

### Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Fuzzy matching false positives | High threshold (85%+), return suggestions on multiple matches |
| Numeric reference errors | Validate index bounds, return error if out of range |
| session.commit() failures | Try-except wrapper, return error, queue for retry |
| Performance latency | Cache available_tasks in ChatService, reuse across request |
| Multi-language keyword gaps | Maintain comprehensive keyword mapping, add Urdu variants |

---

## Outcome

- ✅ Impact: **Three-component implementation plan complete and detailed**. All requirements addressed with clear algorithms, code signatures, integration points, and test coverage.
- 🧪 Tests:
  - CRUD tool implementations documented ✓
  - Reference resolver two-tier algorithm detailed ✓
  - Proactive personality enhancement strategy defined ✓
  - 20+ test cases specified ✓
  - Success criteria measurable and testable ✓
- 📁 Files: 1 file created:
  - specs/014-agentic-chatbot/plan-CRUD-ProactivePersonality.md (full implementation plan)
- 🔁 Next prompts: Generate detailed implementation tasks (/sp.tasks); begin implementation; test end-to-end CRUD flows
- 🧠 Reflection: **Root insight**: Full CRUD + reference resolution requires careful coordination across three layers: (1) TaskToolbox for persistence, (2) ReferenceResolver for ambiguous reference handling, (3) Synthesis prompts for personality. The two-tier resolution algorithm (direct match → contextual match → suggestions) enables natural language references while maintaining accuracy.

## Evaluation notes (flywheel)

- Failure modes observed: None at planning level. Architecture is sound and addresses all three requirements.
- Graders run and results (PASS/FAIL): Plan structure verified. Ready for task generation.
- Prompt variant (if applicable): null
- Next experiment: Generate tasks from plan; verify implementation can achieve 95%+ reference resolution accuracy

---

## File Manifest

**New Files**:
- `phase_03/specs/014-agentic-chatbot/plan-CRUD-ProactivePersonality.md` - Complete implementation plan (350+ lines)

**Files to Be Modified** (in tasks phase):
- `backend/src/tools/task_toolbox.py` - Add complete_task, delete_task, update_task
- `backend/src/tools/reference_resolver.py` - Create new file with ReferenceResolver class
- `backend/src/services/chat_service.py` - Integrate reference resolver into tool execution
- `backend/src/services/agent_runner.py` - Already has proactive personality (PHR 0012)
- `backend/tests/unit/test_*.py` - Add 10+ unit tests
- `backend/tests/integration/test_*.py` - Add 10+ integration tests

**Timeline**: 5 days (40 hours total effort)

**Next Command**: `/sp.tasks` to generate detailed implementation task list
