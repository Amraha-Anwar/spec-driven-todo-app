# Feature Specification: Synchronize GitHub and Implement OpenRouter AI Chatbot

**Feature Branch**: `011-github-sync-chatbot`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "Goal: Synchronize local directories with GitHub and implement the OpenRouter AI Chatbot. User Journeys: Recovery - The agent pulls all files from the GitHub phase_02 directory to local /phase_02 and merges them into /phase_03 to restore UI fixes. Chat Interaction - Authenticated users can manage tasks via natural language (English/Roman Urdu). Visual Consistency - The ChatWidget icon is visible on the Home page but restricted to signed-in users. Success Criteria: Local /phase_03 contains all recovered UI fixes from GitHub phase_02. python reset_database.py runs without ValueError or Shadowing warnings. ChatWidget matches the #865A5B burgundy glassmorphic theme and is fully responsive."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Restore UI from GitHub Repository (Priority: P1)

**Description**: When local files diverge from GitHub source of truth (phase_02), the system must restore all UI components, styling, and layout components from the remote GitHub repository to ensure visual and functional parity.

**Why this priority**: This is the foundation for all subsequent work. UI restoration ensures that local phase_02 and phase_03 directories have identical, tested components from the authoritative GitHub source. Without this, downstream UI work may be based on broken or outdated code.

**Independent Test**: Can be fully tested by running a file-by-file comparison (`git diff origin/main -- phase_02/frontend/` and syncing to phase_03). Delivers the value of having a consistent, GitHub-synchronized codebase ready for frontend development.

**Acceptance Scenarios**:

1. **Given** GitHub phase_02 has frontend components (sidebar.tsx, globals.css, etc.), **When** restoration script runs, **Then** all files are copied to local phase_02 and synced to phase_03
2. **Given** local phase_02 frontend differs from GitHub, **When** restoration completes, **Then** `git diff origin/main -- phase_02/frontend/` shows no differences
3. **Given** phase_03 frontend exists, **When** restoration completes, **Then** phase_03 receives all synced files from phase_02 without deleting Phase 03-specific MCP tools
4. **Given** restoration is complete, **When** `python reset_database.py` runs in phase_03/backend, **Then** no ValueError or metadata shadowing warnings appear

---

### User Story 2 - Natural Language Task Management via Chat (Priority: P1)

**Description**: Authenticated users can communicate with an AI chatbot in English or Roman Urdu to create, update, and manage tasks using natural language. The chat interface uses OpenRouter for LLM inference, with context maintained across multi-turn conversations.

**Why this priority**: This is the core feature that transforms the TODO app from a traditional UI-based task manager into an agentic system. Users can say "Create a meeting with the team tomorrow at 2 PM" and the system handles intent parsing, task creation, and confirmation.

**Independent Test**: Can be fully tested by logging in, opening the ChatWidget, sending a task command in English (e.g., "Add a task called Review PR #123"), and verifying the task appears in the task list. Also testable in Roman Urdu with equivalent commands.

**Acceptance Scenarios**:

1. **Given** user is authenticated and on Dashboard, **When** user opens ChatWidget and sends "Create a task called Buy groceries", **Then** a new task appears in the task list within 5 seconds
2. **Given** chat context includes previous messages, **When** user sends follow-up like "Mark it as high priority", **Then** system understands context and updates the correct task
3. **Given** user sends Roman Urdu input like "Mera meeting wala task delete kar do", **When** RomanUrduHandler parses intent, **Then** system deletes the correct task and responds in Roman Urdu
4. **Given** OpenRouter API rate limit or timeout occurs, **When** chat request is made, **Then** system gracefully falls back with user-friendly error message without exposing API details
5. **Given** unauthenticated user, **When** attempting to access ChatWidget, **Then** system redirects to login or shows access denied message

---

### User Story 3 - Visual Consistency with Glasmorphic Design (Priority: P1)

**Description**: The ChatWidget icon appears visually consistent on the Home page with the #865A5B burgundy theme, uses glasmorphic styling (translucent with backdrop blur), and is fully responsive across mobile and desktop viewports.

**Why this priority**: Visual consistency is essential for user trust and brand coherence. The ChatWidget must integrate seamlessly with the existing glasmorphic design system (verified in Phase 02 UI) and maintain responsive behavior across all device sizes.

**Independent Test**: Can be fully tested by loading the Home page on desktop (1920x1080), tablet (768x1024), and mobile (375x667) viewports, verifying the ChatWidget icon appears with correct burgundy color (#865A5B), has translucent background, and is positioned/sized appropriately for each breakpoint.

**Acceptance Scenarios**:

1. **Given** Home page loads on desktop (≥768px), **When** user views ChatWidget icon, **Then** icon displays with #865A5B burgundy color, glasmorphic styling (backdrop blur), and is positioned in bottom-right corner
2. **Given** Home page loads on mobile (<768px), **When** user views ChatWidget icon, **Then** icon is scaled appropriately, positioned for touch interaction, and maintains glasmorphic appearance
3. **Given** ChatWidget is opened, **When** user views chat interface, **Then** chat container maintains glasmorphic styling consistent with sidebar and other UI components
4. **Given** chat messages are displayed, **When** user views message bubbles, **Then** styling is consistent with overall design system (typography, colors, spacing)
5. **Given** authenticated user, **When** accessing Home page, **Then** ChatWidget is visible and interactive
6. **Given** unauthenticated user, **When** accessing Home page, **Then** ChatWidget icon may be visible but disabled/locked with login prompt

### Edge Cases

- What happens when OpenRouter API is unavailable or rate-limited? (System should gracefully degrade with cached responses or fallback LLM)
- How does system handle malformed Roman Urdu input or ambiguous intent parsing? (Should confirm intent with user before executing task changes)
- What if user sends a task command that conflicts with existing tasks (e.g., duplicate names)? (System should prompt for clarification or auto-rename with suffix)
- How does system handle mid-conversation context loss (e.g., database connection drop)? (Should recover from database and resume conversation)
- What if frontend refresh occurs during active chat session? (Should preserve conversation history from database and resume)

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST synchronize all UI files from GitHub `origin/main:phase_02/frontend/` to local `phase_02/frontend/`
- **FR-002**: System MUST synchronize all synchronized UI files from `phase_02/frontend/` to `phase_03/frontend/` while preserving Phase 03 MCP skills and services
- **FR-003**: System MUST fix SQLModel type hints in `backend/app/models/conversation.py` (metadata field) and `backend/app/models/message.py` (tool_call_metadata field) to use `Optional[Dict[str, Any]]` instead of `Optional[dict]`
- **FR-004**: System MUST provide a ChatWidget component accessible to authenticated users that integrates with OpenRouter AI for task management
- **FR-005**: System MUST support natural language task commands in English (e.g., "Create a task called Review PR #123")
- **FR-006**: System MUST support natural language task commands in Roman Urdu (e.g., "Mera meeting wala task delete kar do") with RomanUrduHandler parsing
- **FR-007**: System MUST maintain multi-turn conversation history per user, reconstructable from database on every request (stateless architecture)
- **FR-008**: System MUST apply glasmorphic styling (#865A5B burgundy, translucent background, backdrop blur) to ChatWidget and all related components
- **FR-009**: System MUST render ChatWidget responsively across desktop (≥768px), tablet (768px-1024px), and mobile (<768px) viewports
- **FR-010**: System MUST restrict ChatWidget access to authenticated users; unauthenticated users see disabled/locked icon with login prompt
- **FR-011**: System MUST handle OpenRouter API failures gracefully without exposing error details to users
- **FR-012**: System MUST validate user_id in JWT token matches requested conversation to prevent cross-user data access
- **FR-013**: System MUST log all task operations (create, update, delete, complete) with user_id and timestamp for audit trail

### Key Entities

- **Conversation**: Represents a multi-turn chat session linked to a user. Contains id (UUID), user_id (FK to User), created_at, updated_at, language_preference ("en" or "ur"), and metadata (Dict[str, Any] for session context).
- **Message**: Individual message within a conversation. Contains id (UUID), conversation_id (FK), role ("user" or "assistant"), content (string), tool_call_metadata (Dict[str, Any] for agent execution details), and created_at.
- **Task**: Existing entity extended for chat integration. Must be associated with user_id to prevent cross-user access. May store original_command (natural language input that created the task) for context.
- **ChatSession**: Frontend session state (not persisted) tracking open ChatWidget, current conversation_id, and scrolled message position.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: GitHub synchronization completes with zero file diffs (`git diff origin/main -- phase_02/frontend/` returns no changes) between local and remote for all UI components
- **SC-002**: `python reset_database.py` runs without ValueError on metadata/tool_call_metadata fields or shadowing warnings
- **SC-003**: ChatWidget displays on Home page with #865A5B burgundy color, glasmorphic styling (verified via CSS inspection), and backdrop blur effect visible
- **SC-004**: ChatWidget is fully responsive: icons scale appropriately on mobile (<375px width), tablet (375px-768px), and desktop (≥768px)
- **SC-005**: Authenticated users can create a task via chat ("Add task: Buy milk") and see it appear in task list within 5 seconds
- **SC-006**: Authenticated users can manage tasks in Roman Urdu ("Mera task delete kar do") with system correctly parsing intent and executing operation
- **SC-007**: Unauthenticated users cannot access ChatWidget; icon appears locked/disabled with login prompt
- **SC-008**: OpenRouter API timeout (no response within 30 seconds) results in user-friendly error message, not stack trace or raw API error
- **SC-009**: Conversation history persists: user can refresh browser and resume chat with all previous messages visible
- **SC-010**: SQLModel model instantiation (Conversation, Message) succeeds without raising ValueError or type validation errors

---

## Scope Boundaries

### In Scope

- UI file synchronization from GitHub phase_02 to local phase_02 and phase_03
- SQLModel type hint fixes for Conversation and Message models
- ChatWidget component implementation with glasmorphic styling
- OpenRouter AI integration for task management
- Natural language processing for English and Roman Urdu
- Multi-turn conversation persistence and stateless reconstruction
- Authentication and user data isolation
- Responsive UI design across device sizes

### Out of Scope

- Voice commands (Reserved for Bonus Phase)
- Real-time push notifications (Phase V)
- Multi-language support beyond English and Roman Urdu
- Advanced NLP features (sentiment analysis, conversation summarization)
- Integration with external calendar/scheduling services
- Conversation archival or export features
- Analytics/usage tracking (beyond basic audit logging)

---

## Assumptions

- GitHub repository (origin/main) is accessible and contains the authoritative phase_02 frontend
- Local git configuration is set up with correct remote (origin pointing to GitHub)
- SQLModel version in use supports Dict[str, Any] type hints (SQLModel ≥2.0.0)
- OpenRouter API endpoint and authentication key are configured in environment variables
- Frontend framework (Next.js) supports dynamic component imports required for ChatWidget
- Database (PostgreSQL) is running and accessible to backend
- User authentication (JWT) is already implemented and functional
- Design tokens and CSS framework (Tailwind + custom glassmorphism classes) are present in globals.css

---

## Dependencies

- **External**: OpenRouter API for LLM inference
- **Internal**: Existing Task CRUD operations, User authentication, Database (PostgreSQL)
- **GitHub**: phase_02 UI components (sidebar, layouts, styling) as source of truth

---

## Technical Constraints

- No hardcoding of API keys or secrets in code; use environment variables
- All user_id references must be validated against JWT token to prevent data leakage
- Chat responses must complete within 30-second timeout to avoid UI hanging
- Database queries must use indexed fields (conversation_id, user_id) to maintain sub-200ms latency
- Frontend bundle size must not increase by more than 500KB with ChatWidget addition
