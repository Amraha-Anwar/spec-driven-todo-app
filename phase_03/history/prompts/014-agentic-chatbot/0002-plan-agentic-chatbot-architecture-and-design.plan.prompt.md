---
id: 0002
title: Plan agentic chatbot architecture and design
stage: plan
date: 2026-02-08
surface: agent
model: claude-haiku-4-5-20251001
feature: 014-agentic-chatbot
branch: 014-agentic-chatbot
user: amrahaanwar
command: /sp.plan
labels: ["architecture","design","planning","mcp-tools","fastapi","agents-sdk"]
links:
  spec: /mnt/d/todo-evolution/phase_03/specs/014-agentic-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - /mnt/d/todo-evolution/phase_03/specs/014-agentic-chatbot/plan.md
  - /mnt/d/todo-evolution/phase_03/specs/014-agentic-chatbot/research.md
  - /mnt/d/todo-evolution/phase_03/specs/014-agentic-chatbot/data-model.md
  - /mnt/d/todo-evolution/phase_03/specs/014-agentic-chatbot/contracts/api-endpoints.md
  - /mnt/d/todo-evolution/phase_03/specs/014-agentic-chatbot/quickstart.md
tests:
  - Constitution Check: All 6 principles PASS
  - Technical Context: Fully populated with no NEEDS CLARIFICATION markers
  - Phase 0 Research: Technology decisions documented
  - Phase 1 Design: Data model, API contracts, quickstart guide generated
---

## Prompt

Architecture:

- Backend: FastAPI serves as the host for the Chat Endpoint and the MCP Server.

- Models: Use SQLModel for Conversation and Message persistence.

- Logic: Implement 4 specific Agent Skills/Sub-agents:

  1. TaskToolbox: Handles CRUD logic for the database.

  2. chatkit-integrator: Manages the frontend-backend communication.

  3. RomanUrduHandler: Translates/Interprets Urdu intents for the TaskToolbox.

  4. contextManager: Fetches the 10-message sliding window from the DB.



Data Flow:

1. POST /api/{user_id}/chat received.

2. contextManager fetches history from DB.

3. OpenAI Agent evaluates input against MCP Tools (add_task, list_tasks, etc.).

4. Agent executes the tool; TaskToolbox updates Neon DB.

5. Response is stored and returned to the UI.

## Response snapshot

Completed comprehensive Phase III Agentic Chatbot implementation plan with:

**Phase 0 Research (COMPLETE)**:
- OpenAI Agents SDK best practices documented with system prompt design
- MCP tool contracts fully specified (5 TaskToolbox operations, 2 ContextManager, 1 RomanUrduHandler)
- SQLModel + Neon PostgreSQL integration patterns with connection pooling strategy
- Real-time synchronization architecture (WebSocket primary + polling fallback)
- Roman Urdu language processing via pattern matching + LLM fallback
- FastAPI stateless architecture patterns validated against Constitution

**Phase 1 Design (COMPLETE)**:

1. **plan.md** - 200+ line implementation plan including:
   - Summary of feature scope and multi-agent architecture
   - Full technical context: Python 3.11, FastAPI, SQLModel, Neon PostgreSQL, OpenAI Agents SDK
   - Constitution Check: All 6 core principles PASS with detailed compliance mapping
   - Project structure for web application (frontend + backend + database)
   - Architectural design with data flow diagram, core components, 4 sub-agents, SQLModel entities
   - Key technical decisions documented (stateless patterns, tool-first, OpenRouter, multi-language)
   - Integration points between frontend/backend/database/agent
   - Error handling strategy with user-friendly messages

2. **research.md** - 400+ line research consolidation:
   - 6 major research areas fully resolved (no NEEDS CLARIFICATION)
   - Technology decisions with options considered and rationale
   - MCP tool contracts with complete input/output schemas
   - Database schema with Neon-optimized indexes
   - Connection pooling and transaction management
   - WebSocket + polling fallback strategy for real-time sync
   - Roman Urdu pattern-based parsing with 5 core patterns documented
   - FastAPI stateless request-scoped context retrieval pattern

3. **data-model.md** - 350+ line entity design:
   - 4 entities fully specified: User (existing), Task (extended), Conversation (new), Message (new)
   - 21 fields total with validation rules, constraints, indexes
   - SQLModel Python definitions with type hints and defaults
   - Query patterns for common operations (get tasks, fetch history)
   - Migration strategy with backward-compatible SQL
   - Data integrity constraints (referential, check, NOT NULL)
   - Performance considerations with index strategy
   - Schema diagram showing relationships

4. **contracts/api-endpoints.md** - 500+ line API specification:
   - 3 main endpoints: POST /api/{user_id}/chat, GET /api/{user_id}/tasks, WebSocket /ws/{user_id}
   - Full OpenAPI 3.0 contract with request/response schemas
   - 5 MCP tool contracts with input validation, output formats, error handling
   - Error codes (400, 401, 403, 404, 409, 500, 503) with meanings
   - Rate limiting strategy (planned for Phase 2)
   - CORS policy and versioning strategy
   - Performance targets: <3 sec p95 for chat, <1 sec for task list

5. **quickstart.md** - 450+ line setup and validation guide:
   - Backend setup: Python venv, pip install, environment configuration
   - Database initialization with manual migration fallback
   - Frontend ChatWidget component (300+ line React/TypeScript)
   - Chat page integration and RootLayout updates
   - Configuration for both frontend and backend
   - 5 comprehensive end-to-end validation tests with expected results
   - Deployment checklist (Phase 1, 2, 3 gates)
   - Troubleshooting guide for common issues

## Outcome

- ✅ Impact: Complete architectural blueprint enabling independent Phase 2 implementation (task generation and execution)
- 🧪 Tests: Constitution Check passes all 6 principles; no implementation blockers
- 📁 Files: 5 major artifacts created (plan.md, research.md, data-model.md, api-endpoints.md, quickstart.md) totaling 1600+ lines
- 🔁 Next prompts: /sp.tasks (generate detailed task list), /sp.implement (execute task-by-task), /sp.git.commit_pr (version and PR)
- 🧠 Reflection: User-provided architecture (4 sub-agents: TaskToolbox, ContextManager, RomanUrduHandler, ChatKit-Integrator) aligns perfectly with Constitution principles. Stateless pattern enforced via context retrieval on every request. MCP tool contracts fully designed for Agents SDK integration. Research phase resolved all technical unknowns (WebSocket vs polling, Roman Urdu parsing strategy, connection pooling for Neon). Design artifacts provide exact schemas, migrations, and implementation guidelines. Plan is immediately actionable for Phase 2 task generation.

## Evaluation notes (flywheel)

- Failure modes observed: None - all gates passed, no constitution violations
- Graders run and results (PASS/FAIL): PASS - Constitution check (6/6 principles), Technical context (fully populated), Research phase (all unknowns resolved), Phase 1 design (5 artifacts complete with high fidelity)
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Run /sp.tasks to generate implementation tasks with dependencies and time estimates; then review generated task breakdown before proceeding to /sp.implement
