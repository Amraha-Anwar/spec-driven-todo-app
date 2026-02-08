# Feature Specification: Force Explicit Tool Execution & Eliminate Ghost Success

**Feature Branch**: `015-force-explicit-tool`
**Created**: 2026-02-08
**Status**: Draft
**Input**: Eliminate "Ghost Success" and force explicit tool execution for CRUD operations. Requirements: Agent forbidden from synthesizing success without tool_output containing "success": true; ChatService catches None tool_calls and returns error; Date synchronized to 2026; Agent uses titles, ChatService maps to UUIDs. Acceptance: "delete Read book" triggers delete_task tool; "list my tasks" triggers list_tasks tool and returns 7 tasks.

---

## User Scenarios & Testing

### User Story 1 - Delete Task via Natural Language (Priority: P1)

When a user wants to remove a task, they should be able to say "delete Read book" or similar natural language, and the system must actually invoke the delete_task tool. This is the most critical operation because users need confidence that their destructive action (deletion) is real and logged.

**Why this priority**: Task deletion is a destructive operation that requires explicit tool invocation for safety and auditability. "Ghost success" (claiming deletion succeeded when no tool ran) erodes trust and can cause data consistency issues.

**Independent Test**: "Can be fully tested by sending 'delete Read book' message and verifying delete_task tool appears in execution logs with correct task UUID."

**Acceptance Scenarios**:

1. **Given** user has task "Read book" in database, **When** user says "delete Read book", **Then** delete_task tool is invoked with correct UUID and task is removed from database
2. **Given** user says "delete Read book", **When** system executes, **Then** assistant response does NOT claim success unless tool executed and returned success=true
3. **Given** delete_task tool returns success=true, **When** assistant response is synthesized, **Then** it confirms "Deleted: Read book" with action_metadata present
4. **Given** delete_task tool fails with error, **When** assistant response is built, **Then** it shows error message, NOT success message

---

### User Story 2 - List Tasks with Tool Execution Guarantee (Priority: P1)

When a user asks to see their tasks ("list my tasks", "show my tasks", etc.), the system must invoke the list_tasks tool explicitly and return the actual task list from the database. The agent should never respond with a fake/hallucinated list.

**Why this priority**: Listing is foundational to all task workflows. Users rely on the list to see current state. If the LLM hallucinates a list without calling the tool, users lose trust. This is equally critical to deletion.

**Independent Test**: "Can be fully tested by sending 'list my tasks' and verifying list_tasks tool executes, returns 7 tasks from debug logs, and assistant response shows only those 7 tasks (no hallucinations)."

**Acceptance Scenarios**:

1. **Given** user says "list my tasks" or "show my tasks", **When** agent processes request, **Then** list_tasks tool is invoked with user_id and status_filter
2. **Given** list_tasks returns 7 tasks in correct format, **When** assistant response is built, **Then** it shows all 7 tasks by title only (no UUIDs)
3. **Given** agent could hallucinate response without calling tool, **When** explicit tool execution is required, **Then** agent is forced to call list_tasks before responding
4. **Given** tool execution fails or returns empty list, **When** assistant responds, **Then** it accurately reflects that state (e.g., "Your task list is empty")

---

### User Story 3 - Update Task with Tool Guarantee (Priority: P1)

When user updates a task ("mark Read book as done", "set Review proposal priority to high"), the system must invoke the appropriate tool (complete_task or update_task) and not claim success unless the tool returns success=true.

**Why this priority**: Updates are frequent operations. Claiming success without execution causes data inconsistency. Users expect changes to persist.

**Independent Test**: "Can be fully tested by saying 'mark Read book as done' and verifying complete_task tool executes with correct UUID, task status changes to 'completed' in database."

**Acceptance Scenarios**:

1. **Given** user says "mark [task] as done", **When** system executes, **Then** complete_task tool is invoked with correct task UUID
2. **Given** user says "set [task] priority to [level]", **When** system executes, **Then** update_task tool is invoked with correct fields
3. **Given** tool execution returns success=true, **When** response is synthesized, **Then** confirmation message includes task title and action (e.g., "Marked Read book as done")
4. **Given** tool execution returns success=false, **When** response is built, **Then** error message is shown with reason for failure

---

### User Story 4 - Add Task with Tool Execution (Priority: P1)

When user creates a task ("add a task to buy milk", "create a reminder to call mom"), the system must invoke add_task tool and only report success if tool execution succeeds.

**Why this priority**: Task creation is a fundamental workflow. Must guarantee tool execution and actual database persistence.

**Independent Test**: "Can be fully tested by saying 'add task to buy milk' and verifying add_task tool executes, task appears in database with correct title."

**Acceptance Scenarios**:

1. **Given** user says "add [description]", **When** agent processes request, **Then** add_task tool is invoked with parsed title/description/priority/due_date
2. **Given** add_task succeeds and returns task with UUID, **When** response is built, **Then** assistant confirms "Added: [title]" with action_metadata
3. **Given** add_task fails (e.g., title invalid), **When** response is built, **Then** error message explains why (e.g., "Title cannot be empty")

---

### User Story 5 - Detect & Report Tool Execution Failures (Priority: P2)

If the LLM/agent fails to invoke a required tool (returns None for tool_calls), the ChatService must detect this and return a specific technical error instead of proceeding with synthesis.

**Why this priority**: Safety mechanism to catch agent failures. Prevents silent failures where user request is ignored.

**Independent Test**: "Can be tested by mocking agent to return None tool_calls and verifying ChatService catches it and returns 'Technical error: Tool not triggered.' error."

**Acceptance Scenarios**:

1. **Given** agent receives a task operation request, **When** agent returns None or empty tool_calls, **Then** ChatService returns error "Technical error: Tool not triggered."
2. **Given** "delete Read book" command, **When** agent fails to call delete_task, **Then** user sees error, NOT fake success message
3. **Given** "list my tasks" command, **When** agent fails to call list_tasks, **Then** user sees error, NOT hallucinated task list

---

### User Story 6 - Correct Date Context Prevents Hallucinations (Priority: P2)

The system must explicitly and repeatedly state the year is 2026 in the system prompt to prevent the agent from hallucinating past dates (2024, 2025) or future dates beyond 2026.

**Why this priority**: Temporal hallucinations cause incorrect due dates to be set. Repetition in system prompt is a known technique to reduce this issue.

**Independent Test**: "Can be tested by requesting task with 'tomorrow' and verifying due_date is Feb 9, 2026, not Feb 9 of another year. Can be tested by checking system prompt explicitly mentions 'TODAY IS 2026' multiple times."

**Acceptance Scenarios**:

1. **Given** system prompt is built, **When** it is sent to agent, **Then** prompt explicitly states "TODAY IS SUNDAY, FEBRUARY 8, 2026" at least twice (context and temporal rules)
2. **Given** user says "add task due tomorrow", **When** task is created, **Then** due_date is Feb 9, 2026, not Feb 9, 2025 or 2027
3. **Given** user says "add task due next Monday", **When** task is created, **Then** due_date is Feb 10, 2026 (not any other year)
4. **Given** system context includes forbidden dates rule, **When** agent processes date, **Then** agent never creates task with 2024, 2025, 2027+ dates

---

### User Story 7 - Agent Uses Task Titles, System Maps to UUIDs (Priority: P2)

The agent should interact with tasks by title only (e.g., "Read book", "Call mom"). The ChatService should transparently map these titles to internal UUIDs using ReferenceResolver. The agent never sees UUIDs in system prompt or responses.

**Why this priority**: Clean user experience. Simplifies agent reasoning (works with human-readable names). UUID mapping is hidden implementation detail.

**Independent Test**: "Can be tested by sending 'delete Read book' where agent response contains only 'Read book' (no UUID), but backend logs show UUID was resolved and used."

**Acceptance Scenarios**:

1. **Given** user says "delete Read book", **When** agent processes request, **Then** agent reason about "Read book" by title only (system prompt does not expose UUID)
2. **Given** system prompt includes task list, **When** list is formatted, **Then** each task shows numbered position and title only (e.g., "1. Read book, 2. Call mom")
3. **Given** agent resolves reference to "Read book", **When** ChatService receives task name, **Then** ReferenceResolver maps it to UUID internally
4. **Given** task operation completes, **When** assistant response is shown to user, **Then** response uses only task title (no UUID), but action_metadata contains UUID for frontend

---

### Edge Cases

- **What happens when user says "delete book" but multiple tasks contain "book"?** System should attempt fuzzy matching and either ask for clarification or pick the best match. If ambiguous, tool execution may fail and error is returned.
- **What happens when user says "list tasks" but agent doesn't call list_tasks tool?** ChatService detects missing tool and returns "Technical error: Tool not triggered."
- **What happens when user creates task with due date "2025-12-31"?** System should reject this as forbidden past date and return error, or silently convert to 2026 equivalent.
- **What happens when user says "add task" with no title?** add_task tool validation fails, returns error, assistant reports error (not fake success).
- **What happens when task operation succeeds but action_metadata extraction fails?** System still returns successful operation response with action_metadata=None (graceful degradation).
- **What happens when agent synthesizes response about a task operation without tool execution?** ChatService catches this during validation and either rejects or forces tool re-execution.

---

## Requirements

### Functional Requirements

**FR-001**: The ChatService MUST catch tool_calls that are None or empty list and return error "Technical error: Tool not triggered." instead of proceeding to synthesis.

**FR-002**: The system MUST validate that every CRUD operation (create, read, update, delete task) results in an explicit tool_call before allowing assistant synthesis.

**FR-003**: The agent MUST NOT synthesize a "success" message unless the executed tool returns success=true in its result.

**FR-004**: The assistant response MUST contain action_metadata field with: action (tool name), success (boolean), task_id (UUID), task_title (string), message (user-friendly string).

**FR-005**: When a CRUD operation tool fails (returns success=false), the assistant MUST report the error message from the tool, not a generic success message.

**FR-006**: The system prompt MUST explicitly state the current date (2026-02-08) and year (2026) at least twice to prevent temporal hallucinations.

**FR-007**: The system prompt MUST include a forbidden dates rule explicitly forbidding 2024, 2025, and any year after 2026 for task due dates.

**FR-008**: The system prompt MUST format the task list without exposing UUIDs. Use format: "1. [Title] (Status: [status], Priority: [priority])" instead of "ID [UUID]: [Title]".

**FR-009**: The agent MUST interact with tasks using titles only in system prompt and agent reasoning. UUIDs are internal to ChatService and ReferenceResolver only.

**FR-010**: The ReferenceResolver MUST map task titles/names to UUIDs internally so agent never directly handles UUID strings in prompts.

**FR-011**: Task toolbox methods (delete_task, update_task, complete_task) MUST accept both UUID strings and task names, with automatic resolution of names to UUIDs.

**FR-012**: The ChatService MUST track execution of each tool and record which tools were called, with which arguments, and what results were returned.

**FR-013**: If a tool is expected but not called (based on user intent), the system MUST detect this and report "Technical error: Tool not triggered." with details about which tool was expected.

**FR-014**: The assistant response MUST include a tool_calls array showing all executed tools (name, arguments), separate from action_metadata.

**FR-015**: System MUST provide clear error messages when tool execution fails, including why the operation failed (e.g., "Task not found", "Invalid priority value").

### Key Entities

- **Task**: Represents a user's todo item with id (UUID), title, description, status (pending/completed), priority (low/medium/high), due_date, created_at
- **Tool Call**: Represents an invocation of a MCP tool with name, arguments, and result
- **Tool Result**: Represents the outcome of tool execution with success (boolean), data (optional task details), error (optional error message)
- **Action Metadata**: Represents user-facing notification data with action (tool name), success, task_id, task_title, message

---

## Success Criteria

### Measurable Outcomes

**SC-001**: User can execute "delete [task name]" and verify in logs that delete_task tool was explicitly called (not just claimed by agent).

**SC-002**: User can execute "list my tasks" and verify that exactly 7 tasks appear in response (matching database), with no hallucinated tasks.

**SC-003**: User can create 5 tasks with various due dates ("tomorrow", "next week", "2026-02-10") and verify all are set to 2026 (not 2024/2025).

**SC-004**: 100% of CRUD operations that succeed return action_metadata with correct task_id, task_title, and action name in API response.

**SC-005**: 100% of failed CRUD operations (tool returns success=false) report error message to user, with zero instances of "Ghost success" (claiming success when tool failed).

**SC-006**: 100% of agent requests for task operations result in explicit tool_calls visible in logs (zero silent failures where agent skips calling required tool).

**SC-007**: If agent fails to invoke a required tool, user receives "Technical error: Tool not triggered." within 2 seconds instead of hallucinated response.

**SC-008**: System prompt contains no exposed UUIDs in task list (verify regex: no UUID patterns in the task list section).

**SC-009**: Assistant responses reference tasks only by title (e.g., "Deleted: Read book"), never by UUID, for 100% of task operations.

**SC-010**: Regression test: zero instances of dates set to 2024 or 2025 in any new task created after this feature is deployed.

---

## Assumptions

- ReferenceResolver already exists and can map task titles to UUIDs (confirmed from prior implementation)
- TaskToolbox already has delete_task, update_task, complete_task, add_task, list_tasks methods (confirmed from prior implementation)
- OpenRouter agent is being used with tool_choice='auto' to trigger tool calls
- Dates are handled as ISO format strings (YYYY-MM-DD) in API contracts
- UUIDs are already in use as primary keys in Task model (confirmed from prior schema)
- ChatService already has logging/debug capabilities to track tool execution
- Frontend can parse action_metadata from response and show toaster notifications

---

## Constraints & Boundaries

**In Scope**:
- Validating tool execution in ChatService before synthesis
- Preventing ghost success messages
- Detecting missing tool calls
- Enhanced system prompt with date context and UUID-free task list
- action_metadata field in all responses
- Error reporting for failed operations
- Clear error for missed tool invocation

**Out of Scope**:
- Changes to ReferenceResolver (use existing as-is)
- Changes to TaskToolbox CRUD methods (use existing as-is)
- Agent model selection or hyperparameter tuning (use current model)
- Frontend toast notification UI (assume frontend can consume action_metadata)
- Database schema changes (use existing Task model)
- Multi-user concurrency or race conditions beyond current implementation

---

## Open Questions / Clarifications

None - all requirements are explicit from user input. Feature is well-defined with clear acceptance criteria.
