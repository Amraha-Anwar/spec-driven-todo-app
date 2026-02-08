---
id: 0003
title: Clarify ambiguous Urdu, isolation, sub-agents approach
stage: clarify
date: 2026-02-08
surface: agent
model: claude-haiku-4-5-20251001
feature: 014-agentic-chatbot
branch: 014-agentic-chatbot
user: amrahaanwar
command: /sp.clarify
labels: ["clarification","urdu-ambiguity","session-isolation","mcp-sdk","sub-agents","reusability"]
links:
  spec: /mnt/d/todo-evolution/phase_03/specs/014-agentic-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - /mnt/d/todo-evolution/phase_03/specs/014-agentic-chatbot/spec.md
tests:
  - Edge Cases & Clarifications section added with 2-tier ambiguity resolution strategy
  - Functional Requirements expanded: FR-012 (user isolation), FR-013 (sub-agents)
  - Assumptions updated to reflect MCP SDK, JWT requirements, user isolation architecture
  - Spec remains technology-agnostic (no implementation leakage)
---

## Prompt

Questions for the Agent:

1. How will you ensure the agent handles ambiguous Urdu commands like "Purana wala delete kardo" (Delete the old one)?

2. Will you use the official MCP Python SDK to wrap the task operations?

3. How will you handle session isolation to ensure user_a cannot see user_b's conversation history?

4. Confirm you will use specialized Sub-agents, Skills to maximize 'Reusable Intelligence' bonus points.

## Response snapshot

Processed 4 critical clarification questions and integrated answers directly into specification:

**Q1 - Ambiguous Urdu Handling**: Two-tier resolution strategy documented:
- Tier 1: Direct match on task titles from conversation history
- Tier 2: Contextual match on temporal keywords ("old", "previous", "first")
- If multiple matches: Ask user with list + creation dates
- Applies to English ambiguous references too

**Q2 - Official MCP Python SDK**: CONFIRMED use of Official MCP Python SDK from modelcontextprotocol/python-sdk
- Type-safe tool definitions
- Seamless Agents SDK integration
- Handles tool calling orchestration

**Q3 - Session Isolation**: Multi-layered architecture documented:
- Layer 1 (JWT): user_id from token MUST match URL parameter; reject if mismatch
- Layer 2 (Database): All queries include WHERE user_id filter (never omit)
- Layer 3 (MCP Tools): Each tool validates user_id before execution
- Layer 4 (Security): Return 404 (not 403) on unauthorized access (prevent data leakage)

**Q4 - Specialized Sub-agents**: CONFIRMED implementation as MCP-based sub-agents
- TaskToolbox: 5 CRUD tools
- ContextManager: 2 history tools
- RomanUrduHandler: 1 language parsing tool
- ChatKit-Integrator: Frontend bridge tool
- Reusability: Each independently testable, deployable, reusable in Phase IV

**Spec Updates**:
- Edge Cases section expanded with ambiguity resolution and 6 additional edge case handlers
- Functional Requirements: 2 new requirements added (FR-012 isolation, FR-013 sub-agents)
- Assumptions: 3 new assumptions covering MCP SDK, JWT structure, user isolation validation
- Clarifications section created with session timestamp, Q&A summary, impact notes

## Outcome

- ✅ Impact: Spec now provides clear implementation guidance for 4 critical architectural decisions
- 🧪 Tests: All 4 questions answered; no ambiguities remain for planning phase
- 📁 Files: 1 spec file updated with 3 new sections (Edge Cases & Clarifications, 2 new FRs, 3 new Assumptions)
- 🔁 Next prompts: /sp.plan (architecture now fully clarified), /sp.tasks (task generation can proceed), /sp.implement
- 🧠 Reflection: Questions directly addressed edge cases and implementation strategy gaps. Answers were provided with concrete technical guidance (two-tier resolution, layered isolation, MCP SDK usage). Spec remains technology-agnostic overall while now explicitly documenting critical decisions. All 4 answers are immediately actionable for Phase 2 task generation and Phase 3 implementation.

## Evaluation notes (flywheel)

- Failure modes observed: None - all 4 questions answered comprehensively
- Graders run and results (PASS/FAIL): PASS - Clarifications integrated into spec; no contradictions introduced; Markdown structure intact; terminology consistent
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Run /sp.plan to validate architectural decisions against updated spec; no re-planning needed, clarifications reinforce existing plan design
