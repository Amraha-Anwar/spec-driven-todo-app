# Tasks: Synchronize GitHub and Implement OpenRouter AI Chatbot

**Feature**: 011-github-sync-chatbot
**Input**: Design documents from `specs/011-github-sync-chatbot/`
**Prerequisites**: plan.md (tech stack, structure), spec.md (3 user stories with P1 priority)

**Organization**: Tasks organized by phase (GitHub Sync → Database Fixes → Chat Implementation) enabling independent, parallel implementation of independent user stories.

**Total Tasks**: 24 (distributed across 4 phases)
**Parallel Opportunities**: 12 tasks can run in parallel (marked [P])
**MVP Scope**: Complete Phase 0 + Phase 1 + Phase 2 (User Story 1: GitHub Recovery)

---

## Dependencies Graph

```
Phase 0: GitHub Sync (Critical Foundation)
    ↓
Phase 1: Database & Env Fixes (Blocking for Backend)
    ↓
Phase 2: Backend Chat API (Unblocks Frontend)
    ├─→ Phase 3a: Frontend ChatWidget (runs after Phase 2)
    └─→ Phase 3b: Visual Design (can run in parallel with Phase 3a)
```

---

## Phase 0: GitHub Synchronization & Recovery (Critical)

**Purpose**: Restore UI from authoritative GitHub source; foundation for all subsequent work

**Completion Criteria**:
- `git diff origin/main -- phase_02/frontend/` shows zero differences
- All 40+ UI components restored to phase_02 and synced to phase_03
- Phase 03 MCP tools and skills remain intact

### GitHub Sync Tasks

- [ ] T001 Fetch latest from GitHub origin: `git fetch origin` in repository root
- [ ] T002 [P] Restore phase_02 frontend from GitHub: `git checkout origin/main -- phase_02/frontend/` in repository root
- [ ] T003 [P] Restore phase_02 app directory: `git checkout origin/main -- phase_02/app/` (globals.css, config files)
- [ ] T004 [P] Restore phase_02 hooks: `git checkout origin/main -- phase_02/frontend/hooks/` (useSidebarMode, useModalPortal)
- [ ] T005 Verify restoration completeness: Run `git diff origin/main -- phase_02/frontend/` and confirm zero output
- [ ] T006 Copy UI files from phase_02 to phase_03: `cp -r phase_02/frontend/components phase_03/frontend/components` (preserve Phase 03 MCP)
- [ ] T007 [P] Copy styling files to phase_03: `cp -r phase_02/app/globals.css phase_03/app/globals.css` and Tailwind config
- [ ] T008 [P] Copy hooks to phase_03: `cp -r phase_02/frontend/hooks phase_03/frontend/hooks` (sidebar toggle state)
- [ ] T009 Verify phase_03 files match phase_02: Run `diff -r phase_02/frontend phase_03/frontend` excluding MCP directories

**Checkpoint**: GitHub sync complete. UI consistency verified. Ready for database fixes.

---

## Phase 1: Database & Environment Fixes (P1)

**Purpose**: Fix SQLModel ValueError and ensure secure configuration management

**Blocking**: Backend implementation cannot proceed without database fixes

**Completion Criteria**:
- `python reset_database.py` runs without ValueError or type warnings
- Conversation and Message models instantiate without errors
- All secrets loaded from `phase_03/backend/.env` only (no hardcoded values)

### Database Model Fixes

- [ ] T010 [P] Fix Conversation model metadata field in `phase_03/backend/app/models/conversation.py`:
  - Change: `metadata: Optional[dict] = Field(default=None)`
  - To: `metadata: Optional[Dict[str, Any]] = Field(default=None)`
  - Add import: `from typing import Dict, Any`
  - Verify instantiation works without ValueError

- [ ] T011 [P] Fix Message model tool_call_metadata field in `phase_03/backend/app/models/message.py`:
  - Change: `tool_call_metadata: Optional[dict] = Field(default=None)`
  - To: `tool_call_metadata: Optional[Dict[str, Any]] = Field(default=None)`
  - Add import: `from typing import Dict, Any`
  - Verify instantiation works without ValueError

- [ ] T012 Run database reset validation: Execute `python phase_03/backend/reset_database.py` and verify success with no errors

### Environment Configuration

- [ ] T013 [P] Create `.env` template in `phase_03/backend/.env.example` with required variables:
  - DATABASE_URL=postgresql://...
  - SECRET_KEY=...
  - OPENROUTER_API_KEY=...
  - OPENROUTER_BASE_URL=...

- [ ] T014 [P] Update all imports in backend to read from `.env`:
  - Check `phase_03/backend/app/main.py` loads config from environment
  - Check `phase_03/backend/app/services/chat_service.py` uses `os.getenv("OPENROUTER_API_KEY")`
  - Verify no hardcoded secrets in code

- [ ] T015 [P] Create `.env.local` for development from `.env.example` template (user-specific configuration)

**Checkpoint**: Database models fixed. Environment secure. Ready for API implementation.

---

## Phase 2: Agentic Chat API Implementation (P1 - User Story 2)

**Goal**: Implement backend endpoint for natural language task management via OpenRouter

**Independent Test**: Can be tested with curl/Postman without frontend; creates tasks from chat input

**Completion Criteria**:
- POST `/api/{user_id}/chat` accepts user messages and returns AI responses
- Chat responses create/update/delete tasks via MCP TaskToolbox
- Conversation history persists and reconstructs from database
- OpenRouter API failures handled gracefully (no stack trace leakage)

### Chat Service Implementation

- [ ] T016 [P] Create ChatService in `phase_03/backend/app/services/chat_service.py`:
  - Integrate OpenRouter API client (async)
  - Support English and Roman Urdu language preferences
  - Handle multi-turn conversation context reconstruction
  - Add graceful error handling with user-friendly messages (no API errors exposed)
  - Support task operation responses (create, update, delete, complete)

- [ ] T017 [P] Create/update Conversation repository in `phase_03/backend/app/repositories/conversation_repo.py`:
  - `fetch_by_user_and_id()`: Get conversation with all messages
  - `save_message()`: Persist user/assistant messages
  - `create_conversation()`: Initialize new conversation for user
  - All queries filter by user_id for isolation

- [ ] T018 [P] Implement RomanUrduHandler integration in ChatService:
  - Parse Roman Urdu intent (Mera task delete kar do → delete_task)
  - Map to TaskToolbox operations
  - Generate Roman Urdu responses

- [ ] T019 Create chat endpoint in `phase_03/backend/app/api/chat.py`:
  - Route: `POST /api/{user_id}/chat`
  - Request validation: user_id from JWT matches path parameter
  - Response: conversation_id, messages array, task_created flag
  - Error handling: 401 (no JWT), 403 (user mismatch), 400 (validation), 500 (API failure)
  - Middleware enforces JWT validation before endpoint

- [ ] T020 [P] Add conversation history fetch in ChatService:
  - Reconstruct context from database on every request (stateless)
  - Fetch last N messages for LLM prompt context
  - Include conversation metadata (language, previous operations)

### Chat API Testing

- [ ] T021 [P] Create contract tests in `phase_03/backend/tests/contract/test_chat_endpoint.py`:
  - 401: Missing JWT token
  - 403: user_id in JWT doesn't match path parameter
  - 400: Missing message field
  - 200: Valid message returns conversation_id and messages array
  - Task creation: Message triggers task creation (verified in task list)

- [ ] T022 [P] Create integration tests in `phase_03/backend/tests/integration/test_chat_workflow.py`:
  - English task creation: "Create task: Review PR #123" → Task appears
  - Roman Urdu task deletion: "Mera task delete kar do" → Task deleted, response in Roman Urdu
  - Context preservation: Follow-up messages reference previous context
  - API failure recovery: OpenRouter timeout returns friendly message

**Checkpoint**: Chat API fully functional. Can create/update/delete tasks via natural language. All tests passing.

---

## Phase 3a: Frontend ChatWidget Implementation (P1 - User Story 3)

**Goal**: Build responsive ChatWidget component with glasmorphic design and auth enforcement

**Independent Test**: Load Home page, verify ChatWidget icon visible with #865A5B color, click to open modal, send message → task created in task list

**Completion Criteria**:
- ChatWidget icon displays on Home page with correct styling (#865A5B, glasmorphic, responsive)
- Only authenticated users can open/use ChatWidget (unauthenticated: locked with login prompt)
- Chat messages display with correct styling (consistent with design system)
- Responsive design verified on mobile (<375px), tablet (375-768px), desktop (≥768px)

### Frontend Components

- [ ] T023 [P] Create ChatIcon component in `phase_03/frontend/src/components/chat/ChatIcon.tsx`:
  - Icon: Message bubble or chat icon (#865A5B burgundy color)
  - Position: Bottom-right corner (fixed)
  - Styling: Glassmorphic (backdrop-blur, translucent background)
  - Click handler: Toggle ChatWidget open/close
  - Auth check: Disabled/locked for unauthenticated users
  - Responsive: Scale appropriately for mobile/tablet/desktop

- [ ] T024 [P] Create ChatWidget modal in `phase_03/frontend/src/components/chat/ChatWidget.tsx`:
  - Modal container with glasmorphic styling (from globals.css)
  - Message list (ChatMessages component) showing conversation history
  - Input form with message text field and send button
  - Loading state while waiting for API response
  - Error display (user-friendly messages, no stack traces)
  - Responsive: 100% width on mobile, 70% on tablet, 30% on desktop
  - Close button to hide modal

- [ ] T025 [P] Create ChatMessages component in `phase_03/frontend/src/components/chat/ChatMessages.tsx`:
  - Display messages with role-based styling (user vs assistant)
  - Scrollable container (auto-scroll on new messages)
  - Timestamps for each message
  - Loading indicator while fetching response

- [ ] T026 Create use-chat hook in `phase_03/frontend/src/hooks/use-chat.ts`:
  - State: isOpen, messages, isLoading, error, userMessage
  - Methods: sendMessage(), toggleWidget(), clearChat()
  - Fetch conversation history on mount (from database)
  - Call chatService.postMessage() on send
  - Handle errors gracefully (display to user, don't crash)

- [ ] T027 [P] Create chatService API client in `phase_03/frontend/src/services/chatService.ts`:
  - Method: postMessage(user_id, message, conversation_id, language_preference)
  - Authentication: Include JWT token in Authorization header
  - Error handling: Parse error responses and return user-friendly messages
  - Timeout: Enforce 30s timeout on OpenRouter requests

- [ ] T028 [P] Integrate ChatWidget into Home page:
  - Import ChatIcon and ChatWidget components
  - Place ChatIcon in bottom-right corner
  - Render ChatWidget as modal overlay (when open)
  - Verify icon visible and clickable
  - Verify unauthenticated users see locked icon

### Frontend Testing

- [ ] T029 [P] Create ChatIcon component test in `phase_03/frontend/tests/chat-icon.test.tsx`:
  - Renders with correct color (#865A5B)
  - Responds to click (toggles open/close)
  - Shows locked state for unauthenticated users
  - Responsive scaling on different screen sizes

- [ ] T030 [P] Create ChatWidget responsive test in `phase_03/frontend/tests/chat-responsive.test.tsx`:
  - Mobile viewport (<375px): Widget full-width
  - Tablet viewport (375-768px): Widget 70% width
  - Desktop viewport (≥768px): Widget 30% width
  - All viewports: Icon scales appropriately

- [ ] T031 Create ChatWidget E2E test in `phase_03/frontend/tests/chat-e2e.test.tsx`:
  - User logs in → ChatIcon visible
  - User clicks ChatIcon → ChatWidget opens
  - User types message → Message appears in list
  - Wait for response → Assistant message appears
  - Verify task created in background task list
  - User closes widget → Widget hidden

**Checkpoint**: ChatWidget fully functional and responsive. All tests passing.

---

## Phase 4: Validation & Cross-Cutting Concerns

**Purpose**: End-to-end verification, optimization, and final polish

**Completion Criteria**:
- All acceptance scenarios from 3 user stories passing
- Performance targets met (chat response <5s, history load <200ms)
- Security verified (JWT validation, no data leakage, no hardcoded secrets)
- Documentation complete

### Integration & Validation

- [ ] T032 Run full E2E workflow test:
  - User logs in
  - User accesses Home page
  - ChatIcon visible and clickable
  - User sends task creation command
  - Task appears in task list within 5 seconds
  - User sends task deletion command in Roman Urdu
  - Task deleted successfully
  - Chat history persists across page refresh

- [ ] T033 [P] Verify all success criteria from specification:
  - SC-001: GitHub sync zero diffs
  - SC-002: SQLModel models instantiate without ValueError
  - SC-003: ChatWidget displays #865A5B burgundy with glasmorphism
  - SC-004: Fully responsive (mobile/tablet/desktop)
  - SC-005: Authenticated chat creates tasks within 5 seconds
  - SC-006: Roman Urdu commands work correctly
  - SC-007: Unauthenticated users see locked ChatWidget
  - SC-008: OpenRouter timeout shows friendly error
  - SC-009: Conversation history persists across refresh
  - SC-010: SQLModel models work without errors

- [ ] T034 [P] Performance validation:
  - Chat response latency: <5s p95 (test with concurrent requests)
  - History load time: <200ms (measure database query time)
  - Conversation reconstruction: <500ms (measure context fetch + LLM init)
  - Frontend bundle size: <500KB increase (verify with `npm run analyze`)

- [ ] T035 [P] Security audit:
  - No hardcoded secrets in code (grep for OPENROUTER_API_KEY, SECRET_KEY)
  - JWT validation enforced (test 401 response without token)
  - User isolation verified (test 403 response with wrong user_id)
  - No data leakage (error messages don't expose API details or internal state)
  - Audit logging configured (all task operations logged with user_id)

### Documentation & Deployment

- [ ] T036 Update README with ChatWidget usage:
  - Feature description
  - Setup instructions for .env
  - OpenRouter API configuration
  - Example chat commands (English and Roman Urdu)

- [ ] T037 [P] Create deployment checklist:
  - Environment variables verified
  - Database migrations applied
  - Frontend build successful
  - Backend tests passing
  - E2E tests passing

- [ ] T038 [P] Create troubleshooting guide:
  - ChatWidget not appearing (auth issues, JS errors)
  - Chat responses slow (API timeout, database query issues)
  - Tasks not created from chat (intent parsing issues, MCP skill errors)
  - Responsive design broken (CSS missing, Tailwind config incorrect)

**Final Checkpoint**: All user stories complete. All tests passing. Production-ready.

---

## Task Summary by Category

| Category | Count | Parallel |
|----------|-------|----------|
| Phase 0: GitHub Sync | 9 | 6/9 |
| Phase 1: Database/Env | 6 | 4/6 |
| Phase 2: Chat API | 7 | 3/7 |
| Phase 3a: Frontend | 9 | 5/9 |
| Phase 4: Validation | 7 | 4/7 |
| **Total** | **38** | **22/38 (58%)** |

---

## Parallel Execution Examples

### Example 1: Phase 0 Parallelization
Once T001 (fetch origin) completes, tasks T002-T004 can run in parallel (independent file paths):
```
T001 (fetch)
  ├─ T002 (restore frontend/)
  ├─ T003 (restore app/)
  └─ T004 (restore hooks/)
```

### Example 2: Phase 1 Parallelization
Once foundational setup complete, database and env tasks run in parallel:
```
T010 (fix Conversation.py)
├─ T011 (fix Message.py)    [parallel]
├─ T013 (create .env template) [parallel]
└─ T014 (update imports)       [depends on T013]
```

### Example 3: Phase 2 & 3a Parallelization
Chat API (Phase 2) and ChatWidget frontend (Phase 3a) can develop in parallel once Phase 1 complete:
```
Phase 1 (Foundation) ✓
  ├─ Phase 2 (T016-T022): Backend API
  └─ Phase 3a (T023-T031): Frontend Widget [parallel]
```

---

## MVP Scope (Recommended First Iteration)

**Complete these tasks for working MVP**:
1. **Phase 0 (T001-T009)**: GitHub sync - establishes UI foundation
2. **Phase 1 (T010-T015)**: Database & env fixes - unblocks backend
3. **Phase 2 (T016-T022)**: Chat API - core functionality
4. **Phase 3a (T023-T028)**: ChatWidget basic - user can interact
5. **Phase 4 (T032-T033)**: Basic validation - verify it works

**Skip for MVP (defer to Phase 2)**:
- T029-T031: Detailed component tests (can add later)
- T034-T038: Performance/security hardening (not critical for MVP)

**This MVP scope**: ~2-3 weeks for small team, delivers full working feature

---

## Implementation Strategy

### Recommended Implementation Order

1. **Start with Phase 0** (GitHub sync) - creates foundation
2. **Parallelize Phase 1** (database/env) - no dependencies
3. **Run Phase 2 & 3a in parallel** (backend API + frontend components)
4. **Integration during Phase 3a** (ChatWidget calls chat API)
5. **Final validation in Phase 4** (comprehensive E2E testing)

### Branch Management

- All work on feature branch: `011-github-sync-chatbot`
- Commit frequently per task completion (T001, T002, etc.)
- Run tests after each task (ensure checkpoint met)
- Create PR to main after Phase 4 complete

### Testing Strategy

- **Contract tests (Phase 2)**: Validate API before frontend uses it
- **Component tests (Phase 3a)**: Validate UI rendering and interaction
- **E2E tests (Phase 4)**: Verify full workflow (login → chat → task creation)
- **Performance tests (Phase 4)**: Verify latency and concurrency targets

---

## Success Criteria (from Specification)

Each task completion contributes to these measurable outcomes:

- **SC-001**: GitHub sync (T001-T009) → Zero diffs in git
- **SC-002**: SQLModel fix (T010-T012) → No ValueError on instantiation
- **SC-003**: ChatIcon style (T023) → #865A5B burgundy visible
- **SC-004**: Responsive design (T030) → Works on mobile/tablet/desktop
- **SC-005**: Chat task creation (T021) → Tasks appear within 5s
- **SC-006**: Roman Urdu support (T018) → Intent parsing works
- **SC-007**: Auth enforcement (T023, T028) → Locked for unauth users
- **SC-008**: API error handling (T016) → Friendly errors shown
- **SC-009**: History persistence (T020, T026) → Survives refresh
- **SC-010**: SQLModel validation (T010-T012) → Models instantiate

---

**Status**: ✅ **READY FOR IMPLEMENTATION**

**Next**: Run `/sp.implement` to execute all tasks in order with checkpoints at each phase.
