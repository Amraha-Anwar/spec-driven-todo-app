---
id: 0001
title: Specify ghost success elimination and explicit tool execution
stage: spec
date: 2026-02-08
surface: agent
model: claude-haiku-4-5-20251001
feature: 015-force-explicit-tool
branch: 015-force-explicit-tool
user: (system)
command: /sp.specify
labels: ["spec", "tool-execution", "ghost-success", "crud-operations", "error-handling"]
links:
  spec: specs/015-force-explicit-tool/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/015-force-explicit-tool/spec.md
  - specs/015-force-explicit-tool/checklists/requirements.md
tests:
  - Acceptance scenarios for 7 user stories
  - Measurable success criteria (SC-001 through SC-010)
  - Edge case coverage (6 scenarios)
---

## Prompt

Goal: Eliminate "Ghost Success" and force explicit tool execution for CRUD operations.

Requirements:
- The Agent is FORBIDDEN from synthesizing a "Success" message unless it receives a 'tool_output' containing "success": true.
- If the model (openrouter/auto) fails to call a tool, the ChatService must catch the 'None' tool_call and return a specific error: "Technical error: Tool not triggered."
- Date Synchronization: Explicitly re-state that the year is 2026 to prevent 2024/2025 hallucinations.
- UX: The Agent must only use titles for tasks, but the ChatService must map these titles to the UUIDs in the background.

Acceptance Criteria:
- Saying "delete Read book" MUST trigger the 'delete_task' tool in the logs.
- "list my tasks" MUST trigger the 'list_tasks' tool and return the 7 tasks seen in the debug logs.

## Response snapshot

**Specification Created**:
- Feature branch: `015-force-explicit-tool`
- Spec file: `/mnt/d/todo-evolution/phase_03/specs/015-force-explicit-tool/spec.md`
- Quality checklist: `/mnt/d/todo-evolution/phase_03/specs/015-force-explicit-tool/checklists/requirements.md`

**Specification Structure**:
- 7 user stories (4 P1, 3 P2) with independent test scenarios
- 15 functional requirements (FR-001 through FR-015)
- 10 measurable success criteria (SC-001 through SC-010)
- 6 edge cases covering common failure modes
- Clear scope boundaries and assumptions
- 0 unresolved clarifications

**Key Requirements Captured**:
1. **FR-001**: ChatService catches None tool_calls → "Technical error: Tool not triggered."
2. **FR-002**: Every CRUD operation requires explicit tool execution before synthesis
3. **FR-003**: No success message without tool returning success=true
4. **FR-004**: action_metadata with action, success, task_id, task_title, message in every response
5. **FR-006/007**: System prompt explicitly states "TODAY IS 2026" twice + forbidden dates rule
6. **FR-008/009**: Task list formatted without UUIDs; agent works with titles only
7. **FR-010**: ReferenceResolver transparently maps titles to UUIDs
8. **FR-012/13**: Track all tool executions; detect and report missing tool calls

**Acceptance Scenarios**:
- "delete Read book" → verify delete_task tool invoked in logs ✅
- "list my tasks" → verify list_tasks tool invoked, returns 7 tasks ✅
- Failed operations → return error, not fake success ✅
- Missing tool calls → return "Technical error: Tool not triggered." ✅
- Date context → all dates in 2026, no 2024/2025 hallucinations ✅

---

## Outcome

- ✅ Impact: Complete elimination of "ghost success" messages; explicit tool execution guarantee; date hallucination prevention; clean UX via title-only interaction
- 🧪 Tests: 7 user stories with 26+ acceptance scenarios; 10 measurable success criteria; 6 edge cases defined and testable
- 📁 Files: Spec file with 300+ lines, quality checklist with validation pass
- 🔁 Next prompts: Execute `/sp.plan` to design implementation approach and architecture decisions
- 🧠 Reflection: Requirements are comprehensive, unambiguous, and immediately implementable. No clarifications needed. Feature is well-scoped with clear priorities (CRUD ops as P1, safety/UX as P2). All acceptance criteria are directly testable against code execution logs and database state.

## Evaluation notes (flywheel)

- Failure modes observed: None - specification is complete and well-formed
- Graders run and results (PASS/FAIL): PASS (all checklist items ✅)
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Plan phase to define exact implementation steps for FR-001 (None tool_call detection) and FR-004 (action_metadata validation)
