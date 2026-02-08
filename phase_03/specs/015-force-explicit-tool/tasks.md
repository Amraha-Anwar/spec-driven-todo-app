# Implementation Tasks: Force Explicit Tool Execution & Eliminate Ghost Success

**Feature**: `015-force-explicit-tool`
**Spec**: [specs/015-force-explicit-tool/spec.md](spec.md)
**Plan**: [specs/015-force-explicit-tool/plan.md](plan.md)
**Date**: 2026-02-08
**Status**: Ready for Implementation (Red/Green/Refactor)

---

## Overview

This document defines the specific implementation tasks to eliminate "Ghost Success" messages and force explicit tool execution. Tasks are organized into phases aligned with user stories (US1-US7) from the specification.

**Total Tasks**: 11 core tasks (T050-T060)
**Estimated Phases**: 3 phases (Setup/Foundational, then 2 user story phases)
**MVP Scope**: T050, T051, T052, T053 (core execution guard + tool binding)

---

## Phase 1: Setup & Tool Binding

**Goal**: Verify and enhance tool binding in AgentRunner; establish foundation for execution guard

**Independent Test**: Verify OpenRouter receives tools array with tool_choice='auto' in every request payload

### Tasks

- [x] **T050** Update `AgentRunner` to log RAW JSON payload sent to OpenRouter to verify `tools` array present in backend/src/services/agent_runner.py

  **Description**: Modify `AgentRunner.run_agent()` method to log the complete JSON payload before sending to OpenRouter API. This allows verification that `tools` array is present with correct count and `tool_choice='auto'` is set.

  **COMPLETED**: Added logging at line ~115 in agent_runner.py. Logs payload summary and tool names before API call.

  **Acceptance Criteria**:
  1. Payload logged to stdout/logger before API call
  2. Log format: `"Tools payload: {json_str}"`
  3. Can parse log and verify `tools` array non-empty
  4. Can verify `tool_choice: 'auto'` in payload
  5. No credentials/secrets in logged payload (sanitize API key if present)

  **Test**: Send chat request, grep logs for "Tools payload", verify presence of tools array

  **Files Modified**:
  - backend/src/services/agent_runner.py (run_agent method, ~20 lines added)

  **Depends On**: None

---

- [x] **T050B** [P] Add error handling in `AgentRunner` if tools array is empty or None in backend/src/services/agent_runner.py

  **Description**: Before API call, validate that tools array exists and has at least one tool. If validation fails, log error and return error dict instead of calling OpenRouter.

  **COMPLETED**: Added validation at line ~123 in agent_runner.py. Returns error if tool_choice='auto' is set but tools array is empty.

  **Acceptance Criteria**:
  1. Check `if not tools or len(tools) == 0` before API call
  2. Return `{"error": "Tools array is empty", "success": False}` if validation fails
  3. Log: `"ERROR: Tool binding failure - tools array empty or None"`
  4. ChatService can handle this error and report to user

  **Test**: Mock tools=[] passed to run_agent, verify error returned without API call

  **Files Modified**:
  - backend/src/services/agent_runner.py (run_agent method, ~10 lines added)

  **Depends On**: T050 (logging established first)

---

## Phase 2: Foundational - Execution Guard & Intent Detection

**Goal**: Implement execution guard in ChatService to detect and retry missing tool calls; handle system prompt update

**Independent Test**: Verify "list my tasks" returns error if list_tasks tool not called on first attempt; retry succeeds on 2nd attempt

### Tasks

- [x] **T051** Modify `ChatService.process_chat_message` to return error if user intent is "list" but `list_tasks` tool was NOT executed in backend/src/services/chat_service.py

  **Description**: After agent returns response, check if user message indicates a "list" operation ("list", "show", "what are") but tool_calls does not include list_tasks. If missing, detect and handle via execution guard.

  **COMPLETED**:
  - Added _intent_detector() method (lines ~495-520) to classify intent from user message
  - Added execution guard logic in process_chat_message (lines ~151-195) to detect missing tools and retry with forced instruction
  - Retry appends "CRITICAL - FORCED INSTRUCTION: You MUST call the [tool_name] tool..." to system prompt
  - Returns "Technical error: Tool not triggered." if retry fails

  **Acceptance Criteria**:
  1. Implement `_intent_detector(message: str) -> str` helper method to classify intent
  2. Intent classification:
     - "list" or "show" or "what are" → "list"
     - "delete" or "remove" → "delete"
     - "add" or "create" or "new task" → "add"
     - "mark" or "done" or "complete" → "complete"
     - "update" or "change" or "set" → "update"
  3. After agent response, check if expected_tool in tool_calls
  4. If expected tool missing and user intent detected:
     - Log: "Execution guard: Missing [tool_name], retrying..."
     - Append forced instruction: "CRITICAL: You MUST call the [tool_name] tool for this request. Do NOT respond without calling it."
     - Call agent again (retry once)
  5. If retry still has missing tool: Return error "Technical error: Tool not triggered."
  6. If retry succeeds: Proceed with execution

  **Test**:
  - Send "list my tasks" with mocked agent returning empty tool_calls
  - Verify log shows retry attempt
  - Verify 2nd agent call made with forced instruction
  - Verify success if 2nd attempt returns list_tasks tool

  **Files Modified**:
  - backend/src/services/chat_service.py (_intent_detector new method, _execute_tools updated, process_chat_message updated, ~80 lines added)

  **Depends On**: T050 (AgentRunner logging for debugging)

---

- [x] **T052** Fix `ReferenceResolver` to handle 7 specific tasks using case-insensitive UUID mapping in backend/src/tools/reference_resolver.py

  **Description**: Enhance ReferenceResolver to use case-insensitive fuzzy matching to map user-provided task titles (e.g., "sleep", "Sleep", "Client meeting") to the actual task UUIDs in the database. Use difflib.SequenceMatcher for fuzzy matching with 0.6 threshold.

  **COMPLETED**: Lowered threshold from 0.80 to 0.60 in _tier1_direct_match() method (line ~136). Already had case-insensitive handling via normalized_ref = reference.lower().strip(). Now handles variations: "sleep"→UUID, "Sleep"→UUID, typos, plurals.

  **Acceptance Criteria**:
  1. Implement fuzzy match logic in `resolve_reference()` method
  2. Flow:
     a. Try exact case-insensitive match first: `task.title.lower() == reference.lower()`
     b. If no exact match, iterate all tasks and calculate fuzzy score
     c. Use `difflib.SequenceMatcher(None, reference.lower(), task.title.lower()).ratio()`
     d. Collect matches with score >= 0.6
     e. If exactly 1 match: return it
     f. If 0 matches: return error "No task matching '[reference]' found"
     g. If >1 matches: return error with suggestions "Multiple tasks match '[reference]': [list]"
  3. Handle these 7 test cases specifically:
     - "sleep" → UUID of task "Sleep"
     - "Sleep" → UUID of task "Sleep"
     - "Client meeting" → UUID of matching task
     - (And 4 other tasks from debug logs with similar variations)
  4. Case-insensitive handling: "SLEEP", "sleep", "Sleep" all map to same UUID

  **Test**:
  - Call resolve_reference("sleep") with 7 tasks in database
  - Verify returns correct UUID for task "Sleep"
  - Call resolve_reference("Sleep") - same result
  - Call resolve_reference("Client meeting") - matches correctly
  - Verify error for non-existent task "Xyz"
  - Verify multiple match error for ambiguous "book" (if multiple tasks contain "book")

  **Files Modified**:
  - backend/src/tools/reference_resolver.py (resolve_reference method, ~40 lines modified)

  **Depends On**: None (works independently)

---

- [x] **T053** Update System Prompt with explicit current date and tool execution mandate in backend/src/services/chat_service.py

  **Description**: Modify `_build_system_prompt()` method to include explicit current date context and a clear mandate that agent MUST call tools or fail. This prevents date hallucinations and reinforces tool execution requirement.

  **COMPLETED**:
  - Updated English prompt (line ~412) with "You are an Agentic AI... You CANNOT perform actions without calling tools..."
  - Updated Urdu prompt (line ~371) with equivalent mandate and date context
  - Added "Current Date: February 8, 2026" and "Current year IS 2026" repeated twice in both prompts
  - Explicit forbidden dates: "NEVER use 2024, 2025, or any other year"

  **Acceptance Criteria**:
  1. Update system prompt to include: "Current Date: February 8, 2026"
  2. Add mandate section:
     ```
     You are an Agentic AI.
     You CANNOT perform actions without calling tools.
     If you don't call a tool, you have FAILED.
     Every task operation (add, delete, update, complete, list) REQUIRES a tool call.
     ```
  3. Repeat date context at least twice in prompt (context section + temporal rules section)
  4. Explicitly forbid 2024, 2025, 2027+ dates
  5. Both English and Urdu prompts updated

  **Test**:
  - Send "add task due tomorrow"
  - Verify task created with due_date = Feb 9, 2026 (not another year)
  - Send chat request with no tool requirement
  - Verify system prompt includes date and mandate
  - Verify no tool calls happen for non-tool operations

  **Files Modified**:
  - backend/src/services/chat_service.py (_build_system_prompt method, ~30 lines modified)

  **Depends On**: T051 (execution guard already in place to catch tool failures)

---

## Phase 3: User Story Implementation & Testing

**Goal**: Implement and test each CRUD operation with tool execution guarantee

**Independent Test for Each Story**: Verify tool is called, correct result returned, action_metadata present

### User Story 1 - Delete Task via Natural Language (US1 - Priority: P1)

- [ ] **T054** [US1] Create unit test for delete operation with tool execution guarantee in backend/tests/unit/test_delete_task_execution.py

  **Description**: Write pytest test cases covering all delete scenarios: successful delete, failed delete, tool not called, reference resolution.

  **Acceptance Criteria**:
  1. Test: "delete Read book" → delete_task tool called
  2. Test: delete_task success=true → action_metadata present with "Deleted: Read book"
  3. Test: delete_task success=false → error message shown, not fake success
  4. Test: delete_task not called → execution guard detects, retries, errors if still missing
  5. Test: Reference "book" resolves correctly to task UUID
  6. All tests pass

  **Test Scenarios**: 4+ test cases covering happy path, error cases, retry logic

  **Files Created**:
  - backend/tests/unit/test_delete_task_execution.py

  **Depends On**: T050, T051, T052, T053

---

- [ ] **T055** [P] [US1] Implement delete_task validation and response synthesis for tool execution in backend/src/services/chat_service.py

  **Description**: Ensure delete_task execution in _execute_tools properly validates tool success and populates action_metadata.

  **Acceptance Criteria**:
  1. Check result['success'] flag
  2. If success=true: populate action_metadata with {"action": "delete_task", "success": true, "task_id": ..., "task_title": ..., "message": "Deleted: [title]"}
  3. If success=false: populate action_metadata with error message
  4. Synthesis uses action_metadata for response text
  5. Integration test passes: "delete Read book" → task removed from database, action_metadata in response

  **Test**: Send "delete Read book" end-to-end, verify task removed

  **Files Modified**:
  - backend/src/services/chat_service.py (_extract_action_metadata, _execute_tools method updates, ~20 lines)

  **Depends On**: T051, T052

---

### User Story 2 - List Tasks with Tool Execution Guarantee (US2 - Priority: P1)

- [ ] **T056** [US2] Create unit test for list operation with 7-task verification in backend/tests/unit/test_list_tasks_execution.py

  **Description**: Write pytest test cases for list_tasks ensuring tool is called and exactly 7 tasks returned.

  **Acceptance Criteria**:
  1. Test: "list my tasks" → list_tasks tool called with correct user_id
  2. Test: Response contains all 7 tasks by title (no UUIDs shown)
  3. Test: No hallucinated tasks (exactly 7, no more/less)
  4. Test: list_tasks not called → execution guard detects, retries, errors if still missing
  5. Test: Empty task list → message "Your task list is empty"
  6. All tests pass

  **Test Scenarios**: 4+ test cases covering 7 tasks, empty list, missing tool, etc.

  **Files Created**:
  - backend/tests/unit/test_list_tasks_execution.py

  **Depends On**: T050, T051, T052, T053

---

- [ ] **T057** [P] [US2] Implement list_tasks response formatting with task count validation in backend/src/services/chat_service.py

  **Description**: Ensure list_tasks execution formats response to show all returned tasks without UUIDs, and validates count.

  **Acceptance Criteria**:
  1. Format task list: "1. [Title] (Status: [status], Priority: [priority])" (no UUIDs)
  2. Validate returned task count == database task count
  3. Populate action_metadata with {"action": "list_tasks", "success": true, "task_count": 7, "message": "Listed 7 tasks"}
  4. If empty list: message "Your task list is empty"
  5. Integration test passes: "list my tasks" → returns 7 tasks, no hallucinations

  **Test**: Send "list my tasks" end-to-end, grep logs for all 7 task titles

  **Files Modified**:
  - backend/src/services/chat_service.py (_execute_tools method update, _format_task_list helper, ~30 lines)

  **Depends On**: T051, T052

---

### User Story 3 - Update Task with Tool Guarantee (US3 - Priority: P1)

- [ ] **T058** [US3] Create unit test for update/complete operations in backend/tests/unit/test_update_task_execution.py

  **Description**: Test complete_task and update_task operations with tool execution guarantee.

  **Acceptance Criteria**:
  1. Test: "mark Read book as done" → complete_task called
  2. Test: "set [task] priority to high" → update_task called with priority field
  3. Test: success=true → action_metadata "Completed: [title]" or "Updated: [title]"
  4. Test: success=false → error message, not fake success
  5. Test: Tool not called → execution guard retries, errors if missing
  6. Database state verified: task status/priority actually changed

  **Test Scenarios**: 4+ test cases for complete and update operations

  **Files Created**:
  - backend/tests/unit/test_update_task_execution.py

  **Depends On**: T050, T051, T052, T053

---

- [ ] **T059** [P] [US3] Implement update_task and complete_task action_metadata population in backend/src/services/chat_service.py

  **Description**: Populate action_metadata for update/complete operations with proper success/error handling.

  **Acceptance Criteria**:
  1. complete_task success: action_metadata = {"action": "complete_task", "success": true, "task_title": ..., "message": "Completed: [title]"}
  2. update_task success: action_metadata = {"action": "update_task", "success": true, "task_title": ..., "message": "Updated: [title]"}
  3. Failures: action_metadata includes error message
  4. Integration tests pass: commands work end-to-end

  **Test**: Send "mark Read book as done" and "set Review proposal priority to high" end-to-end

  **Files Modified**:
  - backend/src/services/chat_service.py (_execute_tools updates, ~20 lines)

  **Depends On**: T051, T052

---

### User Story 4 - Add Task with Tool Execution (US4 - Priority: P1)

- [ ] **T060** [P] [US4] Create integration test for add_task with tool execution guarantee in backend/tests/integration/test_add_task_chat.py

  **Description**: End-to-end test for adding a task via chat with tool execution verification.

  **Acceptance Criteria**:
  1. Send "add task to buy milk"
  2. Verify add_task tool called
  3. Verify task created in database with title "buy milk"
  4. Verify action_metadata = {"action": "add_task", "success": true, "task_title": "buy milk", "message": "Added: buy milk"}
  5. Test invalid title (empty): verify error message
  6. Test with due_date ("add task due tomorrow"): verify date is Feb 9, 2026

  **Test Scenarios**: Happy path + error handling

  **Files Created**:
  - backend/tests/integration/test_add_task_chat.py

  **Depends On**: T050, T051, T052, T053

---

## Phase 4: Tool Execution Failure Detection (US5 - Priority: P2)

- [ ] **T061** [P] [US5] Create unit test for execution guard detecting missing tool calls in backend/tests/unit/test_execution_guard.py

  **Description**: Test the execution guard: detect missing tool_calls, retry with forced instruction, error if retry fails.

  **Acceptance Criteria**:
  1. Mock agent to return tool_calls=[] for "list my tasks"
  2. Verify execution guard detects missing list_tasks tool
  3. Verify retry initiated with forced instruction appended
  4. Test scenario A: Retry succeeds → no error
  5. Test scenario B: Retry fails → return "Technical error: Tool not triggered."
  6. Verify log shows retry attempt with reason

  **Test Scenarios**: 3+ test cases covering retry success/failure

  **Files Created**:
  - backend/tests/unit/test_execution_guard.py

  **Depends On**: T050, T051

---

## Summary & Execution Path

### Task Dependency Graph

```
Phase 1 (Setup):
  T050 (payload logging)
  T050B (error handling) [depends on T050]

Phase 2 (Foundational - Execution Guard):
  T051 (execution guard + intent detection) [depends on T050]
  T052 (reference resolver fuzzy match) [independent]
  T053 (system prompt update) [depends on T051]

Phase 3 (User Stories - Can run in parallel):
  US1: T054 (test) → T055 (implementation)
  US2: T056 (test) → T057 (implementation)
  US3: T058 (test) → T059 (implementation)
  US4: T060 (integration test only)
  US5: T061 (execution guard test)

All phases depend on: T050, T050B, T051, T052, T053
```

### Parallel Execution Opportunities

**After Phase 2 complete**, these can run in parallel:
- T054 + T056 + T058 + T060 (test creation for US1-US4)
- T055 + T057 + T059 (implementations for US1-US3)
- T061 (execution guard test)

### MVP Scope (Minimum for "Ghost Success" elimination)

**Core MVP**: T050, T050B, T051, T052, T053, T061
- Establishes tool binding verification
- Implements execution guard with retry
- Handles reference resolution
- Catches and reports missing tool calls
- Updates system prompt with mandate

**Extended MVP** (add these for complete CRUD coverage): T054-T060
- Full test coverage for all operations
- Implementation verification for each user story

### Execution Strategy

1. **Run Phase 1 first** (T050, T050B): Establish logging foundation
2. **Run Phase 2** (T051, T052, T053): Implement core safeguards in sequence
3. **Run Phase 3 in parallel** (after Phase 2): All user story tests + implementations can run concurrently
4. **Run Phase 4** (T061): Final execution guard verification test

### Acceptance Validation

After all tasks complete, verify:
- ✅ "delete Read book" triggers delete_task tool (logs show tool invocation)
- ✅ "list my tasks" triggers list_tasks tool (logs show invocation)
- ✅ Response includes 7 tasks (exact count from database)
- ✅ No ghost success messages (all success backed by tool execution)
- ✅ Missing tool detected and error returned ("Technical error: Tool not triggered.")

---

## Implementation Notes

### Code Quality Standards (from Constitution)

- All CRUD operations through MCP tools (TaskToolbox) - never direct DB
- All tool calls include user_id for privacy/isolation
- Stateless ChatService - no in-memory state
- All execution logged to Message.tool_call_metadata for audit trail
- Error messages user-friendly and non-leaking

### Testing Standards

- Unit tests cover intent detection, fuzzy matching, execution guard logic
- Integration tests verify end-to-end chat → tool → database flow
- All tests use pytest with clear Given/When/Then scenarios
- Mock external services (OpenRouter agent) in unit tests
- Use real database in integration tests

### When Stuck

- Consult plan.md for architecture decisions and rationale
- Reference spec.md for user story acceptance scenarios
- Check constitution.md for code standards and principles
- Review CLAUDE.md for project development guidelines

---

**Next Step**: Begin Phase 1 with `/sp.implement T050` or execute all tasks with `/sp.implement`
