# Implementation Plan: Agentic AI Chatbot for Task Management

**Branch**: `010-chatbot-integration` | **Date**: 2026-02-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/phase_03/specs/010-chatbot-integration/spec.md`

## Summary

Implement a stateless, multi-language (English + Roman Urdu) chatbot on the Plannior dashboard that allows users to manage tasks via natural language. The system uses OpenAI Agents SDK (configured for OpenRouter) to orchestrate MCP tools (TaskToolbox, RomanUrduHandler, ContextManager) exclusively. Every request is stateless—conversation history is fetched from Neon PostgreSQL Conversation/Message tables on each invocation, processed by the LLM, and persisted back to the database. No in-memory state; all context sourced from DB per request.

## Technical Context

**Language/Version**: Python 3.11+ (FastAPI backend), TypeScript + Next.js 16+ (frontend)
**Primary Dependencies**: FastAPI, SQLModel, OpenAI Agents SDK (for OpenRouter), Official MCP SDK, Next.js, React, TailwindCSS
**Storage**: Neon PostgreSQL (Conversation, Message, Task, User tables with FK relationships)
**Testing**: pytest (backend), Vitest + React Testing Library (frontend), integration tests for MCP tool contracts
**Target Platform**: Linux server (FastAPI), web browser (Next.js)
**Project Type**: Web application (backend + frontend)
**Performance Goals**: Task creation <5s (p95), history load <2s, 95% NLP accuracy (English), 90% (Roman Urdu)
**Constraints**: Zero in-memory state (all context DB-sourced), user_id verification on every tool call, JWT auth required, no hardcoded secrets
**Scale/Scope**: Multi-tenant (user isolation via user_id), 10k+ concurrent users potential (stateless horizontal scaling), 3 primary user journeys (create task, Roman Urdu ops, history retrieval)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Evidence |
|-----------|-------------|--------|----------|
| **I. Stateless Architecture** | No in-memory state; all context from Neon PostgreSQL | ✅ PASS | Design: fetch history on every request, persist responses to DB, no session storage |
| **II. Tool-First Execution** | All tasks via MCP tools (TaskToolbox, ContextManager, RomanUrduHandler), never direct DB queries | ✅ PASS | Architecture: OpenAI Agents SDK orchestrates tool calls exclusively; no SQL in backend code |
| **III. Privacy & Isolation** | JWT-based user_id verification on every tool call; no cross-user data access | ✅ PASS | Design: middleware auth layer extracts user_id once, validates against session, passes to all tools; 100% rejection rate for unauthorized access |
| **IV. API Integration & Cost Efficiency** | OpenRouter API via OpenAI Agents SDK; centralized env-based config | ✅ PASS | Design: override SDK `base_url` to OpenRouter endpoint; `OPENROUTER_API_KEY` in .env |
| **V. User Experience & Clarity** | Friendly responses (English + Roman Urdu); seamless Dashboard integration; graceful error handling | ✅ PASS | Design: ChatKit-inspired UI (drawer/route), LLM generates conversational responses, immediate error messaging on API/auth failures |
| **VI. Data Integrity & Observability** | Conversation + Message tables in SQLModel; audit trails (timestamps, user IDs); MCP contract validation | ✅ PASS | Data Model: Conversation(id, user_id, created_at, updated_at), Message(id, conversation_id, role, content, created_at); integration tests verify state consistency |

✅ **All 6 principles verified. Proceeding to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
phase_03/specs/010-chatbot-integration/
├── spec.md                  # Feature specification (completed)
├── plan.md                  # This file
├── research.md              # Phase 0 output (TBD)
├── data-model.md            # Phase 1 output (TBD)
├── quickstart.md            # Phase 1 output (TBD)
├── contracts/               # Phase 1 output (TBD)
│   ├── openapi.yaml         # POST /api/{user_id}/chat endpoint schema
│   └── mcp-tools.md         # MCP tool contracts (TaskToolbox, ContextManager, RomanUrduHandler)
└── checklists/
    └── requirements.md      # Quality checklist (PASS)
```

### Source Code (Phase III repository)

```text
phase_03/
├── backend/
│   ├── app/
│   │   ├── main.py                           # FastAPI app initialization
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── chat.py                       # POST /api/{user_id}/chat endpoint
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── database.py                   # SQLAlchemy session config
│   │   │   ├── conversation.py               # Conversation SQLModel
│   │   │   └── message.py                    # Message SQLModel
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── agent_runner.py               # OpenAI Agents SDK orchestration
│   │   │   ├── mcp_tools.py                  # MCP tool initialization & binding
│   │   │   ├── context_manager.py            # ContextManager tool wrapper
│   │   │   └── chat_service.py               # Chat logic (history fetch, LLM call, persistence)
│   │   ├── middleware/
│   │   │   ├── __init__.py
│   │   │   └── auth.py                       # JWT extraction & user_id verification
│   │   └── config.py                         # Environment-based config (OPENROUTER_API_KEY, DB_URL, etc.)
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── test_chat_service.py          # Unit tests for chat logic
│   │   │   └── test_mcp_tools.py             # Unit tests for tool binding
│   │   ├── integration/
│   │   │   ├── test_chat_endpoint.py         # POST /api/{user_id}/chat integration tests
│   │   │   └── test_mcp_contracts.py         # MCP tool contract validation
│   │   └── contract/
│   │       └── test_openapi.py               # OpenAPI schema validation
│   └── requirements.txt                      # Backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ChatBot.tsx                   # Chatbot UI component (drawer/route)
│   │   ├── pages/ (or app/ for Next.js 13+)
│   │   │   └── dashboard.tsx                 # Dashboard with integrated chat
│   │   ├── services/
│   │   │   └── chatService.ts                # Frontend chat API client (passes JWT in headers)
│   │   └── styles/
│   │       └── chatbot.module.css            # Chat UI styling
│   └── tests/
│       └── components/
│           └── ChatBot.test.tsx              # ChatBot component tests
│
├── .env.example                              # Environment template
└── docker-compose.yml                        # (if needed for local dev)
```

**Structure Decision**: Web application (backend + frontend) selected. Backend uses FastAPI with layered architecture (API routes → services → models). Frontend uses Next.js with React components. Both share stateless principle: all state persists to Neon PostgreSQL.

## Phase 0: Research & Unknowns

**Status**: PENDING

**Research Tasks**:

1. **OpenRouter SDK Integration**: Verify OpenAI Agents SDK supports base URL override; identify any version constraints or known issues with OpenRouter compatibility.
2. **MCP SDK Best Practices**: Research Official MCP SDK integration patterns for FastAPI; confirm tool discovery and serialization mechanisms.
3. **SQLModel Relationships**: Research best practices for Conversation ↔ Message FK relationships; confirm cascading delete and lazy load behaviors.
4. **OpenAI Agents SDK Tool Binding**: Research how to register custom MCP tools (TaskToolbox, RomanUrduHandler, ContextManager) with OpenAI Agents SDK.
5. **Neon PostgreSQL Connection Pooling**: Research optimal pool configuration for stateless FastAPI service (min/max connections, timeout behavior).

**Output**: research.md (Phase 0 completion gate)

## Phase 1: Design & Contracts

**Prerequisites**: research.md complete; all unknowns resolved

### 1.1 Data Model (`data-model.md` - TBD)

**Entities**:

- **Conversation**: chat_id (UUID, PK), user_id (FK → User), created_at (datetime), updated_at (datetime), language_preference (str: "en" | "ur"), metadata (JSON, optional)
- **Message**: message_id (UUID, PK), conversation_id (FK → Conversation, cascade delete), role (str: "user" | "assistant"), content (text), tool_call_metadata (JSON, optional, stores tool name + args), created_at (datetime)
- **Task** (existing, extended): task_id (UUID, PK), user_id (FK → User), title (str), description (str, optional), due_date (date, optional), priority (str: "low"|"medium"|"high"), completed_at (datetime, optional)
- **User** (existing): user_id (UUID, PK), email (str, unique), password_hash (str), created_at (datetime), auth_tokens (relationship to JWT tokens if tracking)

**Relationships**:
- User 1:N Conversation (one user, many chat sessions)
- Conversation 1:N Message (one chat, many messages)
- User 1:N Task (one user, many tasks)
- Message has optional tool_call_metadata linking to Task operations

**State Transitions** (Conversation):
- NEW → ACTIVE (on first user message)
- ACTIVE → ACTIVE (subsequent messages)
- ACTIVE → ARCHIVED (after user action or timeout—Phase V enhancement)

**Validation Rules**:
- user_id required on all queries (enforced at middleware)
- role must be "user" or "assistant"
- conversation_id must exist before message insertion

### 1.2 API Contracts (`contracts/openapi.yaml` - TBD)

**Primary Endpoint**:

```yaml
POST /api/{user_id}/chat
  Headers:
    Authorization: Bearer <JWT_TOKEN>
    Content-Type: application/json
  Path Parameters:
    user_id: UUID (validated against JWT token)
  Request Body:
    {
      "conversation_id": "UUID | null (null = create new conversation)",
      "message": "string (user input)",
      "language_hint": "en | ur (optional, defaults to en)"
    }
  Response (200):
    {
      "conversation_id": "UUID",
      "assistant_message": "string (LLM response)",
      "tool_calls": [
        {
          "tool_name": "string (add_task, delete_task, etc.)",
          "tool_args": "JSON",
          "tool_result": "JSON or string"
        }
      ],
      "messages": [
        {
          "message_id": "UUID",
          "role": "user | assistant",
          "content": "string",
          "created_at": "ISO8601"
        }
      ]
    }
  Response (401):
    { "error": "Unauthorized", "detail": "Invalid or missing JWT token" }
  Response (400):
    { "error": "Bad Request", "detail": "Invalid conversation_id or message format" }
  Response (500):
    { "error": "Service Unavailable", "detail": "I'm temporarily unavailable, please try again later" }
```

**Secondary Endpoints** (Phase 2):

- `GET /api/{user_id}/conversations` - List user's conversations
- `GET /api/{user_id}/conversations/{conversation_id}` - Get conversation history

### 1.3 MCP Tool Contracts (`contracts/mcp-tools.md` - TBD)

**MCP Tools Orchestrated by OpenAI Agents SDK**:

1. **TaskToolbox**: add_task, delete_task, complete_task, list_tasks, update_task (existing; must verify user_id parameter on all calls)
2. **RomanUrduHandler**: parse_urdu_intent → returns operation + parameters; generate_urdu_response → returns Roman Urdu text
3. **ContextManager**: fetch_chat_history(conversation_id, user_id, max_messages=15) → returns list of Message objects; summarize_context(messages[]) → returns summarized text if token limit approaching

**Tool Invocation Pattern**:
- OpenAI Agents SDK calls tools via standard MCP interface
- All tools receive user_id parameter for authorization check
- Tool results serialized to JSON and returned to LLM for response synthesis

### 1.4 Quickstart (`quickstart.md` - TBD)

**Local Development Setup**:

1. **Prerequisites**: Python 3.11+, PostgreSQL (or Neon connection), Node.js 18+
2. **Backend Setup**:
   ```bash
   cd phase_03/backend
   python -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   export DATABASE_URL=postgres://user:pass@localhost/todo_phase3
   export OPENROUTER_API_KEY=<your_key>
   uvicorn app.main:app --reload
   ```
3. **Frontend Setup**:
   ```bash
   cd phase_03/frontend
   npm install
   npm run dev
   ```
4. **Test Chatbot**:
   - Navigate to Dashboard (http://localhost:3000/dashboard)
   - Click "Chat" drawer
   - Type "buy milk tomorrow" → system should call add_task("buy milk", due_date="tomorrow")
   - Type "Mera task delete kar do" → system should call delete_task with extracted task reference
   - Refresh page → conversation history should load from DB

### 1.5 Agent Context Update

**Pending**: Run `./.specify/scripts/bash/update-agent-context.sh claude` to register new FastAPI endpoints, SQLModel schemas, and MCP tool bindings in agent context files.

## Phase 2: Tasks & Implementation Units

**Pending**: Generated by `/sp.tasks` command (NOT created by `/sp.plan`)

---

## Next Steps

1. ✅ Phase 0: Research Phase (resolve unknowns)
2. ⏳ Phase 1: Design Phase (generate research.md, data-model.md, contracts/, quickstart.md)
3. ⏳ Phase 2: Tasks Phase (generate tasks.md with implementation units)
4. ⏳ Phase 3: Implementation (red/green/refactor cycles)

**Recommended Command**: `sp.plan` Phase 0 research dispatch (or run `/sp.tasks` if research outcomes are deferred to planning discussions).
