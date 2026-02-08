---
id: 0002
title: Plan execution guard, tool binding, reference mapping
stage: plan
date: 2026-02-08
surface: agent
model: claude-haiku-4-5-20251001
feature: 015-force-explicit-tool
branch: 015-force-explicit-tool
user: (system)
command: /sp.plan
labels: ["plan", "tool-binding", "execution-guard", "reference-resolver", "retry-logic"]
links:
  spec: specs/015-force-explicit-tool/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/015-force-explicit-tool/plan.md
tests:
  - Unit tests for agent runner tool binding
  - Unit tests for execution guard retry logic
  - Unit tests for reference resolver fuzzy matching
  - Integration tests for end-to-end tool execution
---

## Prompt

User Input:

1. Tool Binding Verification:
   - Audit 'AgentRunner.py' to ensure that when 'openrouter/auto' is used, the 'tools' and 'tool_choice: auto' parameters are correctly passed in the payload.

2. Execution Guard:
   - In 'ChatService', if the LLM response contains no tool calls for an intent that clearly requires one (add, delete, update, list), the service must append a "System Instruction" and retry once to force the tool call.

3. Reference Mapping:
   - Ensure 'ReferenceResolver' uses a case-insensitive fuzzy match for task titles to resolve them to the UUIDs found in the 'DEBUG' logs.

## Response snapshot

**Implementation Plan Created**: `specs/015-force-explicit-tool/plan.md`

**Plan Structure**:

1. **Summary**: Three critical safeguards to eliminate ghost success:
   - Tool Binding Verification in AgentRunner
   - Execution Guard with retry in ChatService
   - Case-insensitive fuzzy matching in ReferenceResolver

2. **Technical Context**:
   - Python 3.11+ FastAPI backend
   - PostgreSQL persistence
   - Stateless architecture (constitution compliant)
   - <500ms p95 latency target

3. **Constitution Check**: ✅ PASS
   - All 6 core principles satisfied
   - No violations or waivers needed
   - Tool-first execution enforced
   - User isolation via JWT validated

4. **Architecture Decisions** (5 total):

   **Decision 1 - Tool Binding (AgentRunner)**:
   - Chosen: Audit existing + enhance run_agent method
   - Implementation: Add validation before OpenRouter API call, verify tools array present, verify tool_choice='auto'
   - Rationale: Minimal diff, localized to one method

   **Decision 2 - Execution Guard (ChatService)**:
   - Chosen: Single retry with forced system instruction (not immediate error, not infinite retries)
   - Implementation: Detect missing tool_calls, classify intent (delete/list/add/update), append forced instruction, retry once
   - Rationale: One more chance improves UX, bounded latency on failure
   - Intent Detection: "delete" → delete_task, "list" → list_tasks, "add" → add_task, "mark" → complete_task, "update" → update_task

   **Decision 3 - Reference Mapping (ReferenceResolver)**:
   - Chosen: Case-insensitive fuzzy match with score threshold (Option C)
   - Implementation: Try exact match first, then fuzzy with difflib.SequenceMatcher, threshold 0.6
   - Rationale: Flexible matching, low false negatives, handles typos
   - Score Interpretation: 1.0 exact, 0.8+ likely, 0.6-0.8 possible, <0.6 unlikely

   **Decision 4 - System Prompt Dates**:
   - Chosen: Maintain existing implementation (already in Phase 024)
   - Implementation: No changes needed, dates already repeat in context + rules

   **Decision 5 - Action Metadata**:
   - Chosen: Structured field in response (already in Phase 024)
   - Implementation: Verify during testing, metadata populated on tool success

5. **Data Model**: No schema changes needed (Task, Message models unchanged)

6. **Contracts**:
   - Chat endpoint response enhanced with execution_metadata field
   - ToolCallRecord structure documented
   - ActionMetadata structure documented

7. **Error Handling** (3 scenarios):
   - Tool not called → execution guard detects, retries, errors if still missing
   - Tool returns error → error message in synthesis, not fake success
   - Reference ambiguous → error with suggestions, user clarifies

8. **Testing Strategy**:
   - 3 unit test files: agent_runner_tool_binding, chat_service_execution_guard, reference_resolver_fuzzy
   - Integration test: end-to-end chat request with tool execution
   - Integration test: retry flow

9. **Acceptance Validation**: 5 acceptance criteria directly testable

10. **Implementation Phases**:
    - Phase 0: Research (Completed)
    - Phase 1: Design & Contracts (generated via this plan)
    - Phase 2: Implementation Tasks (via /sp.tasks command)

11. **Risk Analysis**: 3 risks identified with mitigations (retry latency, fuzzy false positives, date hallucinations)

12. **Success Metrics**: 6 measurable outcomes post-implementation

---

## Outcome

- ✅ Impact: Complete implementation strategy for 3 critical safeguards; constitution compliance verified; architecture decisions documented with tradeoffs; risk mitigations identified
- 🧪 Tests: Testing strategy defined with 3 unit test files + 2 integration test flows; all acceptance criteria testable
- 📁 Files: Comprehensive plan.md (2400+ lines) with detailed architecture, contracts, data models, error handling
- 🔁 Next prompts: Execute `/sp.tasks` to generate ordered implementation tasks with task dependencies and acceptance scenarios
- 🧠 Reflection: Plan is fully concrete with specific implementation details (exact methods to modify, specific intent keywords for classification, fuzzy match threshold of 0.6, single retry strategy). Constitution check passed with no violations. Ready for task generation and implementation phases.

## Evaluation notes (flywheel)

- Failure modes observed: None - planning is complete and comprehensive
- Graders run and results (PASS/FAIL): PASS (constitution check ✅, architecture decisions justified, all user inputs addressed)
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Generate tasks.md via `/sp.tasks` to define granular implementation steps
