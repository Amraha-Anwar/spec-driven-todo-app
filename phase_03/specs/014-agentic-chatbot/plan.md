# Implementation Plan: Phase III Agentic Chatbot with Persistent Task Management

**Branch**: `014-agentic-chatbot` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Status**: Phase 1 Design (ready for research)

## Summary

Enable persistent task management using MCP Tools and Sub-Agents with three key architectural directives:

1. **Orchestration**: Bind TaskToolbox MCP tools to OpenAI Agents SDK with `tool_choice='auto'` to force LLM tool usage for all task operations
2. **Skills & Sub-Agents**: TaskToolbox Skill (SQLModel session management), RomanUrduHandler Sub-Agent (Urdu intent parsing and parameter extraction)
3. **Persistence Layer**: Implement ContextManager to fetch last 10 messages from database before each agent turn; explicit `session.commit()` after every successful tool execution

The backend (FastAPI) orchestrates stateless requests with full context retrieval from Neon DB. Every task operation routes exclusively through TaskToolbox, Roman Urdu input routes through RomanUrduHandler, and conversation history re-hydrates from the 'Message' table on browser refresh with zero data loss.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5.0+ (frontend)
**Primary Dependencies**:
- Backend: FastAPI 0.104+, SQLModel 0.0.14+, Official MCP SDK, OpenAI Agents SDK, OpenRouter API client
- Frontend: Next.js 16+, React 18+, TypeScript, TailwindCSS

**Storage**: Neon PostgreSQL with connection pooling; SQLModel ORM for session management
**Testing**: pytest (backend), Vitest/Jest (frontend), integration tests for MCP contract validation
**Target Platform**: Web application (Linux server backend, modern browser frontend)
**Project Type**: Full-stack web application (backend + frontend)
**Performance Goals**:
- Chat response latency: <3 seconds (database round-trip + LLM inference + tool execution)
- Task List UI update: <2 seconds after chat action
- Support 100+ concurrent users per instance

**Constraints**:
- Stateless server (no in-memory session state)
- JWT-based authentication for user isolation
- MCP tool calls for all database operations (no direct SQL from agent)
- Graceful handling of database connection failures

**Scale/Scope**:
- MVP: 5 core user stories (P1 features), 10 success criteria
- Database: 3 main entities (Task, Message, ChatSession)
- MCP tools: ~8 core tools (add_task, delete_task, update_task, list_tasks, complete_task, get_message_history, store_message, create_session)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase III Agentic AI Chatbot Constitution Compliance

✅ **I. Stateless Architecture**
- Design commits to NO in-memory state; all context persists to Neon PostgreSQL
- ContextManager MCP tool enforces last 10 messages context retrieval on every LLM turn
- **Status**: PASS – Plan explicitly retrieves history from DB before agent evaluation

✅ **II. Tool-First Execution**
- All task CRUD flows through MCP tools (TaskToolbox); agent never uses direct DB queries
- Four sub-agents (TaskToolbox, RomanUrduHandler, ContextManager, ChatKit-Integrator) isolate concerns
- **Status**: PASS – Plan mandates tool-based execution exclusively

✅ **III. Privacy & Isolation**
- JWT token verification required for all requests; user_id extracted from session
- ContextManager and TaskToolbox verify user_id in tool invocations
- **Status**: PASS – Plan includes user_id validation in all MCP tool contracts

✅ **IV. API Integration & Cost Efficiency**
- OpenAI Agents SDK orchestrates LLM calls with OpenRouter backend
- Environment-based configuration for API keys (no hardcoding)
- **Status**: PASS – Architecture specifies OpenRouter + Agents SDK

✅ **V. User Experience & Clarity**
- Assistant provides friendly confirmation after each tool execution
- English + Roman Urdu support via RomanUrduHandler sub-agent
- **Status**: PASS – Spec requires multi-language support and friendly confirmations

✅ **VI. Data Integrity & Observability**
- Conversation and Message tables in SQLModel for persistent chat history
- All interactions timestamped and user_id tracked
- **Status**: PASS – Plan includes SQLModel entities and audit trail design

### Gates Summary
- ✅ All 6 core principles satisfied
- ✅ No principle violations
- ✅ Proceed to Phase 0 research

## Project Structure

### Documentation (this feature)

```text
phase_03/specs/014-agentic-chatbot/
├── spec.md                  # Feature specification (requirements, user stories, success criteria)
├── plan.md                  # This file (architectural design)
├── research.md              # Phase 0 output (technology choices, best practices)
├── data-model.md            # Phase 1 output (database entities, relationships)
├── quickstart.md            # Phase 1 output (setup and integration guide)
├── contracts/               # Phase 1 output (API schemas, MCP tool contracts)
│   ├── openapi.yaml         # REST API endpoints (POST /api/{user_id}/chat, etc.)
│   ├── mcp-tools.json       # MCP tool definitions (TaskToolbox, ContextManager, RomanUrduHandler)
│   └── models.json          # Data models (Task, Message, ChatSession)
├── checklists/
│   └── requirements.md      # Quality validation checklist (12/12 items pass)
└── tasks.md                 # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code Structure (Phase III)

```text
# Web Application (backend + frontend)

backend/
├── src/
│   ├── models/                       # SQLModel entities
│   │   ├── task.py                   # Task model
│   │   ├── message.py                # Message/Conversation model
│   │   └── chat_session.py           # ChatSession model
│   ├── services/
│   │   ├── agent_runner.py           # OpenAI Agents SDK orchestration
│   │   ├── chat_service.py           # Chat endpoint logic
│   │   ├── mcp_tools.py              # MCP tool implementations
│   │   ├── task_toolbox.py           # Task CRUD MCP tool
│   │   ├── context_manager.py        # Message history retrieval MCP tool
│   │   ├── roman_urdu_handler.py     # Language translation MCP tool
│   │   └── chatkit_integrator.py     # Frontend-backend integration
│   ├── api/
│   │   ├── chat.py                   # Chat endpoint (POST /api/{user_id}/chat)
│   │   ├── health.py                 # Health check endpoint
│   │   └── auth.py                   # JWT validation middleware
│   └── main.py                       # FastAPI application entry point
│
├── tests/
│   ├── unit/
│   │   ├── test_task_toolbox.py      # MCP tool unit tests
│   │   ├── test_context_manager.py   # Context retrieval tests
│   │   └── test_roman_urdu_handler.py
│   ├── integration/
│   │   ├── test_chat_flow.py         # End-to-end chat flow tests
│   │   └── test_tool_execution.py    # MCP tool execution tests
│   └── contract/
│       └── test_mcp_contracts.py     # MCP tool contract validation
│
├── requirements.txt                   # Python dependencies
└── .env.example                      # Environment variables template

frontend/
├── src/
│   ├── components/
│   │   ├── ChatWidget.tsx            # Chat interface component
│   │   ├── TaskList.tsx              # Task list display component
│   │   └── ChatMessage.tsx           # Single message component
│   ├── pages/
│   │   └── chat.tsx                  # Chat page (protected route)
│   ├── services/
│   │   └── chatApi.ts                # Chat API client service
│   ├── hooks/
│   │   ├── useChat.ts                # Chat message state management
│   │   └── useTasks.ts               # Task state management
│   └── lib/
│       ├── auth.ts                   # JWT token handling
│       └── api.ts                    # API client configuration
│
└── tests/
    ├── unit/
    │   └── ChatWidget.test.tsx
    └── integration/
        └── chatFlow.test.tsx

database/
├── migrations/
│   └── 001_init_conversation_tables.sql   # SQL for Message, Conversation, ChatSession
└── schema.sql                              # Full schema reference
```

**Structure Decision**: Full-stack web application (Option 2) with separated backend (FastAPI + SQLModel) and frontend (Next.js + React). Backend hosts Chat Endpoint and MCP Server. Frontend reuses Phase II design system (TailwindCSS). Database schema extends existing Phase II task model with Message and Conversation tables for chat persistence.

## Architectural Design (Phase 1)

### Data Flow Architecture

```
User Input (Chat Message)
    ↓
[FastAPI Chat Endpoint] POST /api/{user_id}/chat
    ↓
[JWT Validation] Verify user session token → extract user_id
    ↓
[ContextManager Tool] Fetch last 10 messages from DB
    ↓
[OpenAI Agents SDK] Initialize agent with:
    - System prompt (multi-language support, task management domain)
    - MCP tools schema (TaskToolbox, RomanUrduHandler)
    - User message + conversation context
    ↓
[Agent Loop] Parse intent → determine which tool to call
    ├─ User says "Add task": → TaskToolbox.add_task()
    ├─ User says "Mark done": → TaskToolbox.complete_task()
    ├─ User says "Mera task...": → RomanUrduHandler.parse() → TaskToolbox.xxx()
    └─ User says "Show tasks": → TaskToolbox.list_tasks()
    ↓
[MCP Tool Execution] Tool validates user_id, executes on Neon DB
    ↓
[Response Generation] Agent composes friendly confirmation message
    ↓
[Message Persistence] Store user message + assistant response in Message table
    ↓
[WebSocket/Polling] Push response to frontend (ChatWidget updates)
    ↓
[UI Update] Task List component polls /api/{user_id}/tasks (or WebSocket) → renders updated tasks
    ↓
Response returned to user with status 200 + JSON
```

### Core Components

#### 1. FastAPI Backend (`backend/src/main.py`)
- Hosts Chat Endpoint: `POST /api/{user_id}/chat`
- Hosts MCP Server for tool definitions
- Middleware: JWT token validation, user isolation
- Health checks for monitoring

#### 2. OpenAI Agents SDK Integration (`backend/src/services/agent_runner.py`)
- Initializes agent with system prompt (English + Roman Urdu support)
- Configures MCP tools for agent to call
- Manages agent loop (parse input → call tools → generate response)
- Handles rate limiting and error scenarios

#### 3. MCP Tools (4 Sub-agents)

**TaskToolbox** (`backend/src/services/task_toolbox.py`)
- Implements: add_task, delete_task, update_task, list_tasks, complete_task
- Input: user_id (from JWT), task details (title, priority, due_date, etc.)
- Validation: Task title is required; priority/due_date optional with defaults
- Output: JSON response with created/updated task; error messages with user guidance

**ContextManager** (`backend/src/services/context_manager.py`)
- Fetches last 10 messages from Message table
- Query: `SELECT * FROM message WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10`
- Returns: Array of message objects with role (user/assistant) and content
- Handles early conversations (<10 messages) gracefully

**RomanUrduHandler** (`backend/src/services/roman_urdu_handler.py`)
- Parses Roman Urdu commands (e.g., "Mera task add kardo: title")
- Maps to English operations: "add_task", "delete_task", "complete_task", "list_tasks"
- Extracts task details from Urdu input (title, priority patterns)
- Returns structured intent for TaskToolbox

**ChatKit-Integrator** (`backend/src/services/chatkit_integrator.py`)
- Handles request/response mapping between frontend and backend
- Formats assistant responses for frontend display
- Manages WebSocket/polling for real-time Task List updates
- Injects chat context into RootLayout component

#### 4. SQLModel Entities (`backend/src/models/`)
- **Task**: id, user_id, title, description, status, priority, due_date, created_at, updated_at
- **Message**: id, user_id, role (user/assistant), content, timestamp, session_id
- **ChatSession**: id, user_id, created_at, last_activity, context_token_count

#### 5. Frontend Chat Component (`frontend/src/components/ChatWidget.tsx`)
- Text input field for user messages
- Message display area (user messages right-aligned, assistant left-aligned)
- Call to chatApi.postMessage() on submit
- Real-time Task List integration (reflects task changes from chat actions)
- Language selector (English / Roman Urdu) if user preferences

### Key Technical Decisions

1. **Stateless Request Handling**: Every POST /api/{user_id}/chat retrieves full context from DB (last 10 messages). No session object persists between requests. Enables horizontal scaling and recovery from restarts.

2. **MCP Tools for All Database Operations**: Agent never queries DB directly. All CRUD flows through tool calls. Enforces access control, maintains audit trail, ensures user_id validation.

3. **OpenRouter + Agents SDK**: Provides flexibility across LLM models and cost optimization. Agents SDK handles tool calling orchestration without hardcoding provider specifics.

4. **Multi-Language Support**: RomanUrduHandler parses Roman Urdu input and maps to TaskToolbox. Assistant responses support both languages via prompt engineering.

5. **Real-Time UI Sync**: WebSocket (preferred) or polling mechanism ensures Task List updates <2 seconds after chat action. TaskWidget and TaskList components share state via context or shared API calls.

### Integration Points

**Frontend ↔ Backend**:
- Chat input: `POST /api/{user_id}/chat` with message content
- Task list sync: WebSocket event OR periodic polling of `/api/{user_id}/tasks`
- Authentication: JWT token in Authorization header

**Backend ↔ Neon DB**:
- SQLModel session manager for connection pooling
- Transactions for message persistence + task updates
- Indices on (user_id, timestamp) for fast message queries

**Agent ↔ MCP Tools**:
- Agents SDK calls tools by name and arguments
- Tool responses formatted as JSON
- Error handling returns user-friendly messages

### Error Handling Strategy

| Scenario | Handler | User Message |
|----------|---------|--------------|
| Invalid task ID | TaskToolbox | "I couldn't find that task. Here are your current tasks: ..." |
| Database unavailable | Chat Service | "I'm having trouble connecting. Please try again in a moment." |
| Malformed Roman Urdu | RomanUrduHandler | "I didn't quite understand that. Try: 'Mera task add kardo: [title]'" |
| User unauthorized | JWT Middleware | 401 Unauthorized (no data exposure) |
| Task title empty | TaskToolbox | "I need a task title. What would you like to add?" |
| Agent timeout | Agent Runner | "That's taking longer than expected. Please try again." |

## Complexity Tracking

> **No constitution violations. All architecture decisions align with core principles.**

**Justification Summary**:
- Four sub-agents (TaskToolbox, ContextManager, RomanUrduHandler, ChatKit-Integrator) are necessary to separate concerns and enforce tool-based access patterns (Constitutional Principle II).
- Stateless request handling with context retrieval enforces Principle I (no in-memory state).
- MCP tool contract enforcement ensures Principle II (tool-first execution) and Principle III (privacy/isolation via user_id validation).
- No violations require additional justification.
