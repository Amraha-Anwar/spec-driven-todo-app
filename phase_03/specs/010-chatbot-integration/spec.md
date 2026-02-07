# Feature Specification: Agentic AI Chatbot for Task Management

**Feature Branch**: `010-chatbot-integration`
**Created**: 2026-02-07
**Status**: Draft
**Input**: Implement AI Chatbot interface for Plannior using MCP architecture and OpenRouter with support for English and Roman Urdu task management via stateless request cycles.

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

### User Story 1 - Create Tasks via Natural Language (Priority: P1)

User types conversational requests like "I need to buy milk tomorrow" and the chatbot interprets the intent, extracts task details, and creates the task via the TaskToolbox MCP tool. The agent confirms the action with friendly messaging.

**Why this priority**: Task creation is the core value of the chatbot—it bridges natural language input to structured task operations. This is the primary user journey and MVP foundation.

**Independent Test**: Can be fully tested by: (1) User enters English task request, (2) System parses intent, (3) Agent calls add_task tool with extracted details, (4) Agent confirms creation—delivers immediate task management value without any other features.

**Acceptance Scenarios**:

1. **Given** user is logged in and on Dashboard, **When** user types "buy milk tomorrow", **Then** chatbot extracts task ("buy milk") and due date ("tomorrow"), calls add_task, and confirms "I've added 'buy milk' to your list for tomorrow!"
2. **Given** user requests a task without a due date, **When** user types "call mom", **Then** chatbot creates task without due date and confirms "I've added 'call mom' to your list!"
3. **Given** chatbot receives an ambiguous request, **When** user types "do something", **Then** chatbot asks a clarifying question: "What would you like to add? Be specific and I'll help!"

---

### User Story 2 - Execute Task Operations in Roman Urdu (Priority: P1)

User issues commands in Roman Urdu (Urdu written in Latin characters) like "Mera grocery wala task delete kar do" and the RomanUrduHandler MCP server parses the intent, extracts the operation and task reference, and executes the corresponding MCP tool (delete_task). Agent responds in Roman Urdu.

**Why this priority**: Multi-language support (English + Roman Urdu) is a core requirement per constitution and user journey example. Essential for user accessibility and cultural inclusivity. Same priority as English because it represents an equal user base expectation.

**Independent Test**: Can be fully tested by: (1) User enters Roman Urdu delete command, (2) System parses via RomanUrduHandler, (3) Agent calls delete_task tool, (4) Agent responds in Roman Urdu confirming deletion—demonstrates language bridge without requiring other features.

**Acceptance Scenarios**:

1. **Given** user is logged in, **When** user types "Mera grocery wala task delete kar do", **Then** RomanUrduHandler extracts task reference ("grocery"), delete_task is called, and agent responds "Bilkul, maine aapka grocery task delete kar diya" (Confirmed, I've deleted your grocery task)
2. **Given** user types Roman Urdu task creation, **When** user types "Kal meeting add kar de", **Then** system creates task for tomorrow with title "meeting" and confirms in Roman Urdu
3. **Given** Roman Urdu input is ambiguous, **When** user types partial Urdu phrase, **Then** agent asks for clarification in Roman Urdu: "Kya aap task delete ya complete karna chahte ho?" (Do you want to delete or complete the task?)

---

### User Story 3 - Retrieve and Display Conversation History (Priority: P2)

When user returns to the Dashboard or reopens the chat interface, the ContextManager MCP server fetches prior conversation messages. The chatbot rebuilds context and displays the history so the user sees previous interactions and task details.

**Why this priority**: Essential for user experience continuity and stateless architecture validation. Slightly lower than creation/deletion because users can still use the chatbot without prior history, but history persistence is critical for trust and productivity.

**Independent Test**: Can be fully tested by: (1) User completes chat session with task creation, (2) User returns to Dashboard, (3) Chat history loads with prior messages, (4) User can see previous tasks discussed—demonstrates persistence without requiring real-time notifications.

**Acceptance Scenarios**:

1. **Given** user previously created tasks in chat, **When** user returns to Dashboard and opens chat, **Then** prior conversation messages load and display in chronological order with user and assistant roles clearly marked
2. **Given** chat has 10+ messages, **When** user opens chat, **Then** at least the last 5 messages load immediately and older messages are accessible via scroll
3. **Given** user closes browser and returns hours later, **When** user logs in and opens chat, **Then** full conversation history is restored from database

---

### User Story 4 - Stateless Request Processing with Tool Invocation (Priority: P2)

For each user message, the system executes: (1) Fetch prior conversation history from ContextManager, (2) Process user input with language detection (English vs Roman Urdu), (3) Call appropriate MCP tool (TaskToolbox, RomanUrduHandler), (4) Save assistant response and tool result to database. No in-memory state persists between requests.

**Why this priority**: This is an architectural requirement per constitution and enables scalability. Lower priority than immediate user-facing features but critical for reliability and deployment readiness.

**Independent Test**: Can be fully tested by: (1) Restart backend server mid-conversation, (2) Send new user message, (3) Verify history still loads, (4) Verify tool calls execute correctly—demonstrates stateless guarantee without user-facing feature.

**Acceptance Scenarios**:

1. **Given** server is stateless, **When** backend restarts mid-chat, **Then** next user message still loads full prior history and executes correctly
2. **Given** user sends task creation request, **When** system processes request, **Then** add_task tool is called with user_id verification and response is persisted to database
3. **Given** multiple conversations exist for same user, **When** system processes request, **Then** correct conversation_id is used for history fetch and message save

---

### User Story 5 - Access Control and Session Validation (Priority: P3)

Every MCP tool call includes user_id from JWT token. System verifies user_id matches session and rejects unauthorized access with graceful error messaging ("You don't have permission to access this task" or "Task not found").

**Why this priority**: Security and privacy are essential but secondary to core functionality. Constitution mandates this requirement; P3 reflects that it's infrastructure/validation rather than user-facing feature.

**Independent Test**: Can be fully tested by: (1) Attempt to access another user's task via tool call, (2) Verify rejection with appropriate error message, (3) Verify no data leakage—validates security boundary.

**Acceptance Scenarios**:

1. **Given** user_id from JWT is X, **When** system processes delete_task for task owned by user Y, **Then** tool rejects with "You don't have permission to access this task"
2. **Given** user is logged out, **When** user attempts to send chat message, **Then** system returns 401 Unauthorized with redirect to login
3. **Given** task created by user X is queried by user Y, **When** user Y requests task via tool, **Then** system returns "Task not found" (generic message, no data leak)

### Edge Cases

- What happens when user sends empty message? System should prompt: "I didn't catch that. Can you rephrase?"
- What happens when Roman Urdu parsing fails or is ambiguous? System asks clarification in Roman Urdu with example.
- What happens if add_task tool returns error (e.g., validation fails)? System shows user-friendly error: "I couldn't create the task. Make sure the due date is valid (e.g., 'tomorrow', 'next Monday')."
- What happens if conversation history fetch times out? System shows: "Loading history..." and allows user to continue without prior context visible.
- What happens when user tries to chat before signup/login? System redirects to auth page with message: "Please sign in to use the chatbot."

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST accept natural language task requests in English (e.g., "buy milk tomorrow") and extract task title, due date, and optional priority
- **FR-002**: System MUST parse Roman Urdu task commands (e.g., "Mera task delete kar do") via RomanUrduHandler MCP server and execute corresponding task operations
- **FR-003**: System MUST call TaskToolbox MCP tools (add_task, delete_task, complete_task, list_tasks, update_task) exclusively for all task operations—never direct database queries
- **FR-004**: System MUST fetch conversation history via ContextManager MCP server on every request and display prior messages in chat UI
- **FR-005**: System MUST store every user message and assistant response in Conversation and Message tables (SQLModel) with conversation_id, role, content, and timestamps
- **FR-006**: System MUST include user_id from JWT token in every MCP tool call and verify authorization before executing operation
- **FR-007**: System MUST display chatbot interface as a drawer or dedicated route on Dashboard without disrupting existing Phase II layout/theme
- **FR-008**: System MUST return graceful error messages ("Task not found", "You don't have permission", "Invalid task details") on MCP tool failures
- **FR-009**: System MUST support both English and Roman Urdu conversational responses with natural, confirming language (e.g., "I've added that to your list!")
- **FR-010**: System MUST validate that chatbot is only accessible to authenticated users (post signup/signin with valid JWT token)
- **FR-011**: System MUST not persist any in-memory state between requests; all context sourced from database on each request
- **FR-012**: System MUST configure OpenRouter API key via backend .env file (no hardcoded secrets) and route all LLM requests through OpenRouter by overriding the OpenAI SDK's `base_url` parameter to OpenRouter's endpoint
- **FR-013**: System MUST fetch last 10-15 conversation messages from ContextManager per request; if token limit approached, summarize older messages to stay within budget while maintaining conversational context
- **FR-014**: System MUST enforce user_id verification at FastAPI middleware layer (extract once from JWT, validate against session, reject unauthorized access before reaching MCP tools)
- **FR-015**: When OpenRouter API is unreachable or credits exhausted, system MUST return immediate user-friendly error ("I'm temporarily unavailable, please try again later") with no automatic queuing or retry logic

### Key Entities *(include if feature involves data)*

- **Conversation**: Represents a chat session with a user; contains conversation_id (UUID), user_id (FK to User), created_at, updated_at, metadata (language preference, etc.)
- **Message**: Represents individual chat messages; contains message_id (UUID), conversation_id (FK), role ("user" or "assistant"), content (text), tool_call_metadata (if applicable), created_at
- **Task** (existing): Updated by chatbot via MCP tools; contains task_id, user_id, title, description, due_date, priority, completed_at
- **User** (existing): Extended with conversation records; JWT token issued on signin includes user_id for validation

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: User can create a task via natural language chat in under 5 seconds (from typing to confirmation)
- **SC-002**: Chatbot correctly parses task creation requests (title + due date extraction) with 95% accuracy on common inputs (e.g., "buy milk tomorrow", "call mom next week")
- **SC-003**: Roman Urdu commands (delete, complete, create) execute correctly with 90%+ accuracy for well-formed inputs
- **SC-004**: Conversation history loads and displays within 2 seconds on chat open/page reload
- **SC-005**: System maintains zero in-memory state—all tool calls execute correctly even after backend service restart
- **SC-006**: All MCP tool calls include user_id verification and unauthorized access attempts are rejected 100% of the time
- **SC-007**: Chatbot interface integrates seamlessly without disrupting existing Dashboard layout (verified by visual regression tests)
- **SC-008**: 100% of authenticated users can access chatbot; unauthenticated users are redirected to login
- **SC-009**: System supports OpenRouter API with graceful fallback messaging if API is unavailable (e.g., "I'm temporarily unavailable, please try again later"); error returned to user within 2 seconds
- **SC-010**: ContextManager fetches 10-15 past messages per request; if token budget exceeded, older messages are summarized (not dropped) to preserve context
- **SC-011**: All MCP tool calls include verified user_id from JWT; unauthorized cross-user access rejected 100% of the time at middleware layer

## Assumptions

- **Natural Language Parsing**: User requests will generally follow patterns like "[verb] [noun] [time]" (e.g., "buy milk tomorrow"). Vague requests (e.g., "stuff") will be clarified conversationally rather than auto-rejected.
- **Roman Urdu Format**: Roman Urdu input will follow common transliteration patterns. System will attempt fuzzy matching for minor typos.
- **Task Operations**: Users will primarily create, delete, and complete tasks; other operations (list, update) are supported but less frequent based on constitution examples.
- **Session Duration**: Chat sessions can span hours; history must persist across page reloads and browser restarts (multi-day persistence not specified, so standard web app retention—30-90 days—applies).
- **Error Handling**: MCP tool failures (e.g., network timeout, invalid task_id) will be caught and surfaced to user as friendly messages rather than raw errors.
- **Authentication**: JWT tokens are validated by backend middleware; chatbot assumes valid token exists if user is on Dashboard.
- **UI/UX Integration**: Existing Phase II UI components (buttons, modals, forms) will be reused for chat interface; no new design system required.

## Clarifications

### Session 2026-02-07

- Q: How to configure OpenAI Agents SDK for OpenRouter? → A: Override SDK's `base_url` parameter to point to OpenRouter endpoint; set `api_key` to OpenRouter token. No custom wrapper needed.
- Q: How many past messages should ContextManager fetch per request? → A: Fetch last 10-15 messages by default. If approaching token limit, summarize older messages rather than truncating. Maintains context while respecting stateless architecture.
- Q: Where/how should user_id verification be enforced? → A: Verify user_id at FastAPI middleware layer before ANY request reaches MCP tools. Extract JWT user_id once per request, validate it matches session, pass to all downstream tool calls.
- Q: How should chatbot respond when OpenRouter API is unreachable or credits exhausted? → A: Return immediate friendly error ("I'm temporarily unavailable, please try again later"). No automatic queuing or retries. User controls retry timing.

## Dependencies & Constraints

- **External**: OpenRouter API availability; Neon PostgreSQL connection stability
- **Internal**: TaskToolbox, RomanUrduHandler, ContextManager MCP servers must be functional and deployed; JWT auth middleware operational
- **User Story Dependencies**: P1 stories (task creation, Roman Urdu ops) must complete before P2 (history, stateless validation) to deliver MVP; P3 (access control) is concurrent with P1/P2
- **Data Model**: Conversation and Message tables must be created in SQLModel schema before chatbot backend can run
- **Tech Stack Constraints**: Must use FastAPI + SQLModel for backend, Next.js for frontend, Official MCP SDK for tool integration (per constitution)

## Out of Scope *(explicitly excluded)*

- Real-time notifications (pushed to Phase V)
- Real-time multi-client sync (pushed to Phase V)
- Voice input/output (future phase)
- Advanced NLP (e.g., entity linking, coreference resolution beyond simple pattern matching)
- Chatbot training/fine-tuning on user data (out of scope; uses off-the-shelf LLM via OpenRouter)
- Admin dashboard for chatbot analytics (future phase)
