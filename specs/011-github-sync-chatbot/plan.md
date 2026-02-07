# Implementation Plan: Synchronize GitHub and Implement OpenRouter AI Chatbot

**Branch**: `011-github-sync-chatbot` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/011-github-sync-chatbot/spec.md`

**Note**: Three-phase implementation plan combining GitHub UI synchronization, SQLModel fixes, and OpenRouter ChatWidget integration.

## Summary

This feature implements a complete GitHub synchronization workflow with SQLModel database fixes and an AI-powered ChatWidget for natural language task management. The system restores UI consistency from GitHub's authoritative phase_02 source, fixes SQLModel type validation errors, and integrates OpenRouter's LLM for English/Roman Urdu chat-driven task operations. The implementation spans three independent user stories (GitHub Recovery, Chat Interaction, Visual Design) that can be developed in parallel with proper coordination on shared components.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5.x + React (frontend, Next.js 14+)
**Primary Dependencies**:
- Backend: FastAPI, SQLModel, SQLAlchemy, OpenRouter API client, Pydantic
- Frontend: Next.js, React, Tailwind CSS, motion (Framer Motion)
- Database: PostgreSQL 14+
- Testing: pytest (backend), Jest/Vitest (frontend)

**Storage**: PostgreSQL (Neon or local) with SQLModel ORM for type-safe database access
**Testing**:
- Backend: pytest for unit/integration tests
- Frontend: Jest/Vitest for component and hook tests
- Contract: OpenAPI spec validation for API endpoints

**Target Platform**: Linux (development/deployment), modern browsers (desktop/mobile)
**Project Type**: Full-stack web application (Next.js frontend + FastAPI backend)
**Performance Goals**:
- Chat response latency: <5s p95
- History load time: <200ms
- Conversation reconstruction: <500ms
- Support 100+ concurrent users

**Constraints**:
- SQLModel type validation must pass without ValueError on `dict` types
- All user_id references validated against JWT token (multi-layer isolation)
- OpenRouter API timeout: <30s per request
- Frontend bundle size increase: <500KB with ChatWidget
- Responsive breakpoints: mobile (<375px), tablet (375-768px), desktop (≥768px)

**Scale/Scope**:
- 1-10k users (MVP)
- 40+ UI components restored from GitHub
- 3 independent user stories
- 13 functional requirements
- 10 success criteria

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Spec-Driven Development Principles** (from CLAUDE.md):
- ✅ **Clarify and plan first**: Specification complete (spec.md with 3 user stories, 13 FRs, 10 SCs)
- ✅ **Small, testable changes**: Each user story independently testable (GitHub sync, chat, visual design)
- ✅ **Code references precise**: All FRs reference specific files/models (Conversation, Message, ChatWidget)
- ✅ **No unrelated refactoring**: Changes limited to: UI sync, SQLModel fixes, ChatWidget, OpenRouter integration
- ✅ **Smallest viable diff**: No pre-emptive abstractions; only code needed for requirements

**Architecture Verification**:
- ✅ **Stateless context**: Conversation history reconstructed from database per request
- ✅ **Multi-tenant isolation**: JWT user_id validation at middleware → service → database
- ✅ **Error safety**: No hardcoded secrets; environment variables for OpenRouter key
- ✅ **Type safety**: SQLModel type hints for all database fields (Dict[str, Any] for JSON)
- ✅ **Responsive design**: Mobile/tablet/desktop breakpoints defined (375px, 768px thresholds)

**Security & Data Integrity**:
- ✅ **No data leakage**: Generic error messages; 401/403 responses without details
- ✅ **SQLModel validation**: Type hints prevent ValueError on dict fields
- ✅ **Multi-layer auth**: JWT → middleware → service → database queries by user_id
- ✅ **Audit trail**: All task operations logged with user_id and timestamp

**GATE STATUS**: ✅ **PASS** — All principles verified. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/011-github-sync-chatbot/
├── spec.md                      # Feature specification (complete)
├── plan.md                      # This file (implementation plan)
├── research.md                  # Phase 0: Research & unknowns resolution
├── data-model.md                # Phase 1: Data model and relationships
├── quickstart.md                # Phase 1: Quick start guide
├── contracts/                   # Phase 1: API contracts
│   └── chat-endpoint.openapi.yaml
├── checklists/
│   └── requirements.md          # Quality validation (16/16 items pass)
└── tasks.md                     # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
phase_03/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── conversation.py          # MODIFIED: Fix Dict[str, Any] type hints
│   │   │   ├── message.py               # MODIFIED: Fix Dict[str, Any] type hints
│   │   │   ├── task.py                  # REFERENCE: Extended for chat integration
│   │   │   └── user.py                  # REFERENCE: Existing auth
│   │   ├── services/
│   │   │   ├── chat_service.py          # NEW: OpenRouter LLM integration
│   │   │   ├── task_service.py          # REFERENCE: Existing CRUD
│   │   │   └── context_manager.py       # REFERENCE: Conversation history
│   │   ├── api/
│   │   │   └── chat.py                  # NEW: POST /api/{user_id}/chat endpoint
│   │   └── main.py                      # REFERENCE: FastAPI app
│   ├── tests/
│   │   ├── contract/
│   │   │   └── test_chat_endpoint.py    # NEW: API contract validation
│   │   ├── integration/
│   │   │   └── test_chat_workflow.py    # NEW: E2E chat workflow tests
│   │   └── unit/
│   │       ├── test_chat_service.py     # NEW: LLM integration tests
│   │       └── test_models.py           # MODIFIED: SQLModel type validation
│   ├── requirements.txt                 # REFERENCE: OpenRouter client, SQLModel
│   └── .env.example                     # REFERENCE: OpenRouter API key config
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── chat/
    │   │   │   ├── ChatWidget.tsx        # NEW: Chat interface component
    │   │   │   ├── ChatIcon.tsx          # NEW: Toggleable chat icon
    │   │   │   └── ChatMessages.tsx      # NEW: Message display
    │   │   ├── layout/
    │   │   │   ├── sidebar.tsx           # RESTORED: From GitHub phase_02
    │   │   │   ├── desktop-nav.tsx       # RESTORED: From GitHub phase_02
    │   │   │   └── mobile-nav.tsx        # RESTORED: From GitHub phase_02
    │   │   └── ui/
    │   │       └── [restored UI components from GitHub]
    │   ├── app/
    │   │   ├── globals.css               # RESTORED: Glasmorphism + burgundy theme
    │   │   ├── page.tsx                  # MODIFIED: Add ChatWidget to Home
    │   │   └── dashboard/layout.tsx      # REFERENCE: ChatWidget on dashboard
    │   ├── hooks/
    │   │   ├── useSidebarMode.ts         # RESTORED: From GitHub phase_02
    │   │   ├── use-chat.ts               # NEW: Chat state management
    │   │   └── useModalPortal.ts         # RESTORED: From GitHub phase_02
    │   ├── services/
    │   │   └── chatService.ts            # NEW: API client for /api/{user_id}/chat
    │   └── tailwind.config.ts            # RESTORED: Design tokens + glass effects
    │
    └── tests/
        ├── chat-widget.test.tsx          # NEW: Component rendering tests
        ├── chat-responsive.test.tsx      # NEW: Responsive design validation
        └── chat-auth.test.tsx            # NEW: Auth access control tests
```

**Structure Decision**: Full-stack web application with clear separation:
- **Backend**: FastAPI with SQLModel ORM; services layer for business logic; API routes for endpoints
- **Frontend**: Next.js with React components; Tailwind CSS for styling; hooks for state management
- **Sync Direction**: GitHub (source of truth) → local phase_02 → phase_03 (via copy)
- **Changes Scope**: Minimal — only files needed for 3 user stories (GitHub sync, chat, visual design)

## Complexity Tracking

✅ **NO VIOLATIONS** — Constitution Check passed. All complexity is justified by requirements.

---

## Phase 0: Research & Resolution

**Status**: ✅ **COMPLETE** — All technical decisions resolved with informed defaults.

### Research Tasks Completed

1. **GitHub Synchronization Strategy**
   - **Decision**: Use `git checkout origin/main -- phase_02/` to restore all files from authoritative source
   - **Rationale**: Ensures exact parity with GitHub; simple, reproducible, scriptable
   - **Alternatives**: Manual copy (error-prone), rsync (overkill), git merge (conflicts possible)
   - **Implementation**: Bash script in phase_03/backend/scripts/restore_github_ui.sh

2. **SQLModel Type Hint Resolution**
   - **Decision**: Use `Optional[Dict[str, Any]]` from typing module instead of lowercase `dict`
   - **Rationale**: SQLModel validates type hints at model definition; `dict` is Python builtin and invalid for SQLAlchemy column types
   - **Alternatives**: Use `json.JSONEncoder` (too verbose), `Any` (loses type info), `str` (requires serialization)
   - **Implementation**: Update Conversation.metadata and Message.tool_call_metadata field definitions

3. **OpenRouter LLM Integration**
   - **Decision**: Use OpenRouter Python SDK with fallback to generic HTTP client if SDK unavailable
   - **Rationale**: Simplest path with good error handling; no complex library dependencies
   - **Alternatives**: Direct REST calls (more boilerplate), LangChain (adds complexity), local LLM (offline only)
   - **Implementation**: chatService.py with configurable base URL and API key from .env

4. **ChatWidget Component Architecture**
   - **Decision**: Toggle icon (bottom-right, #865A5B) opens modal with message list + input form
   - **Rationale**: Matches existing UI patterns (TaskModal, AuthModals); glasmorphic styling consistent
   - **Alternatives**: Inline chat (too much screen space), sidebar chat (conflicts with existing sidebar), floating window (complex positioning)
   - **Implementation**: ChatWidget.tsx + ChatIcon.tsx + use-chat.ts hook

5. **Responsive Breakpoint Strategy**
   - **Decision**: Use Tailwind's sm (640px), md (768px), lg (1024px) breakpoints for mobile/tablet/desktop
   - **Rationale**: Aligns with existing Tailwind config; verified on phase_02 layouts
   - **Alternatives**: CSS media queries (less maintainable), custom breakpoints (breaks consistency)
   - **Implementation**: Tailwind classes on ChatWidget and ChatIcon components

6. **Conversation Context Reconstruction**
   - **Decision**: Stateless architecture: fetch conversation history from DB on every request
   - **Rationale**: Eliminates in-memory session state; survives service restarts; scales horizontally
   - **Alternatives**: Session storage (memory leaks), Redis (added complexity), browser storage (privacy concerns)
   - **Implementation**: ContextManager MCP tool reads Conversation + Message records from DB

7. **JWT User Isolation**
   - **Decision**: Validate user_id from JWT token against conversation.user_id in middleware + service + query filters
   - **Rationale**: Defense-in-depth; prevents accidental or malicious cross-user access
   - **Alternatives**: JWT alone (single point of failure), database-only (middleware layer missing)
   - **Implementation**: Auth middleware + ChatService method signature + SQLModel query by user_id

---

## Phase 1: Design & API Contracts

**Status**: ✅ **READY FOR IMPLEMENTATION** — Data models and API contracts defined.

### Data Model

**Entities to Create/Modify**:

#### Conversation (MODIFY)
```python
# Location: phase_03/backend/app/models/conversation.py

class Conversation(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    language_preference: str = Field(default="en")  # "en" or "ur"
    metadata: Optional[Dict[str, Any]] = Field(default=None)  # FIX: Changed from dict

    # Relationships
    messages: List["Message"] = Relationship(
        back_populates="conversation",
        cascade_delete=True
    )
```

**Changes**:
- Line 8: Change `metadata: Optional[dict]` to `metadata: Optional[Dict[str, Any]]`
- Add import: `from typing import Optional, List, Dict, Any`

#### Message (MODIFY)
```python
# Location: phase_03/backend/app/models/message.py

class Message(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    conversation_id: str = Field(foreign_key="conversation.id", index=True)
    role: str  # "user" or "assistant"
    content: str
    tool_call_metadata: Optional[Dict[str, Any]] = Field(default=None)  # FIX: Changed from dict
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    conversation: Conversation = Relationship(back_populates="messages")
```

**Changes**:
- Line 6: Change `tool_call_metadata: Optional[dict]` to `tool_call_metadata: Optional[Dict[str, Any]]`
- Add import: `from typing import Optional, Dict, Any`

#### Task (REFERENCE — extend if needed)
```python
# Location: phase_03/backend/app/models/task.py
# Existing model; extend to store original_command for chat context tracing
# Optional fields: original_command (str), created_via_chat (bool)
```

### API Contracts

#### Chat Endpoint (NEW)
**Endpoint**: `POST /api/{user_id}/chat`

**Request**:
```json
{
  "user_id": "uuid-string",
  "message": "Create a task called Review PR #123",
  "conversation_id": "uuid-string-or-null",
  "language_preference": "en" | "ur"
}
```

**Response (Success - 200)**:
```json
{
  "conversation_id": "uuid-string",
  "messages": [
    {
      "id": "uuid",
      "role": "user",
      "content": "Create a task called Review PR #123",
      "created_at": "2026-02-07T12:00:00Z"
    },
    {
      "id": "uuid",
      "role": "assistant",
      "content": "Created task: Review PR #123",
      "tool_call_metadata": {...},
      "created_at": "2026-02-07T12:00:01Z"
    }
  ],
  "task_created": true,
  "task_id": "uuid-string"
}
```

**Error Responses**:
- `401 Unauthorized`: No JWT token or invalid signature
- `403 Forbidden`: JWT user_id doesn't match {user_id} in path
- `400 Bad Request`: Missing message field or invalid conversation_id
- `500 Internal Server Error`: OpenRouter API failure (user-friendly message, no stack trace)

### Frontend Components

#### ChatWidget Component Structure
```
components/chat/
├── ChatWidget.tsx          # Main modal component (glasmorphic, responsive)
├── ChatIcon.tsx            # Toggle button (#865A5B burgundy, bottom-right)
└── ChatMessages.tsx        # Message list with scrolling
```

**Props/State**:
- `isOpen: boolean` — Modal visibility
- `messages: Message[]` — Conversation history
- `isLoading: boolean` — Waiting for API response
- `error: string | null` — Error message
- `userMessage: string` — Current input text

**Styling**:
- Background: Glassmorphic with backdrop-blur (from globals.css)
- Color: #865A5B burgundy for icon and accents
- Responsive: Mobile (full-width), tablet (70%), desktop (30%)

---

## Phase 2: Implementation Roadmap

**This section generated by `/sp.tasks` command** (next step after /sp.plan approval)

**Preview of expected task categories**:

1. **Infrastructure Setup** (2-3 tasks)
   - Set up GitHub sync script
   - Verify OpenRouter API connectivity
   - Configure environment variables

2. **Database Layer** (2-3 tasks)
   - Modify Conversation model (metadata field type fix)
   - Modify Message model (tool_call_metadata field type fix)
   - Run migrations and test instantiation

3. **Backend Services** (4-5 tasks)
   - Implement ChatService with OpenRouter integration
   - Create POST /api/{user_id}/chat endpoint
   - Add conversation history fetching (ContextManager)
   - Add error handling and graceful degradation
   - Write contract tests for API endpoint

4. **Frontend Components** (5-6 tasks)
   - Create ChatWidget.tsx (modal interface)
   - Create ChatIcon.tsx (toggle button with #865A5B color)
   - Create use-chat.ts hook (state management)
   - Implement responsive design (mobile/tablet/desktop)
   - Add authentication check (hide for unauthenticated users)
   - Restore UI files from GitHub phase_02

5. **Testing** (3-4 tasks)
   - API contract tests (21 scenarios)
   - E2E workflow tests (chat → task creation → task list update)
   - Responsive design validation (mobile/tablet/desktop viewports)
   - Auth enforcement tests (401/403 scenarios)

6. **Validation & Deployment** (2-3 tasks)
   - Verify `python reset_database.py` runs without errors
   - Browser testing (sidebar toggle, ChatWidget display, task creation)
   - Deploy and validate in staging environment

**Estimated Task Count**: 18-24 tasks (exact count from /sp.tasks output)

---

## Key Decisions Summary

| Decision | Chosen | Rationale |
|----------|--------|-----------|
| GitHub sync method | `git checkout origin/main -- phase_02/` | Exact parity, reproducible |
| SQLModel fix | Dict[str, Any] from typing | Valid for SQLAlchemy column validation |
| LLM provider | OpenRouter SDK + HTTP fallback | Simplest with good error handling |
| ChatWidget UI | Modal toggle (bottom-right) | Matches existing patterns |
| Responsive design | Tailwind breakpoints (md: 768px) | Consistent with phase_02 |
| Context reconstruction | Stateless (DB-fetched) | Survives restarts, scales horizontally |
| User isolation | Triple-layer validation | Defense-in-depth security |

---

## Success Metrics

**Ready for /sp.tasks when**:
- ✅ Specification complete and approved (spec.md with 3 user stories)
- ✅ Implementation plan created (this file)
- ✅ All technical decisions documented
- ✅ Data models and API contracts defined
- ✅ Project structure established
- ✅ Constitution check passed

**Next Step**: Run `/sp.tasks` to generate detailed, dependency-ordered task list for implementation.
