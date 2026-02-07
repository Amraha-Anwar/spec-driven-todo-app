---
id: 0003
title: Create implementation plan for GitHub sync and chatbot
stage: plan
date: 2026-02-07
surface: agent
model: claude-haiku-4-5-20251001
feature: 011-github-sync-chatbot
branch: 011-github-sync-chatbot
user: amrahaanwar
command: /sp.plan --args "Sync strategy for GitHub recovery, SQLModel fixes, ChatWidget implementation"
labels: ["implementation-plan", "github-sync", "sqlmodel-fixes", "openrouter-integration", "chatwidget"]
links:
  spec: /mnt/d/todo-evolution/specs/011-github-sync-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/011-github-sync-chatbot/plan.md
tests:
  - None yet (implementation phase)
---

## Prompt

Create: A sync strategy for GitHub recovery, SQLModel fixes, and ChatWidget implementation.

Technical Details:
- Sync Strategy: 1. Fetch the latest from GitHub: `git fetch origin`. 2. Restore phase_02 locally: `git checkout origin/main -- phase_02/`. 3. Compare `/phase_02` with `/phase_03` and copy missing UI/Layout files to `/phase_03`.
- Database Fixes: Rename 'metadata' field to 'context_data' in the Conversation model. Apply `sa_column=Column(JSON)` from SQLAlchemy to all dictionary fields to fix the "no matching SQLAlchemy type" error.
- OpenRouter Config: Set up the Chat endpoint using variables strictly from `/phase_03/backend/.env`.
- Frontend UI: Implement a responsive ChatWidget with a toggle icon on the Home page.

Validation Strategy:
- Verify Sidebar and Layout fixes are active in the local browser.
- Ensure 401 Unauthorized is returned for chat requests without a valid JWT.

## Response snapshot

Created comprehensive 400+ line implementation plan (plan.md) with:

- **Technical Context**: Python 3.11 backend, TypeScript/React frontend, PostgreSQL storage, pytest/Jest testing
- **Constitution Check**: ✅ PASS (all SDD principles verified; no violations)
- **Project Structure**: Full-stack web app layout with clear backend/frontend/tests organization; file-by-file changes mapped
- **Phase 0 Research**: 7 research tasks completed with decisions on GitHub sync, SQLModel fixes, OpenRouter integration, ChatWidget architecture, responsive design, context reconstruction, JWT isolation
- **Phase 1 Design**: Data models (Conversation, Message with Dict[str, Any] fixes) and API contracts defined (POST /api/{user_id}/chat with request/response schemas and error handling)
- **Phase 2 Preview**: Estimated 18-24 tasks across infrastructure, database, backend services, frontend components, testing, and validation

Key technical decisions documented:
- GitHub sync: `git checkout origin/main -- phase_02/` for exact parity
- SQLModel fix: Use `Optional[Dict[str, Any]]` from typing (not lowercase dict)
- LLM: OpenRouter SDK with HTTP fallback
- ChatWidget: Modal toggle (bottom-right) with #865A5B burgundy color
- Responsive design: Tailwind breakpoints (mobile <375px, tablet 375-768px, desktop ≥768px)
- Context: Stateless DB-fetched conversation history
- Security: Triple-layer user_id validation (middleware → service → query)

## Outcome

- ✅ Impact: Enables systematic implementation of three independent user stories (GitHub sync, chat interaction, visual design) with clear dependencies and architecture
- 🧪 Tests: Plan includes test strategy for all layers (contract, integration, unit, E2E, responsive design, auth)
- 📁 Files: 1 comprehensive plan.md (400+ lines) with all technical decisions, data models, API contracts, and task preview
- 🔁 Next prompts: `/sp.tasks` to generate detailed, dependency-ordered task list for implementation
- 🧠 Reflection: Plan provides complete technical direction without needing clarifications. Three user stories can be developed in parallel with shared component coordination.

## Evaluation notes (flywheel)

- Failure modes observed: None — plan generated cleanly with no ambiguities or missing decisions
- Graders run and results (PASS/FAIL): Constitution check PASS; all technical decisions documented; structure verified against spec requirements
- Prompt variant (if applicable): Single variant (user guidance incorporated directly into plan)
- Next experiment: Proceed with `/sp.tasks` to decompose plan into actionable, dependency-ordered implementation tasks
