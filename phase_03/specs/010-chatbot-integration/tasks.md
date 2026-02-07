# Tasks: Agentic AI Chatbot for Task Management

**Feature**: `010-chatbot-integration` | **Branch**: `010-chatbot-integration`
**Input**: Design documents from `/phase_03/specs/010-chatbot-integration/`
**Prerequisites**: plan.md (✅ complete), spec.md (✅ complete with 5 user stories), research.md (✅ complete)

**Organization**: Tasks organized by user story (P1, P1, P2, P2, P3) to enable independent implementation and testing. Each phase is independently testable and can be deployed separately.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, database foundation, and basic FastAPI structure

**Deliverables**: Project structure ready, migrations framework in place, environment config template created

- [ ] T001 Create backend directory structure per implementation plan (models/, services/, api/, middleware/, config.py)
- [ ] T002 Initialize Python 3.11+ project with FastAPI, SQLModel, Neon PostgreSQL, OpenAI SDK dependencies in backend/requirements.txt
- [ ] T003 [P] Configure linting (pylint, black) and formatting tools in backend/
- [ ] T004 Create frontend Next.js 16+ project structure (components/, pages/, services/, styles/)
- [ ] T005 [P] Configure frontend dependencies (React, TypeScript, TailwindCSS, axios for API client)
- [ ] T006 Create .env.example template with OPENROUTER_API_KEY, DATABASE_URL, JWT_SECRET placeholders
- [ ] T007 Initialize FastAPI app skeleton (app/main.py with logging, middleware setup)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete. Foundational tasks establish database schema, authentication, API routing, and MCP tool integration.

- [ ] T008 [P] Add SQLModel Conversation model to backend/app/models/conversation.py (id, user_id FK, created_at, updated_at, language_preference, metadata)
- [ ] T009 [P] Add SQLModel Message model to backend/app/models/message.py (id, conversation_id FK, role, content, tool_call_metadata, created_at)
- [ ] T010 [P] Create database migration script backend/reset_database.py to drop/create Conversation and Message tables with proper FK relationships and cascade delete
- [ ] T011 Create database session management in backend/app/models/database.py with SQLAlchemy pool config (min 5, max 20, timeout 30s)
- [ ] T012 [P] Implement JWT middleware in backend/app/middleware/auth.py to extract user_id from Authorization header, validate token, inject into request.state
- [ ] T013 [P] Configure OpenAI Agents SDK client in backend/app/config.py to use OpenRouter endpoint (base_url override to openrouter.ai/api/v1)
- [ ] T014 [P] Implement MCP tool discovery and registration in backend/app/services/mcp_tools.py (TaskToolbox, RomanUrduHandler, ContextManager tool schemas)
- [ ] T015 Create FastAPI dependency for DB session injection (Depends) in backend/app/models/database.py
- [ ] T016 [P] Setup error handling middleware in backend/app/middleware/ to catch and format errors (401, 400, 500 responses)
- [ ] T017 [P] Configure logging infrastructure in backend/app/config.py (INFO level, structured logs with user_id tracking)

**Checkpoint**: Foundation ready - all user stories can now proceed in parallel or sequentially

---

## Phase 3: User Story 1 - Create Tasks via Natural Language (Priority: P1) 🎯 MVP

**Goal**: Users can type conversational requests in English ("buy milk tomorrow") and the system extracts task details, calls add_task tool via OpenAI Agents SDK, and confirms creation with friendly messaging.

**Independent Test**:
1. User enters English task request "buy milk tomorrow"
2. System sends to chat endpoint with JWT token
3. OpenAI Agents SDK calls TaskToolbox.add_task tool with title + due_date
4. Agent generates confirmation: "I've added 'buy milk' to your list for tomorrow!"
5. Message and task persisted to DB

**Acceptance Criteria**:
- Natural language parsing accuracy ≥ 95% on common inputs
- Task creation latency < 5 seconds (p95)
- Confirmation message friendly and grammatically correct

### Implementation for User Story 1

- [ ] T018 [P] [US1] Create ChatService in backend/app/services/chat_service.py with methods: fetch_conversation_context(), process_user_message(), save_message_to_db()
- [ ] T019 [P] [US1] Create AgentRunner in backend/app/services/agent_runner.py to initialize OpenAI Agents SDK with MCP tools, call LLM, extract tool calls, execute tools
- [ ] T020 [US1] Implement POST /api/{user_id}/chat endpoint in backend/app/api/chat.py (handles request validation, calls ChatService, returns JSON response with message + tool_calls)
- [ ] T021 [US1] Integrate ContextManager tool in backend/app/services/context_manager.py to fetch last 10-15 messages from DB for conversation context (handles token budgeting)
- [ ] T022 [US1] Add input validation to chat endpoint: conversation_id exists, message not empty, user_id matches JWT token
- [ ] T023 [US1] Add response formatting in AgentRunner to extract assistant message and tool call metadata from LLM response
- [ ] T024 [US1] Implement error handling in ChatService for tool execution failures (task validation errors, DB errors) with user-friendly messages
- [ ] T025 [US1] Add logging in ChatService for each request: user_id, conversation_id, message content, tool calls, latency

**Checkpoint**: User Story 1 fully functional - users can create tasks via English natural language. Test independently before moving to US2.

---

## Phase 4: User Story 2 - Execute Task Operations in Roman Urdu (Priority: P1)

**Goal**: Users can issue commands in Roman Urdu ("Mera grocery wala task delete kar do") and the system parses intent via RomanUrduHandler, executes corresponding tool (delete_task), and responds in Roman Urdu.

**Independent Test**:
1. User enters Roman Urdu command "Mera grocery wala task delete kar do"
2. System detects Urdu language, calls RomanUrduHandler.parse_urdu_intent
3. Handler extracts operation (delete) + task reference (grocery)
4. System calls delete_task tool with extracted reference
5. Agent responds in Roman Urdu: "Bilkul, maine aapka grocery task delete kar diya"
6. Message and deletion persisted to DB

**Acceptance Criteria**:
- Roman Urdu parsing accuracy ≥ 90% on well-formed inputs
- Language detection (English vs Urdu) ≥ 98% accuracy
- Response generation in Roman Urdu is grammatically correct

### Implementation for User Story 2

- [ ] T026 [P] [US2] Update AgentRunner in backend/app/services/agent_runner.py to detect input language (English vs Roman Urdu) and route to appropriate handler
- [ ] T027 [P] [US2] Create RomanUrduAdapter in backend/app/services/roman_urdu_adapter.py to call RomanUrduHandler MCP tool (parse_urdu_intent, generate_urdu_response)
- [ ] T028 [US2] Implement language routing in ChatService: if Urdu detected, call RomanUrduAdapter before TaskToolbox calls
- [ ] T029 [US2] Update system prompt in AgentRunner to include Roman Urdu response generation instructions for Urdu inputs
- [ ] T030 [US2] Add Roman Urdu test cases in backend/tests/integration/test_roman_urdu_chat.py (create task, delete task, complete task via Urdu commands)
- [ ] T031 [US2] Enhance ContextManager to store language_preference in Conversation record; use same language for follow-up messages
- [ ] T032 [US2] Add language detection logging in ChatService for analytics
- [ ] T033 [US2] Add error handling for ambiguous Urdu commands with clarification questions in Roman Urdu

**Checkpoint**: User Story 2 functional - users can execute task operations in both English and Roman Urdu. Both P1 stories now complete and deployable as MVP.

---

## Phase 5: User Story 3 - Retrieve and Display Conversation History (Priority: P2)

**Goal**: When users return to Dashboard or reopen chat, ContextManager fetches prior conversation messages from DB, displays history in chat UI, and maintains context for subsequent requests.

**Independent Test**:
1. User creates tasks in one chat session (2-3 messages saved)
2. User closes browser, returns hours later
3. User navigates to Dashboard and opens chat
4. Prior conversation history loads and displays chronologically with roles marked (user vs assistant)
5. User can scroll to older messages
6. LLM can reference prior messages in new interactions

**Acceptance Criteria**:
- History loads within 2 seconds
- All messages display with correct role and timestamp
- History persists across 24+ hour gap
- Context window includes last 10-15 messages for LLM

### Implementation for User Story 3

- [ ] T034 [P] [US3] Implement fetch_chat_history in ContextManager (backend/app/services/context_manager.py) to query Neon DB for Conversation.messages, ordered by created_at DESC, limit 15
- [ ] T035 [P] [US3] Add token counting logic to ContextManager: if total tokens > 80% of budget, summarize older messages (concatenate action summaries)
- [ ] T036 [US3] Update ChatService to call ContextManager.fetch_chat_history on every request for context injection
- [ ] T037 [US3] Modify chat endpoint response to include all conversation messages (not just latest tool calls) in backend/app/api/chat.py
- [ ] T038 [US3] Create ChatWidget frontend component in frontend/src/components/ChatWidget.tsx to render message history with user/assistant styling
- [ ] T039 [US3] Implement message scroll and pagination in ChatWidget (load last 5 immediately, scroll up for older messages)
- [ ] T040 [US3] Add conversation_id selection UI in ChatWidget to switch between multiple conversations
- [ ] T041 [US3] Integrate ChatWidget into Dashboard page (frontend/src/pages/dashboard.tsx) as drawer or sidebar without disrupting Phase II layout
- [ ] T042 [US3] Add integration test for history retrieval in backend/tests/integration/test_chat_history.py (create session, close, reopen, verify messages load)

**Checkpoint**: User Story 3 complete - conversation history persists and displays correctly. Users can access prior context across sessions.

---

## Phase 6: User Story 4 - Stateless Request Processing with Tool Invocation (Priority: P2)

**Goal**: Verify that every request is stateless - fetch context from DB, process, call tool, save response. No in-memory state persists. System continues working after backend restart.

**Independent Test**:
1. User sends task creation request
2. Backend restarts mid-processing
3. User sends another message
4. System loads full conversation history from DB (proving no state lost)
5. Tool calls execute correctly with restored context

**Acceptance Criteria**:
- Zero in-memory state maintained between requests
- Tool calls execute correctly after service restart
- Context window reconstructed from DB every request
- Performance impact < 200ms for history reconstruction

### Implementation for User Story 4

- [ ] T043 [US4] Verify all state in AgentRunner is request-scoped (no class-level caching of conversations/messages)
- [ ] T044 [US4] Implement connection pooling in database.py to ensure stateless DB access (tested under Foundational T011)
- [ ] T045 [US4] Add integration test for stateless processing in backend/tests/integration/test_stateless_arch.py: send request, restart service, send another request, verify history loads
- [ ] T046 [US4] Verify ContextManager reconstruction of conversation context from DB messages (no memory-based cache)
- [ ] T047 [US4] Add performance benchmark test to verify history reconstruction < 200ms for typical conversation (10-15 messages)
- [ ] T048 [US4] Implement structured logging with correlation IDs to trace requests across restarts
- [ ] T049 [US4] Document stateless architecture validation procedure in quickstart.md

**Checkpoint**: User Story 4 complete - stateless processing verified. System is resilient to service restarts.

---

## Phase 7: User Story 5 - Access Control and Session Validation (Priority: P3)

**Goal**: Every MCP tool call verifies user_id from JWT token. Unauthorized access attempts are rejected 100% of the time with graceful error messaging ("You don't have permission" or "Task not found" - no data leakage).

**Independent Test**:
1. User A creates a task
2. User B attempts to delete User A's task (different user_id in JWT)
3. System rejects with "You don't have permission to access this task"
4. No cross-user data leak occurs
5. Attempt is logged with both user IDs for security audit

**Acceptance Criteria**:
- 100% of tool calls include user_id verification at middleware layer
- Unauthorized access attempts rejected with 403/404 (no 500 leaks)
- All task operations verify user_id ownership before execution
- Security audit logs all unauthorized attempts

### Implementation for User Story 5

- [ ] T050 [P] [US5] Verify JWT middleware in T012 correctly extracts and injects user_id into request.state
- [ ] T051 [P] [US5] Add user_id parameter to all MCP tool calls in AgentRunner (TaskToolbox, ContextManager, RomanUrduHandler)
- [ ] T052 [P] [US5] Implement authorization check in ChatService: verify request.state.user_id matches conversation.user_id before processing
- [ ] T053 [US5] Update task_lookup in ContextManager to filter by both conversation_id AND user_id (double-check ownership)
- [ ] T054 [US5] Add unauthorized access error handler in chat endpoint to return 403 Forbidden with generic message ("Access denied")
- [ ] T055 [US5] Implement security audit logging in middleware to log all authorization failures with user_id + timestamp + attempted action
- [ ] T056 [US5] Add integration test for cross-user access prevention in backend/tests/integration/test_auth_isolation.py
- [ ] T057 [US5] Verify unauthenticated requests (no JWT) are rejected with 401 Unauthorized before reaching endpoint handler

**Checkpoint**: User Story 5 complete - access control fully implemented and tested. Multi-tenant data isolation verified.

---

## Phase 8: Frontend Chat Integration (Cross-Cutting)

**Purpose**: Integrate ChatWidget into dashboard, ensure JWT passed in all requests, add error handling and loading states

- [ ] T058 [P] Create chatService API client in frontend/src/services/chatService.ts (POST /api/{user_id}/chat with Authorization header)
- [ ] T059 [P] Implement JWT token retrieval in frontend from localStorage/cookies or auth context
- [ ] T060 [US3] Update ChatWidget to fetch and display initial conversation list from GET /api/{user_id}/conversations endpoint
- [ ] T061 [US1] Add message input form and send button to ChatWidget with loading spinner during API call
- [ ] T062 [US1] Implement error display in ChatWidget: show error messages from backend gracefully (e.g., "Service unavailable" for 500 errors)
- [ ] T063 [US2] Add language selector (English/Roman Urdu) to ChatWidget to hint LLM for response language
- [ ] T064 [US3] Implement infinite scroll for chat history (load older messages on scroll up)
- [ ] T065 [P] Add responsive styling to ChatWidget (glassmorphic design per Phase II theme)
- [ ] T066 Create frontend integration tests in frontend/tests/components/ChatWidget.test.tsx for message sending, history loading, error states

**Checkpoint**: Frontend ChatWidget fully integrated with backend API and ready for E2E testing.

---

## Phase 9: Validation & Integration Testing

**Purpose**: End-to-end testing across all user stories, contract validation, performance validation

- [ ] T067 [P] Create contract test for POST /api/{user_id}/chat in backend/tests/contract/test_chat_endpoint.py (schema validation, required fields, response structure)
- [ ] T068 [P] Create E2E test scenario in backend/tests/e2e/test_full_workflow.py: user creates task (US1) → deletes in Urdu (US2) → history loads (US3) → restart service (US4) → verify access control (US5)
- [ ] T069 [P] Performance test: 100 concurrent chat requests, verify p95 latency < 5s (T001 from spec success criteria)
- [ ] T070 Run quickstart.md local dev setup validation: clone, setup, run, test all 5 user stories manually
- [ ] T071 Verify Neon PostgreSQL connection pooling under load (T069): no connection exhaustion
- [ ] T072 Security scan: verify no hardcoded secrets in code, no SQL injection vectors, proper error messages

**Checkpoint**: All user stories validated end-to-end, performance targets met, security verified.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, documentation, deployment readiness

- [ ] T073 [P] Update documentation in docs/ and README.md with chatbot feature overview
- [ ] T074 [P] Add comprehensive docstrings to all FastAPI endpoints and service methods
- [ ] T075 [P] Refactor any repeated code in ChatService and AgentRunner to DRY principles
- [ ] T076 Code cleanup: remove debug logging, unused imports, dead code
- [ ] T077 [P] Add support for graceful OpenRouter API failure recovery (T009 from spec: return friendly error immediately)
- [ ] T078 Create deployment runbook documenting environment variables, database migrations, health check endpoints
- [ ] T079 Add health check endpoint (GET /health) to FastAPI for monitoring
- [ ] T080 Performance optimization: profile hot paths (history fetch, token counting) and optimize as needed

**Checkpoint**: Feature production-ready for Phase III release.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - CRITICAL BLOCKER for all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational (Phase 2) completion
  - **US1 & US2 (P1)**: Can proceed in parallel after Foundational; both part of MVP
  - **US3 & US4 (P2)**: Can proceed in parallel after Foundational; depend on US1/US2 for context
  - **US5 (P3)**: Can proceed after Foundational; validates US1/US2/US3/US4
- **Frontend Integration (Phase 8)**: Depends on US1, US2, US3 backend completion
- **Validation (Phase 9)**: Depends on all user story implementation completion
- **Polish (Phase 10)**: Final phase, no dependencies on critical path

### Critical Path to MVP

1. **Phase 1**: Setup (3-4 hours) - Project structure, dependencies
2. **Phase 2**: Foundational (6-8 hours) - Database, auth middleware, MCP integration, agent runner
3. **Phase 3**: User Story 1 (4-6 hours) - English task creation (blocks deployment)
4. **Phase 4**: User Story 2 (3-4 hours) - Roman Urdu task operations
5. **Phase 8**: Frontend Integration (4-6 hours) - ChatWidget + dashboard
6. **Validation**: E2E testing (2-3 hours)

**MVP Ready**: After Phase 1 + 2 + 3 + 8 + validation (18-25 hours). Users can create tasks via English chat.

### Parallel Opportunities

**Within Phase 2 (Foundational)**:
- T008, T009, T010 (models) can run in parallel
- T012, T013 (middleware, config) can run in parallel
- T014, T016, T017 (MCP tools, error handling, logging) can run in parallel

**Between Phases 3 & 4 (US1 & US2)**:
- After Phase 2 completes, US1 and US2 can be developed in parallel by different team members
- US1 doesn't block US2; both are independent P1 stories

**Within Phase 8 (Frontend)**:
- T058, T059 (API client, JWT) can run in parallel with T061, T062 (form, error handling)

**Within Phase 9 (Validation)**:
- T067, T068, T069 (contract, E2E, perf tests) can run in parallel

### Suggested Team Assignment (for parallel track)

- **Developer A**: Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1)
- **Developer B**: Phase 3 (US1) parallel → Phase 4 (US2) → Phase 5 (US3)
- **Frontend Dev**: Wait for Phase 2 completion → Phase 8 (Frontend) parallel with backend phases
- **QA**: Phase 9 (Validation) after all user stories complete

---

## Implementation Strategy

### MVP First (Recommended: 1-2 weeks)

1. Complete Phase 1: Setup (project structure, dependencies)
2. Complete Phase 2: Foundational (database, auth, MCP integration) - **CRITICAL**
3. Complete Phase 3: User Story 1 (English task creation)
4. Complete Phase 8: Frontend integration
5. Complete Phase 9: Validation (E2E, performance, security)
6. **STOP and DEPLOY**: MVP is ready
7. Users can create tasks via English natural language chat

### Incremental Delivery (Follow-up: 1-2 weeks)

After MVP release:
1. Add Phase 4: User Story 2 (Roman Urdu support)
2. Add Phase 5: User Story 3 (conversation history)
3. Add Phase 6: User Story 4 (stateless verification)
4. Add Phase 7: User Story 5 (access control validation)
5. Complete Phase 10: Polish

Each phase adds value independently without breaking previous functionality.

---

## Success Metrics

| Metric | Target | User Story | Phase |
|--------|--------|-------------|-------|
| Task creation latency (p95) | < 5 seconds | US1 | 3 |
| NLP accuracy (English) | ≥ 95% | US1 | 3 |
| NLP accuracy (Roman Urdu) | ≥ 90% | US2 | 4 |
| History load time | < 2 seconds | US3 | 5 |
| Authorization rejection rate | 100% | US5 | 7 |
| Stateless processing (no memory leak) | Verified | US4 | 6 |
| MVP readiness | Deployed | US1+US2+Frontend | After Phase 9 |

---

## Notes

- `[P]` tasks = different files, no dependencies, can parallelize
- `[Story]` label = task belongs to specific user story (US1-US5)
- Each user story independently completable and testable after Foundational phase
- Commit after each task or logical group
- Stop at any phase checkpoint to validate independently
- Tests (contract, integration, E2E) included for comprehensive coverage
- Quickstart.md validation (T070) ensures new developers can reproduce locally
