---
id: 0007
title: Enhance persistent task management with MCP Tools
stage: spec
date: 2026-02-08
surface: agent
model: claude-haiku-4-5-20251001
feature: 014-agentic-chatbot
branch: 014-agentic-chatbot
user: amrahaanwar
command: /sp.specify
labels: ["mcp-tools", "persistence", "task-management", "requirements"]
links:
  spec: /mnt/d/todo-evolution/phase_03/specs/014-agentic-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - phase_03/specs/014-agentic-chatbot/spec.md
  - phase_03/specs/014-agentic-chatbot/checklists/requirements.md
tests:
  - None (spec validation only)
---

## Prompt

Goal: Enable persistent task management using MCP Tools and Sub-Agents.

Requirements:

- The AI must use the 'TaskToolbox' Skill to execute all CRUD operations.
- Use a 'RomanUrduHandler' Sub-Agent to map Roman Urdu intents to tool parameters.
- Every successful tool execution MUST be followed by a 'session.commit()' to Neon DB.
- History must be re-hydrated in the UI from the 'Message' table on page refresh.

Acceptance Criteria:

- Tasks added via chat MUST persist in the 'tasks' table.
- Chat history must remain visible after a browser refresh.
- The Agent must confirm tool success ONLY after a successful DB commit.
- PHRs and specs must be inside phase_03 directory not outside.

## Response snapshot

Updated the existing 014-agentic-chatbot specification to incorporate explicit requirements for:

1. **TaskToolbox Skill (FR-002)**: All CRUD operations must route exclusively through TaskToolbox
2. **RomanUrduHandler Sub-Agent (FR-003)**: Roman Urdu intent parsing delegated to specialized sub-agent
3. **session.commit() Requirement (FR-004)**: Explicit database transaction finalization after every successful tool call
4. **Message Table Re-hydration (FR-007)**: Conversation history must restore completely on page refresh from 'Message' table
5. **Confirmation After Commit (FR-009)**: Friendly messages appear ONLY after DB persistence, not before
6. **Critical Constraint**: All PHRs and specs stored within phase_03 directory hierarchy

Updated sections:
- Feature Input statement
- Functional Requirements (FR-002 to FR-016, expanded from 13 to 16)
- Success Criteria (SC-001 to SC-016, added 6 new criteria for persistence validation)
- Assumptions (added 4 new assumptions for MCP tools and session management)
- Constraints & Non-Goals (added critical constraint section for phase_03 isolation)

Updated checklist validation to reflect new requirements.

## Outcome

- ✅ Impact: Specification now explicitly mandates TaskToolbox exclusive use, RomanUrduHandler delegation, session.commit() transactions, and Message table re-hydration; enforces phase_03 directory isolation for all artifacts
- 🧪 Tests: Specification quality checklist passing (16/16 items, no [NEEDS CLARIFICATION] markers remain)
- 📁 Files: Updated spec.md + updated requirements.md checklist
- 🔁 Next prompts: /sp.plan to generate architecture decisions and design plan based on updated spec
- 🧠 Reflection: Successfully integrated user requirements without contradicting existing architecture; explicit success criteria now testable against implementation

## Evaluation notes (flywheel)

- Failure modes observed: None; spec update was straightforward enhancement
- Graders run and results (PASS/FAIL): All checklist items PASS
- Prompt variant (if applicable): null
- Next experiment: Execute /sp.plan for detailed architectural planning
