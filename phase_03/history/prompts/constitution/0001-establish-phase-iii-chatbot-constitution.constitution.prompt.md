---
id: 0001
title: Establish Phase III chatbot constitution
stage: constitution
date: 2026-02-07
surface: agent
model: claude-haiku-4-5-20251001
feature: none
branch: cleanup/phase-02-final-cleanup
user: system
command: /sp.constitution
labels: ["constitution", "phase-iii", "chatbot-integration", "governance"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - /mnt/d/todo-evolution/phase_03/.specify/memory/constitution.md
tests:
 - Validation: No unresolved placeholders in constitution.md
 - Validation: Version format correct (1.0.0)
 - Validation: Dates in ISO format (YYYY-MM-DD)
 - Validation: Six core principles documented with rationale
---

## Prompt

Project: Plannior Phase III - Agentic AI Chatbot

Core principles:

- Stateless Architecture: The server must hold NO in-memory state; all context persists to Neon DB.
- Tool-First Execution: AI must manage tasks exclusively via MCP tools (TaskToolbox), never direct DB queries.
- Privacy & Isolation: Agents must strictly verify user_id for every tool call based on the session.
- API Integration: Use OpenRouter API for LLM orchestration to provide flexibility and cost-efficiency.

Key Standards:

- Tech Stack: Next.js 16+, FastAPI, SQLModel, OpenAI Agents SDK (configured for OpenRouter), Official MCP SDK.
- Formatting: All AI responses must be friendly, confirming actions taken (e.g., "I've added that to your list!")
- Error Handling: Graceful handling of "task not found" or "unauthorized access".

Constraints:

- No manual code: All logic generated via Claude Code based on specs.
- UI Integrity: Integrate a conversational interface without disturbing existing Phase II layout or theme (copied in phase_03 as well).
- Data Model: Implement 'Conversation' and 'Message' tables in SQLModel.

Success criteria:

- Agent successfully executes CRUD via natural language (English & Roman Urdu) and only available after signup/signin.
- Conversation history persists across server restarts.
- Clear Project History Records (PHRs) generated for every implementation step.
- Proper PHRs in format, for example /history/prompts/chatbot-integration/specify-prompt.md, plan-prompt.md, tasks-prompt.md, etc., then change the directory name from chatbot-integration to another one on the next turn.

## Response snapshot

✅ Constitution established with six core principles (Stateless Architecture, Tool-First Execution, Privacy & Isolation, API Integration & Cost Efficiency, User Experience & Clarity, Data Integrity & Observability).

✅ Tech Stack & Standards section added covering Next.js 16+, FastAPI, SQLModel, OpenAI Agents SDK with OpenRouter, MCP SDK, Neon PostgreSQL, JWT auth, and Docker deployment.

✅ Development Constraints and Success Criteria sections formalized.

✅ Governance section documents amendment procedure with semantic versioning and PR compliance requirements.

✅ Version: 1.0.0 | Ratified and Last Amended: 2026-02-07

## Outcome

- ✅ Impact: New constitution establishes governance and architectural guardrails for Phase III chatbot integration; defines six non-negotiable principles, tech stack, and success criteria; enables subsequent spec/plan/tasks phases.
- 🧪 Tests: File validation (no placeholders remain, version format correct, dates ISO format, six principles documented with rationale).
- 📁 Files: /mnt/d/todo-evolution/phase_03/.specify/memory/constitution.md (NEW, 1.0.0)
- 🔁 Next prompts: spec phase (define chatbot feature requirements), plan phase (architecture & design), tasks phase (testable implementation units)
- 🧠 Reflection: Constitution captures user intent with all four core principles (Stateless, Tool-First, Privacy, API Integration) plus two foundational sections (Tech Stack, Constraints). Ready for feature specification phase.

## Evaluation notes (flywheel)

- Failure modes observed: None; all placeholders filled, YAML valid, no syntax errors.
- Graders run and results (PASS/FAIL): File syntax PASS, placeholder coverage PASS, version semantics PASS, governance rationale PASS
- Prompt variant (if applicable): N/A (initial constitution, no iteration)
- Next experiment (smallest change to try): Proceed to /sp.specify for Phase III chatbot feature specification
