---
id: 0003
title: Generate tasks for tool binding, retry logic, reference mapping
stage: tasks
date: 2026-02-08
surface: agent
model: claude-haiku-4-5-20251001
feature: 015-force-explicit-tool
branch: 015-force-explicit-tool
user: (system)
command: /sp.tasks
labels: ["tasks", "tool-binding", "execution-guard", "reference-resolver", "testing"]
links:
  spec: specs/015-force-explicit-tool/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/015-force-explicit-tool/tasks.md
tests:
  - Unit tests for all core components (3 files)
  - Integration tests for end-to-end flows (2 files)
  - Execution guard verification tests (1 file)
---

## Prompt

User Input - Specific Tasks to Implement:

```
Tasks:

- [T050] Update 'AgentRunner' to log the RAW JSON payload sent to OpenRouter to verify 'tools' are present.

- [T051] Modify 'ChatService.process_chat_message' to return an error if the user intent is "list" but the 'list_tasks' tool was not executed.

- [T052] Fix the 'ReferenceResolver' to handle the 7 specific tasks identified in the logs (sleep, Sleep, Client meeting, etc.) using case-insensitive UUID mapping.

- [T053] Update the System Prompt to: "Current Date: Feb 8, 2026. You are an Agentic AI. You CANNOT perform actions without calling tools. If you don't call a tool, you have failed."
```

## Response snapshot

**Tasks File Generated**: `specs/015-force-explicit-tool/tasks.md`

**Task Structure**: 11 core implementation tasks organized into 4 phases

### Phase 1: Setup & Tool Binding (2 tasks)
- T050: Log RAW JSON payload from AgentRunner (verify tools array present)
- T050B: Add error handling if tools array empty/None

### Phase 2: Foundational - Execution Guard (4 tasks)
- T051: Execution guard in ChatService with intent detection and retry logic
- T052: ReferenceResolver case-insensitive fuzzy matching (0.6 threshold)
- T053: System prompt update with current date and tool mandate
- (No test tasks in foundational phase - these are prerequisites)

### Phase 3: User Story Implementation (5 tasks)
- T054 [US1]: Delete task unit test + verification
- T055 [US1]: Delete task implementation
- T056 [US2]: List tasks unit test + 7-task verification
- T057 [US2]: List tasks implementation
- T058 [US3]: Update/complete task unit test
- T059 [US3]: Update/complete task implementation
- T060 [US4]: Add task integration test
- T061 [US5]: Execution guard test (missing tool detection + retry)

### Task Details

**T050** (25 mins):
- Modify: backend/src/services/agent_runner.py
- Action: Log JSON payload before OpenRouter call
- Acceptance: Can parse logs, verify tools array and tool_choice='auto'

**T050B** (15 mins):
- Modify: backend/src/services/agent_runner.py (same file)
- Action: Add validation for non-empty tools array
- Acceptance: Returns error if tools empty

**T051** (60 mins):
- Modify: backend/src/services/chat_service.py
- Actions:
  1. New method: _intent_detector(message) → intent string
  2. Update: _execute_tools() to detect missing tools
  3. Implement: Retry logic with forced system instruction
  4. Return: "Technical error: Tool not triggered." on 2nd failure
- Acceptance: "list my tasks" with no tool → retry → succeeds

**T052** (40 mins):
- Modify: backend/src/tools/reference_resolver.py
- Actions:
  1. Implement fuzzy match with difflib.SequenceMatcher
  2. Threshold: 0.6 for match
  3. Exact match first (fast path)
  4. Handle 7 test cases: sleep/Sleep/Client meeting/etc.
- Acceptance: resolve_reference("sleep") returns correct UUID

**T053** (30 mins):
- Modify: backend/src/services/chat_service.py
- Actions:
  1. Update _build_system_prompt()
  2. Add: "Current Date: February 8, 2026"
  3. Add: Tool mandate ("You CANNOT perform actions without calling tools...")
  4. Repeat date twice, forbid 2024/2025/2027+
  5. Update both English and Urdu prompts
- Acceptance: Tasks due tomorrow → Feb 9, 2026 confirmed

**T054-T061** (Test + Implementation tasks):
- Files: New test files + modifications to chat_service.py
- Coverage: All CRUD operations (add, list, delete, update, complete)
- Acceptance: All scenarios pass, 7 tasks returned, no ghost success

### Dependency Graph

```
T050 → T050B (same component)
T050, T050B → T051 (execution guard depends on logging)
T051 → T053 (system prompt uses _intent_detector from T051)
T052 (independent - reference resolver)

After Phase 2:
T054-T061 (tests) can run in parallel
Tests can trigger implementations (T055, T057, T059)
```

### Parallel Execution Plan

**Phase 1 Sequential**: T050 → T050B (same file)

**Phase 2 Sequential**: T051 → T053 (T051 needed for T053), T052 parallel

**Phase 3 Parallel** (after Phase 2 complete):
- Can run all tests simultaneously: T054, T056, T058, T060, T061
- Can run all implementations simultaneously: T055, T057, T059
- Order: Tests → Implementations (TDD approach) or concurrent

### MVP Scope

**Minimal Ghost Success Fix**: T050, T050B, T051, T052, T053, T061
- Eliminates ghost success messages
- Forces tool execution with retry
- Detects and reports missing tools
- ~165 lines of code changes + 40 lines tests

**Full Coverage**: Add T054-T060
- Complete test suite for all CRUD operations
- ~250 lines of test code
- Verification of all acceptance scenarios

### Acceptance Validation

After all tasks:
1. ✅ "delete Read book" → delete_task in logs
2. ✅ "list my tasks" → list_tasks tool called, 7 tasks returned
3. ✅ "mark Read book as done" → complete_task called
4. ✅ No ghost success (all success has tool execution)
5. ✅ Missing tool → "Technical error: Tool not triggered."

---

## Outcome

- ✅ Impact: 11 concrete, implementable tasks with exact file paths and acceptance criteria; phase ordering enables parallel execution after foundational work
- 🧪 Tests: 6 test files defined with specific test cases per task; integration tests for end-to-end verification
- 📁 Files: tasks.md (600+ lines) with full task descriptions, dependencies, acceptance criteria, MVP scope
- 🔁 Next prompts: Execute `/sp.implement` to begin Phase 1, or run individual tasks with `/sp.implement T050`, etc.
- 🧠 Reflection: Tasks are specific and immediately executable. Dependency graph ensures correct order. Parallel opportunities identified after foundational phase. All acceptance scenarios from spec are covered by at least one task. MVP scope is achievable (6 core tasks in ~4-5 hours).

## Evaluation notes (flywheel)

- Failure modes observed: None - task generation comprehensive with clear acceptance criteria
- Graders run and results (PASS/FAIL): PASS (all tasks follow checklist format, dependencies clear, files specified, MVP identified)
- Prompt variant (if applicable): Integrated user-provided T050-T053 tasks into broader task structure with supporting tests
- Next experiment (smallest change to try): Implement T050 first to establish logging, then T050B, then T051 (foundational chain)
