---
id: 0008
title: Orchestration and persistence planning
stage: plan
date: 2026-02-08
surface: agent
model: claude-haiku-4-5-20251001
feature: 014-agentic-chatbot
branch: 014-agentic-chatbot
user: amrahaanwar
command: /sp.plan
labels: ["orchestration", "mcp-tools", "persistence", "architecture"]
links:
  spec: /mnt/d/todo-evolution/phase_03/specs/014-agentic-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - phase_03/specs/014-agentic-chatbot/plan.md
tests:
  - None (planning phase, no tests)
---

## Prompt

1. Orchestration:

 - Bind the 'TaskToolbox' MCP tools to the OpenAI Agents SDK 'AgentRunner'.

 - Ensure 'tool_choice' is set to 'auto' to force the LLM to use tools for task actions.

2. Skills & Sub-Agents:

   - TaskToolbox Skill: Handles the SQLModel session and DB transactions.

   - RomanUrduHandler Sub-Agent: Intercepts Urdu input and extracts entities for tools.

3. Persistence Layer:

   - Implement a 'contextManager' to fetch the last 10 messages from the database before each agent turn.

## Response snapshot

Generated comprehensive Phase 1 architecture plan with explicit orchestration directives:

**1. Orchestration (AgentRunner)**:
- Bind TaskToolbox MCP tools to OpenAI Agents SDK with `tool_choice='auto'`
- Forces LLM to use tools; no fallback to text responses
- 10-step request flow diagram from user input to frontend updates
- Page refresh re-hydration from Message table with zero data loss

**2. Skills & Sub-Agents**:
- **TaskToolbox Skill**: SQLModel session lifecycle + explicit `session.commit()` after every tool execution
- **RomanUrduHandler Sub-Agent**: Intercepts Urdu patterns ("Mera task add kardo"), extracts operation + parameters (title, priority, due_date)
- **ContextManager**: Fetch last 10 messages from database before each agent turn
- **ChatKit-Integrator**: Frontend-backend API bridge

**3. Persistence Layer**:
- ContextManager retrieves conversation history from 'Message' table
- Re-hydration on page refresh: SELECT * FROM messages WHERE user_id=? ORDER BY timestamp DESC LIMIT 10
- Explicit session.commit() after task operations AND message persistence
- Zero data loss guarantee with ACID transactions

**Key Architecture Rules**:
- tool_choice='auto' (OpenAI Agents API parameter)
- No direct DB access from agent code (only via TaskToolbox)
- Explicit session.commit() after every tool execution
- Context retrieval BEFORE LLM inference
- Confirmation messages ONLY after session.commit() succeeds
- 3-layer user isolation (JWT + WHERE filter + MCP validation)
- Stateless: ALL state from Neon DB

**Project Structure**:
- Backend: FastAPI with AgentRunner, MCP tools, SQLModel entities, JWT auth
- Frontend: React with ChatWidget, TaskList, real-time sync
- Tests: Unit (tools, queries), Contract (MCP schemas, API), Integration (full flows, persistence, isolation)

**Phase 0 → 1 → 2**:
- Phase 0: Research MCP Python SDK, SQLModel patterns, asyncpg pooling
- Phase 1: Data model, contracts, quickstart
- Phase 2: Tasks, Red-Green-Refactor implementation

## Outcome

- ✅ Impact: Clear orchestration blueprint with tool_choice='auto', explicit session.commit(), and re-hydration pattern. Four sub-agents well-defined with independent responsibilities. Stateless architecture with full context retrieval before each agent turn.
- 🧪 Tests: Plan ready for Phase 0 research (no violations detected, SDD standards applied, Constitution Check PASS)
- 📁 Files: Updated phase_03/specs/014-agentic-chatbot/plan.md (version 2.0) with 10-step orchestration flow, technical context, project structure, and next steps
- 🔁 Next prompts: /sp.tasks to generate test-first implementation tasks based on this plan
- 🧠 Reflection: Successfully operationalized user requirements (TaskToolbox exclusive, RomanUrduHandler, session.commit(), re-hydration) into concrete architecture with enforcement rules, flow diagram, and gate criteria

## Evaluation notes (flywheel)

- Failure modes observed: None; orchestration clearly specified with explicit rules table
- Graders run and results (PASS/FAIL): Constitution Check PASS (no violations detected)
- Prompt variant (if applicable): null
- Next experiment: Execute /sp.tasks to break plan into Red-Green-Refactor task cycles with acceptance criteria linked to user stories
