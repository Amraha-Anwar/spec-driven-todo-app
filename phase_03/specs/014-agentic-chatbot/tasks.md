# Implementation Tasks: Phase III Agentic Chatbot

**Feature**: 014-agentic-chatbot | **Branch**: `014-agentic-chatbot`
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)
**Status**: Ready for Red-Green-Refactor Implementation
**Last Updated**: 2026-02-08

---

## Implementation Strategy

**Scope**: Phase III MVP with persistent task management using MCP Tools and Sub-Agents.

**User Stories** (Priority Order):
- **P1**: US1 (Create), US2 (Complete), US3 (Delete) - Core CRUD foundation
- **P2**: US4 (Update), US5 (View), US6 (Multi-Turn Context) - Extended features

**Execution Strategy**: Setup → Foundational → Parallel US1–3 → Sequential US4–6

---

## Dependency Graph

```
Phase 1 (Setup: project init, dependencies)
    ↓
Phase 2 (Foundational: Database, SQLModel, MCP tools, AgentRunner, Auth)
    ↓
┌──────────────────────────────────────────────────┐
│ Phase 3 (US1)   Phase 4 (US2)   Phase 5 (US3)   │ [PARALLEL]
│ Task Creation   Task Completion  Task Deletion    │
└──────────────────────────────────────────────────┘
    ↓ (all require Phases 1-2)
Phase 6 (US4: Update) & Phase 7 (US5: View)       [PARALLEL]
    ↓
Phase 8 (US6: Multi-Turn Context + Re-hydration)
    ↓
Phase 9 (Polish: Error handling, logging, security)
```

---

## Phase 1: Setup & Project Initialization

- [ ] T001 Initialize backend project structure: `backend/src/`, `backend/tests/`, `backend/requirements.txt`
- [ ] T002 Initialize frontend project structure: `frontend/src/`, `frontend/public/`, `frontend/package.json`
- [ ] T003 Create `.env.example` with Neon DB URI, OpenAI API key, JWT secret, environment configs
- [ ] T004 Create Dockerfile for FastAPI backend (Python 3.11+, port 8000)
- [ ] T005 Create docker-compose.yml for local development (backend service)
- [ ] T006 Create `backend/requirements.txt`: FastAPI, SQLModel, asyncpg, pytest, OpenAI SDK, MCP SDK
- [ ] T007 Create `frontend/package.json`: Next.js 16+, React 18+, TypeScript, TailwindCSS, ESLint
- [ ] T008 Create `ARCHITECTURE.md` documenting orchestration, MCP tools, component responsibilities
- [ ] T009 Create GitHub Actions CI/CD workflow for testing and linting
- [ ] T010 Create README.md with setup, prerequisites, quick start, testing guide

---

## Phase 2: Foundational (Blocking Prerequisites)

### Database & SQLModel Setup

- [ ] T011 [P] Create Neon PostgreSQL migration: `tasks`, `messages`, `chat_sessions` tables
- [ ] T012 [P] Implement SQLModel entities:
  - `backend/src/models/task.py` (id, user_id, title, description, status, priority, due_date, created_at, updated_at)
  - `backend/src/models/message.py` (id, user_id, role, content, timestamp, session_id)
  - `backend/src/models/chat_session.py` (id, user_id, created_at, last_activity)
- [ ] T013 [P] Create database indices: `(user_id, status)`, `(user_id, created_at)`, `(user_id, timestamp)`
- [ ] T014 Create `backend/src/lib/neon_connection.py` with asyncpg connection pooling and session factory

### JWT Authentication

- [ ] T015 [P] Implement JWT middleware in `backend/src/api/middleware/auth.py`:
  - Validate token + extract user_id from 'sub' claim
  - Return 401 if invalid, 403 if user_id mismatch
- [ ] T016 [P] Create `backend/src/lib/jwt_utils.py` for encode/decode with secret from .env
- [ ] T017 Write unit tests for JWT validation in `backend/tests/unit/test_auth.py`

### MCP Tool Definitions

- [ ] T018 [P] Create `backend/src/services/mcp_tools/task_toolbox.py` (TaskToolbox Skill):
  - `async def create_task(title, description, priority, due_date)` → INSERT + session.commit()
  - `async def update_task(task_id, fields)` → UPDATE + session.commit()
  - `async def complete_task(task_id)` → UPDATE status='completed' + session.commit()
  - `async def delete_task(task_id)` → DELETE + session.commit()
  - `async def view_tasks()` → SELECT all tasks for user
  - **CRITICAL**: Explicit session.commit() after every successful operation
- [ ] T019 [P] Create `backend/src/services/mcp_tools/context_manager.py` (ContextManager):
  - `async def fetch_last_10_messages(session_id)` → SELECT last 10 from messages table
  - `async def store_message(role, content, session_id)` → INSERT + session.commit()
- [ ] T020 [P] Create `backend/src/services/mcp_tools/roman_urdu_handler.py` (RomanUrduHandler Sub-Agent):
  - `def parse_urdu_intent(input_text)` → Extract operation + parameters
  - Pattern matching: "Mera task add kardo:", "task delete kardo:", etc.
  - Fallback: Return None if no pattern match (falls through to English parsing)
- [ ] T021 Write contract tests in `backend/tests/contract/test_mcp_schemas.py`
- [ ] T022 Write unit tests in `backend/tests/unit/test_task_toolbox.py` (all CRUD operations)
- [ ] T023 Write unit tests in `backend/tests/unit/test_context_manager.py`
- [ ] T024 Write unit tests in `backend/tests/unit/test_roman_urdu_handler.py` (10+ Urdu patterns)

### AgentRunner Orchestration

- [ ] T025 [P] Implement `backend/src/services/agent_runner.py` (AgentRunner):
  - `async def run_agent(user_input, session_id, context)` → Main orchestration
  - Load MCP tools from schemas
  - Set `tool_choice='auto'` in OpenAI Agents API call
  - Execute tool + return result
  - **CRITICAL**: Bind TaskToolbox MCP tools to AgentRunner
- [ ] T026 [P] Implement `backend/src/services/chat_service.py` (ChatService):
  - `async def process_chat_message(user_id, session_id, message)`:
    1. **T003: Refactor to fetch existing 'Conversation' and 'Message' history before calling the agent** ← User-specified task
    2. Detect Roman Urdu via RomanUrduHandler
    3. Call AgentRunner with context
    4. Execute MCP tool via TaskToolbox
    5. **T002: Implement 'session.commit()' within add_task tool to ensure persistence** ← User-specified task
    6. Store user + assistant messages
    7. Return confirmation
- [ ] T027 Write integration test for orchestration flow

### FastAPI Setup

- [ ] T028 [P] Create `backend/src/api/main.py` (FastAPI app factory):
  - Register JWT middleware
  - Register error handlers
  - Configure logging
- [ ] T029 [P] Create POST `/api/{user_id}/chat` endpoint in `backend/src/api/routes/chat.py`:
  - **T001: Update 'AgentRunner' to correctly bind existing MCP Skills** ← User-specified task
  - Accept: `{"message": "...", "session_id": "uuid"}`
  - Validate JWT (user_id matches token)
  - Call ChatService.process_chat_message()
  - Return: `{"status": "success", "assistant_message": "...", "task_id": "...", "tool_executed": "..."}`
- [ ] T030 Create GET `/api/{user_id}/tasks` endpoint for Task List sync
- [ ] T031 Create GET `/api/{user_id}/chat?last_n=10` endpoint for history re-hydration on page refresh
- [ ] T032 Create POST `/api/{user_id}/sessions` endpoint to initialize chat session
- [ ] T033 Write API contract tests in `backend/tests/contract/test_api_schemas.py`

### Frontend Setup

- [ ] T034 [P] Create React component `frontend/src/components/ChatWidget.tsx`:
  - Display chat messages (user + assistant)
  - Input field for user messages
  - Send button
  - **T004: Implement a 'useEffect' hook to fetch chat history from the backend on mount** ← User-specified task
- [ ] T035 [P] Create React component `frontend/src/components/TaskList.tsx`:
  - Display tasks from backend
  - Show title, status, priority, due_date
- [ ] T036 Create React page `frontend/src/pages/index.tsx` with ChatWidget + TaskList layout
- [ ] T037 Create `frontend/src/services/chatApi.ts` with HTTP client for `/api/{user_id}/chat`
- [ ] T038 Create `frontend/src/services/taskApi.ts` with HTTP client for `/api/{user_id}/tasks`

---

## Phase 3: User Story 1 - Task Creation via Natural Language (P1)

**Goal**: User can create task via English/Roman Urdu chat command; task persists and appears in UI instantly.

**Independent Test Criteria**:
- ✅ POST /api/{user_id}/chat with "Add task: buy groceries" → database has new task
- ✅ Chat shows confirmation ("I've added 'buy groceries' to your task list.")
- ✅ Task List updates without page refresh
- ✅ Roman Urdu "Mera task add kardo: doctor appointment" → task persisted

**Acceptance** (from spec.md):
1. "Add task: buy groceries by Friday" → task + due_date in database + Task List
2. Roman Urdu "Mera task add kardo: doctor appointment" → task persisted, confirmation in both languages
3. Empty title → assistant asks for clarification, no task created

---

### Backend Implementation

- [ ] T039 [US1] Enhance TaskToolbox.create_task() with validation:
  - Validate title (not empty, not whitespace)
  - Set default priority='medium' if not specified
  - Parse due_date from natural language if provided ("tomorrow", "next Friday")
  - Return `{"task_id": "...", "title": "...", "status": "created"}`
- [ ] T040 [US1] Update ChatService to generate friendly confirmation:
  - On successful create_task(), generate: "I've added '[title]' to your task list with due date [due_date]."
  - Include task_id in response for frontend sync
- [ ] T041 [US1] Enhance RomanUrduHandler for task creation patterns:
  - Pattern: "Mera task add kardo: [title]" or variations
  - Extract title + optional due_date/priority
- [ ] T042 [US1] Write integration test in `backend/tests/integration/test_task_creation.py`:
  - POST /api/user123/chat with "Add task: buy groceries"
  - Verify database contains task with status=pending, user_id=user123
  - Verify response includes friendly confirmation
- [ ] T043 [US1] [P] Write test for Roman Urdu task creation
- [ ] T044 [US1] Write test for empty title validation

### Frontend Implementation

- [ ] T045 [US1] Update ChatWidget.tsx:
  - On successful POST /api/{user_id}/chat, append assistant message to chat
  - Trigger TaskList refresh (poll GET /api/{user_id}/tasks)
- [ ] T046 [US1] Update TaskList.tsx to display newly created tasks:
  - Poll GET /api/{user_id}/tasks every 1 second OR on message received
  - Render each task: title, status, priority (color-coded), due_date
- [ ] T047 [US1] Write Vitest test for ChatWidget message appending
- [ ] T048 [US1] Write integration test for full task creation flow

---

## Phase 4: User Story 2 - Task Completion via Chat (P1)

**Goal**: User can mark task complete via chat; database updates and Task List reflects change instantly.

**Independent Test Criteria**:
- ✅ "Mark buy groceries as done" → database task.status = 'completed'
- ✅ Chat shows confirmation
- ✅ Task List shows task as completed (strikethrough, badge, etc.)

---

### Backend Implementation

- [ ] T049 [US2] Implement task completion in TaskToolbox.complete_task(task_id):
  - Validate task_id + user_id ownership
  - UPDATE Task SET status='completed', updated_at=NOW() WHERE id=task_id
  - session.commit()
  - Return `{"task_id": "...", "status": "completed"}`
- [ ] T050 [US2] Update ChatService to resolve task title to task_id:
  - User says "Mark buy groceries as done" (by title, not ID)
  - Query Task table for exact match
  - If no match, ask user for clarification
  - If multiple matches, show options: "I found 3 tasks. Which one: [list]?"
- [ ] T051 [US2] Implement RomanUrduHandler pattern for completion:
  - Pattern: "Mera task complete kardo: [title]"
- [ ] T052 [US2] Write integration test for task completion

### Frontend Implementation

- [ ] T053 [US2] Update TaskList.tsx to show completed status visually:
  - Completed tasks: strikethrough text + "✓ Completed" badge
- [ ] T054 [US2] Update ChatWidget to trigger TaskList refresh on completion message
- [ ] T055 [US2] Write integration test for UI sync on completion

---

## Phase 5: User Story 3 - Task Deletion via Chat (P1)

**Goal**: User can delete task via chat; task removed from database and Task List instantly.

**Independent Test Criteria**:
- ✅ "Delete task: old project" → task removed from database
- ✅ Chat shows confirmation
- ✅ Task List no longer displays deleted task

---

### Backend Implementation

- [ ] T056 [US3] Implement task deletion in TaskToolbox.delete_task(task_id):
  - Validate task_id + user_id ownership
  - DELETE FROM Task WHERE id=task_id
  - session.commit()
  - Return `{"task_id": "...", "status": "deleted"}`
- [ ] T057 [US3] Update ChatService to handle deletion:
  - Title-to-ID resolution (same as completion, T050)
  - Confirmation before deletion if multiple matches
- [ ] T058 [US3] Implement RomanUrduHandler pattern for deletion:
  - Pattern: "Mera task delete kardo: [title]"
- [ ] T059 [US3] Write integration test for task deletion

### Frontend Implementation

- [ ] T060 [US3] Update TaskList.tsx to remove deleted tasks:
  - Poll GET /api/{user_id}/tasks after chat action
  - Deleted task disappears without page refresh
- [ ] T061 [US3] Write integration test for deletion UI sync

---

## Phase 6: User Story 4 - Task Update via Chat (P2)

- [ ] T062 [US4] Implement TaskToolbox.update_task(task_id, fields_dict):
  - Parse fields (priority, due_date, description)
  - UPDATE Task SET [fields], updated_at=NOW() WHERE id=task_id
  - session.commit()
- [ ] T063 [US4] Update ChatService to parse update commands and resolve title-to-ID
- [ ] T064 [US4] Implement RomanUrduHandler pattern for updates
- [ ] T065 [US4] Write integration tests for update

---

## Phase 7: User Story 5 - View Tasks via Chat (P2)

- [ ] T066 [US5] Ensure TaskToolbox.view_tasks() returns formatted list:
  - SELECT * FROM Task WHERE user_id=user_id ORDER BY created_at DESC
  - Return `{"tasks": [...], "count": N}`
- [ ] T067 [US5] Update ChatService to format view response:
  - "You have [count] tasks: \n1. [title] - [status] (priority: [priority])\n..."
- [ ] T068 [US5] Implement RomanUrduHandler pattern: "Mera tasks dikhao"
- [ ] T069 [US5] Write integration tests for view + empty list

---

## Phase 8: User Story 6 - Multi-Turn Context + Re-hydration (P2)

**Goal**: Assistant maintains conversation context across turns; history fully restored on page refresh.

**Independent Test Criteria**:
- ✅ 5+ message conversation: last message references earlier → assistant understands
- ✅ Page refresh: ChatWidget shows full conversation history (last 10 messages)
- ✅ Page refresh: TaskList shows all tasks with correct status
- ✅ Verify last 10 messages fetched before each LLM call

---

### Backend Implementation

- [ ] T070 [US6] Verify ContextManager.fetch_last_10_messages() called before AgentRunner in ChatService:
  - Add logging to verify message count
- [ ] T071 [US6] Implement ContextManager.store_message():
  - INSERT user message immediately after user input
  - INSERT assistant message after tool execution + session.commit()
- [ ] T072 [US6] Implement backend GET /api/{user_id}/chat?last_n=10 endpoint:
  - Query Message table for user's session
  - Return last N messages (default 10)
  - Return `{"messages": [{role, content, timestamp}, ...]}`
- [ ] T073 [US6] Write integration test for context retrieval:
  - Create 5 tasks, on 6th message reference earlier: "Complete the first one"
  - Verify assistant correctly identifies Task 1

### Frontend Implementation

- [ ] T074 [US6] Implement ChatWidget useEffect to fetch history on mount:
  - `useEffect(() => { getChatHistory(); getTasks(); }, [userId, sessionId])`
  - Call GET /api/{user_id}/chat?last_n=10
  - Restore all messages to state
- [ ] T075 [US6] Implement getChatHistory() in chatApi.ts
- [ ] T076 [US6] Write integration test for page refresh re-hydration:
  - Create task, complete task
  - Refresh page (F5 simulation)
  - Verify ChatWidget shows all previous messages
  - Verify TaskList shows all tasks with correct status

---

## Phase 9: Polish & Cross-Cutting

- [ ] T077 [P] Implement comprehensive error handling in ChatService:
  - DB connection failures → 503 with friendly message
  - Invalid JWT → 401
  - Task not found → 404 (not 403)
  - MCP tool failures → Assistant clarification
- [ ] T078 [P] Implement structured logging in `backend/src/lib/logger.py`:
  - Log all agent decisions, tool executions, database commits
- [ ] T079 [P] Add input validation: max 500 chars per message
- [ ] T080 [P] Add rate limiting: 100 req/min per user
- [ ] T081 [P] Add API documentation (OpenAPI/Swagger)
- [ ] T082 [P] Write end-to-end test covering full MVP flow:
  - Create 3 tasks (English + Urdu), complete 1, delete 1, update 1
  - Verify all in database + UI, refresh page, verify restoration
- [ ] T083 [P] Load testing: 100 concurrent users, verify <2s task creation latency
- [ ] T084 [P] Security testing:
  - Verify user_a cannot see user_b's tasks
  - Verify SQLi protection (parameterized queries)
  - Verify JWT validation on all endpoints

---

## Summary

**Total Tasks**: 84
- **Setup**: 10 tasks
- **Foundational**: 24 tasks
- **US1 (Create)**: 10 tasks
- **US2 (Complete)**: 7 tasks
- **US3 (Delete)**: 6 tasks
- **US4 (Update)**: 4 tasks
- **US5 (View)**: 4 tasks
- **US6 (Context + Re-hydration)**: 10 tasks
- **Polish & Cross-Cutting**: 8 tasks

**MVP Scope** (Phases 1–5): 51 tasks
**Full Scope** (Phases 1–9): 84 tasks

**Parallel Opportunities**:
- US1–3 run in parallel after Phase 2
- US4 & US5 run in parallel
- All unit tests run in parallel

---

**Plan Version**: 1.0 | **Created**: 2026-02-08 | **Status**: Ready for Red-Green-Refactor
