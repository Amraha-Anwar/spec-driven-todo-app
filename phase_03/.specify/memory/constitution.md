# Plannior Phase III - Agentic AI Chatbot Constitution

<!-- Sync Impact Report: Version 1.0.0 (NEW) | Ratified 2026-02-07 | Established for Phase III chatbot integration -->

## Core Principles

### I. Stateless Architecture
The server must hold NO in-memory state. All context, conversation history, and task state persist exclusively to Neon PostgreSQL. This ensures system resilience, enables horizontal scaling, and allows seamless recovery from service restarts. Every request is self-contained; no reliance on session memory or process state.

### II. Tool-First Execution
AI agents manage all tasks exclusively through MCP tools (TaskToolbox, ContextManager, RomanUrduHandler), never via direct database queries. This abstraction layer enforces access control, maintains clean separation of concerns, and ensures auditable action trails. All CRUD operations on tasks, conversations, and messages flow through standardized tool interfaces.

### III. Privacy & Isolation
Every tool call MUST verify the requesting user's identity based on JWT session tokens. User data is strictly segregated—agents must include user_id in all tool invocations and reject any cross-user data access. Unauthorized access attempts return graceful "task not found" or "access denied" errors without leaking system details.

### IV. API Integration & Cost Efficiency
Use OpenRouter API for LLM orchestration, providing flexibility across model providers and cost optimization. Configuration is centralized and environment-based (no hardcoded secrets). OpenAI Agents SDK orchestrates tool invocation and response synthesis while respecting stateless principles.

### V. User Experience & Clarity
All AI responses must be friendly and conversational, confirming actions taken with natural language (e.g., "I've added that to your list!"). Support both English and Roman Urdu (Urdu written in Latin characters). The chat interface integrates seamlessly without disrupting existing Phase II layout or theme. Error handling gracefully surfaces "task not found" or "unauthorized access" scenarios with user-friendly messaging.

### VI. Data Integrity & Observability
Implement Conversation and Message tables in SQLModel for persistent chat history. All interactions are logged with timestamps and user IDs for audit trails. Integration tests verify MCP tool contracts and conversation state consistency across server restarts.

## Tech Stack & Standards

- **Frontend**: Next.js 16+, React, TypeScript, TailwindCSS (reusing Phase II design system)
- **Backend**: FastAPI with SQLModel, Official MCP SDK
- **LLM Orchestration**: OpenAI Agents SDK configured for OpenRouter
- **Database**: Neon PostgreSQL with Connection Pooling
- **Authentication**: JWT tokens for session validation
- **Deployment**: Docker, stateless service architecture

## Development Constraints

- **No manual code**: All logic generated via Claude Code based on specifications (no ad-hoc scripting).
- **UI Integrity**: Integrate the conversational chatbot interface without disturbing existing Phase II layouts or visual themes.
- **Feature Gating**: Chat functionality available only after user signup/signin; protected by JWT token verification.
- **Zero in-memory state**: Every request restarts the context; persistence is database-only.

## Success Criteria

- ✅ Agent successfully executes task CRUD via natural language (English & Roman Urdu).
- ✅ Chat functionality available only after signup/signin with JWT validation.
- ✅ Conversation history and task state persist across server restarts.
- ✅ Clear Project History Records (PHRs) generated for every implementation step in feature-specific subdirectories.
- ✅ Proper PHR format and routing (e.g., `history/prompts/chatbot-integration/`, then rotate feature name on next turn).
- ✅ All MCP tool calls verified for user_id and return graceful errors on unauthorized access.
- ✅ Integration tests validate Conversation ↔ Message ↔ Task state consistency.

## Governance

Constitution supersedes all other practices. Amendments require:
1. Documentation of rationale and affected sections.
2. User approval via explicit consent.
3. Version increment following semantic versioning:
   - MAJOR: Principle removal or redefinition (e.g., removing stateless requirement).
   - MINOR: New principle, section, or material expansion (e.g., adding Roman Urdu support).
   - PATCH: Clarifications, wording, typo fixes.
4. All PRs must verify compliance with Core Principles before merge.

All runtime development guidance is found in `CLAUDE.md` files at project and phase roots.

---

**Version**: 1.0.0 | **Ratified**: 2026-02-07 | **Last Amended**: 2026-02-07
