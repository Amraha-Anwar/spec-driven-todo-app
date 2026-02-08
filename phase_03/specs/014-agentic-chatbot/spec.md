# Feature Specification: Phase III Agentic Chatbot with MCP Tools

**Feature Branch**: `014-agentic-chatbot`
**Created**: 2026-02-08
**Status**: Updated 2026-02-08
**Input**: Enable persistent task management using MCP Tools and Sub-Agents. The AI must use the 'TaskToolbox' Skill to execute all CRUD operations. Use a 'RomanUrduHandler' Sub-Agent to map Roman Urdu intents to tool parameters. Every successful tool execution MUST be followed by a 'session.commit()' to Neon DB. History must be re-hydrated in the UI from the 'Message' table on page refresh. **Critical Constraint**: PHRs and specs must be inside phase_03 directory not outside.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Task Creation via Natural Language (Priority: P1)

User opens the chat interface and types a task creation command in English (e.g., "Add a task to buy groceries tomorrow") or Roman Urdu (e.g., "Mera task add kardo: buy milk"). The AI agent interprets the command, extracts task details (title, priority, due date), executes an MCP tool call to add the task to the database, and confirms completion with a friendly message. The task immediately appears in the Task List UI without page refresh.

**Why this priority**: Core MVP feature that demonstrates the agentic pattern and validates bidirectional integration between chat and task management.

**Independent Test**: Can be fully tested by sending a natural language task creation command and verifying: (1) database contains new task, (2) confirmation message appears in chat, (3) Task List UI updates instantly.

**Acceptance Scenarios**:

1. **Given** user is in the chat interface, **When** user types "Add task: buy groceries by Friday", **Then** task appears in database and Task List shows "buy groceries" with due date set to Friday
2. **Given** user types in Roman Urdu "Mera task add kardo: doctor appointment", **When** message is submitted, **Then** assistant confirms in both languages and task is persisted
3. **Given** task title is empty or whitespace, **When** user submits, **Then** assistant asks for clarification without creating a task

---

### User Story 2 - Task Completion via Chat (Priority: P1)

User types a completion command (e.g., "Mark buy groceries as done", "Complete the bread task", or "Bread wala task complete kardo") and the chat interface updates the task status in the database, immediately reflects the change in the Task List, and provides a warm confirmation with encouragement.

**Why this priority**: Core feature that validates MCP tool execution for update operations, demonstrates real-time synchronization, and tests ambiguous reference resolution (e.g., "Dusra wala done karo").

**Independent Test**: Can be fully tested by marking a task complete via chat and verifying: (1) task status changes in database, (2) confirmation appears in chat with warm personality, (3) Task List UI shows task as completed, (4) ambiguous references are correctly resolved.

**Key Features**:
- Support explicit task references: "Mark buy groceries as done"
- Support fuzzy/title-based references: "Complete the bread task"
- Support ambiguous Urdu references: "Dusra wala done karo" (Complete the second one)
- Proactive follow-ups after completion: "Nice work! Want to create another task?"

**Acceptance Scenarios**:

1. **Given** task "buy groceries" exists and is incomplete, **When** user types "Mark buy groceries as done", **Then** task status becomes "completed" in database and assistant confirms: "Done! Task marked as complete! ✅ Nice work! Want to create another task?"
2. **Given** user types in Roman Urdu "Bread wala task complete kardo", **When** message is submitted, **Then** task with "bread" in title is marked complete and confirmation appears: "Perfect! Task complete mark ho gaya! 🎉"
3. **Given** task ID is invalid or task doesn't exist, **When** user tries to mark it complete, **Then** assistant explains the issue and suggests existing tasks
4. **Given** user has multiple tasks and types "Dusra wala done karo" (complete the second one), **When** submitted, **Then** assistant identifies the second task by creation order and marks it complete, confirming which task was completed

---

### User Story 3 - Task Deletion via Chat (Priority: P1)

User types a deletion command (e.g., "Delete task: old project", "Remove the third task", or "Task 3 delete karo") and the chat interface triggers an MCP tool to remove the task from the database, confirms the action with a warm acknowledgment, and the Task List updates instantly.

**Why this priority**: Core CRUD feature completing the basic operations set; validates destructive operations safety and ambiguous reference handling.

**Independent Test**: Can be fully tested by deleting a task via chat and verifying: (1) task is removed from database, (2) confirmation appears in chat with personality, (3) Task List no longer shows the task, (4) ambiguous references correctly identify which task to delete.

**Key Features**:
- Support explicit task references: "Delete task: old project"
- Support numeric/positional references: "Delete the third task" or "Task 3 delete karo"
- Support fuzzy/title-based references: "Delete the old project"
- Support ambiguous Urdu references: "Purana wala delete kardo" (Delete the old one)
- Proactive confirmation before deletion of important tasks

**Acceptance Scenarios**:

1. **Given** task "old project" exists, **When** user types "Delete task: old project", **Then** task is removed from database and Task List, assistant confirms: "Perfect! Task delete ho gaya! ✅"
2. **Given** user has 5 tasks and types "Task 3 delete karo", **When** submitted, **Then** task at position 3 is correctly deleted and assistant confirms which task was removed
3. **Given** user types in Roman Urdu "Mera task delete kardo: old project", **When** submitted, **Then** assistant confirms deletion in Roman Urdu: "Bilkul! Task delete ho gaya! ✅ Agla task ke liye mujhe aage help deni hai?"
4. **Given** user attempts to delete a non-existent task, **When** user submits command, **Then** assistant politely explains the task wasn't found and suggests existing tasks

---

### User Story 4 - Task Update via Chat (Priority: P2)

User types an update command (e.g., "Update buy groceries: set priority to high", "Add description to bread task", or "Mera task update kardo: change due date to tomorrow") and the chat interface triggers an MCP tool to update specific task fields, confirms the change with specific details, and the Task List reflects the update.

**Why this priority**: Important feature for task management workflow; extends basic CRUD with attribute modification and demonstrates the proactive personality asking for missing details when tasks are created.

**Independent Test**: Can be fully tested by updating a task attribute via chat and verifying: (1) specific field changes in database, (2) confirmation appears in chat with personality, (3) Task List shows updated information, (4) assistant proactively asks for additional details if not provided.

**Key Features**:
- Support updating priority: "Set priority to high"
- Support updating due date: "Change due date to tomorrow"
- Support adding description: "Add description: buy organic milk"
- Support fuzzy reference resolution: "Update the bread task"
- Proactive follow-ups: After task creation, ask if user wants to add priority/due date/description

**Acceptance Scenarios**:

1. **Given** task "buy groceries" exists, **When** user types "Update buy groceries: priority high", **Then** task priority field is updated in database and assistant confirms: "Perfect! I've updated your task! ✅ Is there anything else you'd like to adjust?"
2. **Given** user types in Roman Urdu "Mera task update kardo: change title", **When** new title is provided, **Then** task title changes in database and assistant confirms in Roman Urdu
3. **Given** user creates a task without priority/due date, **When** task is created, **Then** assistant proactively asks: "Would you like to set a priority level (low/medium/high) or add a due date?" before asking for next action
4. **Given** user provides invalid update syntax, **When** user submits, **Then** assistant asks for clarification with example format: "To update a task, try: 'Update [task name]: [field] [value]'"

---

### User Story 5 - View Tasks via Chat (Priority: P2)

User types a query (e.g., "Show all my tasks" or "Mera tasks dikhao") and the chat interface retrieves tasks from the database and displays them in a readable format with current status, priority, and due dates.

**Why this priority**: Important for user awareness and task review; validates read operations without side effects.

**Independent Test**: Can be fully tested by querying tasks via chat and verifying: (1) database is queried, (2) assistant displays all tasks with accurate information, (3) display is human-readable and organized.

**Acceptance Scenarios**:

1. **Given** user has 3 tasks in database, **When** user types "Show all my tasks", **Then** assistant displays all 3 tasks with title, status, and priority
2. **Given** user types in Roman Urdu "Mera tasks dikhao", **When** submitted, **Then** assistant lists tasks in a formatted response
3. **Given** user has no tasks, **When** user asks to view tasks, **Then** assistant politely indicates the task list is empty

---

### User Story 6 - Multi-Turn Conversation with Context (Priority: P2)

User engages in multi-turn conversation where the assistant retrieves the last 10 messages from the database before each LLM turn, maintains conversation context, and correctly handles follow-up commands that reference previous messages (e.g., "Complete the first one").

**Why this priority**: Validates stateless architecture with context retrieval; important for natural conversation flow.

**Independent Test**: Can be fully tested by engaging in a 3+ message exchange and verifying: (1) previous messages are retrieved from database, (2) assistant understands context across turns, (3) follow-up commands that reference earlier messages work correctly.

**Acceptance Scenarios**:

1. **Given** conversation has 5 previous messages, **When** user types "Complete the first task I mentioned", **Then** assistant correctly identifies and completes the referenced task
2. **Given** LLM processes messages, **When** database is queried, **Then** exactly last 10 messages are retrieved
3. **Given** conversation spans multiple tool executions, **When** user provides follow-up command, **Then** assistant maintains context and executes correctly

### Edge Cases & Clarifications

**Ambiguous Task References (Clarification Session 2026-02-08)**:
- When user provides ambiguous Urdu reference (e.g., "Purana wala delete kardo" = Delete the old one), use two-tier resolution:
  1. **Direct Match**: Look for explicit task titles in conversation history (last 10 messages)
  2. **Contextual Match**: If exactly one task matches temporal context ("old", "previous", "first"), auto-select; if multiple match, ask user: "I found 3 old tasks. Which one: [list with creation dates]?"
- This applies to English ambiguous references too (e.g., "Complete the one I mentioned earlier")

**Other Edge Cases**:
- What happens when a task title contains special characters or emoji? → System accepts and preserves them; special chars do not trigger SQL injection (use parameterized queries)
- How does the system handle database connection failures during message persistence? → Return 503 Service Unavailable; queue message for retry; user sees friendly error
- What occurs when the last 10 messages query returns fewer than 10 messages (early conversation)? → Agent uses all available messages (fewer than 10) as context; gracefully degrades
- What happens when a user rapidly submits multiple commands in succession? → Each request is processed independently; no rate limiting in MVP (implemented in Phase 2)
- How are Roman Urdu and English mixed-language inputs processed? → Agent handles both naturally via system prompt; RomanUrduHandler processes Urdu-specific patterns only; English falls through to main agent
- What is the behavior when an MCP tool call fails (e.g., database constraint violation)? → Tool returns error; agent rephrases error in friendly language; assistant asks user for clarification (e.g., "Task title already exists; please choose a different name")

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: Chat interface MUST accept user input in English and Roman Urdu
- **FR-002**: System MUST execute ALL CRUD operations exclusively through the 'TaskToolbox' Skill (add, delete, update, view tasks in Neon database); `complete_task`, `delete_task`, and `update_task` tools MUST be fully implemented and bound with `tool_choice='auto'`
- **FR-003**: System MUST use the 'RomanUrduHandler' Sub-Agent to parse Roman Urdu user intents and map them to TaskToolbox tool parameters
- **FR-004**: System MUST invoke 'session.commit()' to Neon DB immediately after every successful MCP tool execution for persistent state management
- **FR-005**: System MUST retrieve the last 10 messages from the 'Message' table before each LLM processing turn
- **FR-006**: System MUST persist both user and assistant messages to the 'Message' table with timestamps
- **FR-007**: System MUST re-hydrate conversation history in the UI from the 'Message' table on page refresh without data loss
- **FR-008**: System MUST use the OpenAI Agents SDK for interpreting user intent and executing tasks via MCP sub-agents with two-turn response synthesis (first turn: execute tools, second turn: synthesize confirmations)
- **FR-009**: Assistant MUST provide a warm, friendly confirmation message with personality ONLY after a successful DB commit (not before); confirmations MUST never be empty and MUST include proactive follow-ups asking about missing details (priority, due date, description)
- **FR-010**: Tasks created or modified via chat MUST appear in the Task List UI without requiring a page refresh
- **FR-011**: System MUST support task operations with proactive personality: create with optional title/description/priority/due date, mark complete, delete, update, and view; after task creation, MUST proactively ask for missing details
- **FR-012**: System MUST handle Roman Urdu commands (e.g., "Mera task add kardo", "Mera task delete kardo", "Bread wala task complete kardo") using RomanUrduHandler sub-agent for parsing and mapping to English operations; responses MUST be in Roman Urdu when user input is in Roman Urdu
- **FR-013**: System MUST maintain conversation context across multiple user turns in a single session with accurate ambiguous reference resolution
- **FR-014**: System MUST gracefully handle ambiguous task references with two-tier resolution: (1) Direct match on task titles in conversation history (last 10 messages), (2) Contextual match on positional/temporal keywords ("first", "last", "second", "old", "new", "purana", "dusra"); if multiple matches found, ask user with list; if single match, auto-select and confirm which task was referenced
- **FR-015**: User isolation MUST be enforced: user_a cannot access user_b's conversation history, tasks, or messages (validated at JWT, database, and MCP tool layers)
- **FR-016**: System MUST use four specialized MCP-based sub-agents for maximum reusability: TaskToolbox (CRUD), ContextManager (history), RomanUrduHandler (language), ChatKit-Integrator (frontend bridge)
- **FR-017**: System MUST ensure assistant_message in ChatResponseSchema is NEVER empty; fallback confirmations MUST be provided in both English and Roman Urdu based on user's language preference

### Key Entities

- **Message**: Represents a single user or assistant message in the conversation. Attributes: id, user_id, role (user/assistant), content, timestamp, session_id
- **Task**: Represents a task created by the user. Attributes: id, user_id, title, description, status (pending/completed), priority (low/medium/high), due_date, created_at, updated_at
- **Chat Session**: Represents an active chat conversation session. Attributes: id, user_id, created_at, last_activity, context_token_count

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: User can create a task via natural language command and see it in the Task List UI within 2 seconds
- **SC-002**: User can complete, delete, or update a task via chat and see the change reflected in the Task List UI within 2 seconds
- **SC-003**: Assistant correctly interprets and executes at least 95% of English commands without requiring clarification
- **SC-004**: Assistant correctly interprets and executes at least 90% of Roman Urdu commands without requiring clarification
- **SC-005**: System retrieves and persists conversation history with zero data loss in normal operation
- **SC-006**: Multi-turn conversations maintain accurate context across 10+ message exchanges
- **SC-007**: User experiences no broken link between chat actions and Task List updates (100% consistency)
- **SC-008**: System responds to user commands within 3 seconds including database round-trip
- **SC-009**: All message persistence operations complete successfully with no orphaned or duplicate messages
- **SC-010**: Roman Urdu language support covers core task operations (add, delete, complete, update, view)
- **SC-011**: ALL task CRUD operations are executed exclusively through TaskToolbox Skill (zero direct database calls from agent)
- **SC-012**: ALL Roman Urdu intent parsing routes through RomanUrduHandler Sub-Agent before tool invocation
- **SC-013**: Confirmation messages appear in chat ONLY after successful session.commit() to Neon DB (no premature confirmations)
- **SC-014**: Page refresh restores complete conversation history from 'Message' table with 100% fidelity
- **SC-015**: Zero task or message data loss after browser refresh or session timeout
- **SC-016**: All PHRs and specifications are stored within phase_03 directory hierarchy
- **SC-017**: `complete_task` MCP tool MUST be fully implemented and automatically invoked when user requests task completion (e.g., "Mark task as done" or "Bread wala task complete kardo")
- **SC-018**: `delete_task` MCP tool MUST be fully implemented and automatically invoked when user requests task deletion (e.g., "Delete task: old project" or "Task 3 delete karo")
- **SC-019**: `update_task` MCP tool MUST be fully implemented and automatically invoked for task attribute updates (priority, due_date, description, status)
- **SC-020**: Ambiguous task references MUST be resolved correctly with 95%+ accuracy (e.g., "Complete the first one" or "Dusra wala done karo")
- **SC-021**: Assistant responses MUST NEVER be empty after tool execution; fallback confirmations with proactive follow-ups MUST be present
- **SC-022**: After task creation, assistant MUST proactively ask about missing details (priority, due date, description) before asking for next action
- **SC-023**: Confirmation messages MUST follow storyteller format with warm, friendly tone and emojis (🎉, ✅, 📝, etc.)
- **SC-024**: When user input is in Roman Urdu, all confirmation messages MUST be in Roman Urdu (e.g., "Task complete ho gaya! 🎉" not "Task completed! 🎉")
- **SC-025**: Database records MUST persist correctly when user says "Task 3 delete karo" - the correct record is removed from Neon DB
- **SC-026**: Database records MUST persist correctly when user says "Bread wala task complete kardo" - the correct task's status is updated to 'completed' in Neon DB

## Clarifications (Session 2026-02-08)

### User-Provided Clarifications & Decisions

1. **Q: How will you ensure the agent handles ambiguous Urdu commands like "Purana wala delete kardo"?**
   - **A**: Use two-tier resolution: (1) Direct match on task titles in history; (2) Contextual match on temporal keywords ("old", "previous"); if multiple matches, ask user with list
   - **Impact**: FR-011 updated to include contextual reference handling; Edge Cases section expanded

2. **Q: Will you use the official MCP Python SDK to wrap the task operations?**
   - **A**: YES - Use Official MCP Python SDK from modelcontextprotocol/python-sdk for type-safe tool definitions and seamless Agents SDK integration
   - **Impact**: FR-002 and FR-013 updated to explicitly specify MCP Python SDK

3. **Q: How will you handle session isolation to ensure user_a cannot see user_b's conversation history?**
   - **A**: Multi-layered isolation: (1) JWT token validation (user_id ≠ JWT sub → reject); (2) Database queries always include WHERE user_id filter; (3) MCP tools validate user_id; (4) Return 404 (not 403) on unauthorized access to prevent data leakage
   - **Impact**: FR-012 added; new integration test requirement for cross-user access validation

4. **Q: Confirm you will use specialized Sub-agents, Skills to maximize 'Reusable Intelligence' bonus points.**
   - **A**: CONFIRMED - Implement 4 MCP-based sub-agents: TaskToolbox, ContextManager, RomanUrduHandler, ChatKit-Integrator. Each independently testable, deployable, reusable in Phase IV features
   - **Impact**: FR-013 added; architecture reinforces sub-agent independence for reusability

## Assumptions

1. **Neon Database Access**: A Neon PostgreSQL database is available and accessible with appropriate credentials via environment variables
2. **OpenAI API Key**: OpenAI API key is available for the Agents SDK
3. **User Authentication**: User identity is established via JWT tokens or session management (details in integration layer); JWT token MUST contain `sub` claim with user_id
4. **Database Schema**: The 'tasks' and 'messages' tables already exist with appropriate schema
5. **Real-time UI Updates**: WebSocket or polling mechanism exists between frontend and backend for instant Task List updates
6. **Roman Urdu Processing**: Roman Urdu patterns are mappable to English operations (no dialect variations handled); support for ambiguous contextual references like "Purana wala"
7. **Task Ownership**: Tasks are scoped to individual users; no multi-user task sharing in Phase III
8. **MCP SDK Availability**: Official MCP Python SDK is available and compatible with OpenAI Agents SDK
9. **User Isolation**: Database supports parameterized queries to prevent SQL injection; MCP tools can validate user_id independently
10. **TaskToolbox Skill**: TaskToolbox Skill is available as an MCP server with standard CRUD operations (create_task, delete_task, update_task, view_tasks, complete_task)
11. **RomanUrduHandler Sub-Agent**: RomanUrduHandler Sub-Agent is available and can parse Roman Urdu intents to structured parameters (operation, title, priority, due_date, etc.)
12. **Session Commit Mechanism**: Neon DB client supports explicit 'session.commit()' calls for synchronous transaction finalization
13. **PHR and Spec Storage**: All Prompt History Records and specification documents MUST be stored within the phase_03 directory structure, never in parent directories

## Constraints & Non-Goals

**In Scope**:
- Chat-driven task CRUD operations
- English and Roman Urdu language support
- Stateless server architecture with context retrieval
- MCP tool integration for database operations
- Real-time UI synchronization

**Out of Scope**:
- Complex task dependencies or subtasks
- Task sharing or collaboration features
- Advanced scheduling or recurring tasks
- File attachments or rich media in tasks
- Voice input or speech-to-text
- Mobile app (web-only in Phase III)
- Advanced analytics or reporting
- Offline mode or local-first storage

**Non-Goals**:
- Replace existing task UI (complement it)
- Support all world languages (English + Roman Urdu only)
- Implement autonomous agent decision-making beyond interpreted commands

**Critical Constraint - Documentation Storage**:
- All Prompt History Records (PHRs) MUST be stored within `phase_03/history/prompts/` directory
- All feature specifications MUST be stored within `phase_03/specs/` directory
- NO documentation or artifacts may be created in parent directories
- This ensures clean separation between phase_02 and phase_03 implementations
