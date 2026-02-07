# Specification: Fix Chat API 404 Error and Restore ChatWidget UI Theme

**Feature ID**: 012-fix-chat-api-ui
**Status**: ACTIVE
**Date**: 2026-02-07
**Priority**: P1 (Critical - blocks Chat functionality)

---

## Overview

The Chat API endpoint returns 404 errors due to improper router registration in the backend main.py, and the ChatWidget is missing responsive glasmorphic styling and homepage visibility. This specification outlines the fixes needed to restore full Chat functionality with proper branding and user experience.

### Problem Statement

1. **Backend Issue**: POST `/api/{user_id}/chat` returns 404 because the chat router is not properly registered in `main.py`
2. **Frontend Issues**:
   - ChatWidget lacks proper glasmorphic theme with burgundy (#865A5B) branding
   - Missing from Homepage (only visible on Dashboard)
   - Responsive design needs refinement for mobile/tablet
   - Z-index hierarchy conflicts with Sidebar
3. **User Impact**: Authenticated users cannot use the Chat feature; no AI-powered task management available

---

## User Scenarios

### Scenario 1: Authenticated User Views Homepage
**Actor**: Logged-in user
**Context**: User navigates to homepage after signing in
**Action**: User sees burgundy chat icon in bottom-right corner
**Outcome**: Icon is visible, clickable, and ready for interaction
**Acceptance**: Chat icon appears with proper styling on Home page

### Scenario 2: User Opens ChatWidget
**Actor**: Logged-in user
**Context**: User clicks chat icon on Homepage
**Action**: ChatWidget panel opens with glasmorphic styling (backdrop blur, rounded corners)
**Outcome**: Panel slides in smoothly with proper z-index, doesn't obscure Sidebar
**Acceptance**: Animation smooth, backdrop blur visible, burgundy theme applied

### Scenario 3: User Sends Message
**Actor**: Logged-in user
**Context**: ChatWidget is open, user types message
**Action**: User sends message via POST `/api/{user_id}/chat`
**Outcome**: Message appears in chat, assistant response received and displayed
**Acceptance**: No 404 error; message sent successfully; response displayed in correct styling

### Scenario 4: User Toggles Language
**Actor**: Logged-in user
**Context**: ChatWidget is open
**Action**: User clicks "Roman Urdu" button
**Outcome**: Language preference changes; placeholder text updates; subsequent messages use selected language
**Acceptance**: Language toggle works without errors; conversation history persists

### Scenario 5: User Refreshes Page
**Actor**: Logged-in user
**Context**: User has active chat conversation
**Action**: User refreshes page (F5)
**Outcome**: ChatWidget reopens; message history visible and intact
**Acceptance**: Session restored; no message loss; conversation state preserved

### Scenario 6: Unauthenticated User Sees Chat Icon
**Actor**: Visitor without active session
**Context**: User not logged in, viewing Homepage
**Action**: Chat icon visible in bottom-right corner
**Outcome**: Clicking icon redirects to Sign-In page
**Acceptance**: Icon visible; redirect works; no errors

---

## Functional Requirements

### Backend Requirements

**REQ-001: Chat Router Registration**
- The chat router (`/mnt/d/todo-evolution/phase_03/backend/src/api/chat.py`) must be properly imported and registered in `main.py`
- Router should be registered at prefix `/api` with tag `chat`
- Endpoint should accept POST requests to `/{user_id}/chat`
- Expected response: 200 OK (not 404)

**REQ-002: User ID Path Parameter Alignment**
- Backend endpoint must accept `user_id` as a string path parameter (not UUID)
- JWT middleware must verify that authenticated `user_id` matches path parameter
- Should reject requests where path `user_id` ≠ authenticated user ID with 403 Forbidden

**REQ-003: Chat Service Context Fetching**
- ChatService must fetch last 10 messages from database before each LLM call
- Messages must be fetched in chronological order (oldest first)
- Must include both user and assistant messages in context

**REQ-004: Message Persistence**
- User messages must be saved to database with role="user", content, and timestamp
- Assistant messages must be saved with role="assistant", content, and tool_call_metadata (if any)
- All messages must be associated with correct conversation_id

---

### Frontend Requirements

**REQ-005: ChatWidget Visibility on Homepage**
- ChatWidget component must be visible on both Homepage (`/app/page.tsx`) and Dashboard
- Must use same component instance (state managed at top-level to persist across pages)
- Icon should be visible to authenticated users only

**REQ-006: Glasmorphic Theme Implementation**
- ChatWidget panel background: `bg-black/40 backdrop-blur-2xl` (glassmorphic effect)
- Chat icon button: Burgundy gradient `from-[#865A5B] to-purple-600`
- User message bubbles: Burgundy background (`bg-[#865A5B]`) with white text
- Assistant message bubbles: Glass background (`bg-white/10`) with light gray text and border (`border border-white/10`)
- All rounded corners: `rounded-lg` or `rounded-2xl` for consistency

**REQ-007: Responsive Design**
- Mobile (≤375px):
  - ChatWidget width: 100% - 2rem (fits screen with padding)
  - Height: 80vh (allows space for keyboard)
  - Input field font size: 16px (prevents iOS zoom)
- Tablet (375-768px):
  - ChatWidget width: 400px or 90% (whichever is smaller)
  - Height: 600px
- Desktop (≥768px):
  - ChatWidget width: 384px (w-96)
  - Height: 600px
  - Fixed position: bottom-6 right-6

**REQ-008: Z-Index Hierarchy**
- Chat button (toggle): z-40
- Chat panel: z-50
- Ensure panel doesn't obscure Sidebar (which uses z-40 for full mode)
- Z-index values must be defined in constants at top of component

**REQ-009: Typography & Branding**
- Headings (ChatWidget header): Montserrat font, bold, white color
- Body text (messages, input placeholder): Poppins font, regular weight
- Dark theme: #1D1B19 background where applicable; #865A5B accent color
- Icon: MessageCircle icon from lucide-react (hamburger menu style)

**REQ-010: Language Toggle UI**
- Two buttons: "English" and "Roman Urdu"
- Active button: burgundy background (#865A5B)
- Inactive button: glass background (white/10)
- Both buttons visible and clickable in ChatWidget header
- Smooth transition on toggle

**REQ-011: Auth Protection**
- ChatWidget must check session on mount
- If no session: show chat icon, but clicking redirects to `/auth/signin`
- If session exists: open ChatWidget panel
- Must handle auth state changes gracefully

---

### Integration Requirements

**REQ-012: Homepage Integration**
- ChatWidget must be injected into both `/app/page.tsx` (Homepage) and `/app/dashboard/layout.tsx`
- Must not modify existing Homepage layout or styling
- Must work with existing Sidebar on Dashboard without conflicts

**REQ-013: Error Handling**
- Network errors: Display user-friendly error message in ChatWidget
- 401 Unauthorized: Redirect to Sign-In page
- 404 Not Found: Display error message and suggest retry
- 503 Service Unavailable: Display message "AI service temporarily unavailable"

**REQ-014: Message History Display**
- Messages must display in chronological order (oldest at top, newest at bottom)
- Auto-scroll to latest message on new message arrival
- Must support long messages (word wrap, preserve formatting)
- Loading indicator (spinner) while awaiting response

---

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Chat API Availability | POST `/api/{user_id}/chat` returns 200 OK | 100% success rate (0 404 errors) |
| ChatWidget Visibility | Icon visible on Homepage to authenticated users | 100% presence on Home page |
| Glasmorphic Theme | Visual inspection of backdrop blur, burgundy colors | All UI elements match design spec |
| Responsive Behavior | ChatWidget renders correctly on mobile/tablet/desktop | All breakpoints functional |
| Language Toggle | English/Roman Urdu button functionality | Both options work without errors |
| Message Persistence | Messages visible after page refresh | 100% of sent messages persist |
| Z-Index Hierarchy | ChatWidget doesn't obscure Sidebar or other elements | No visual overlaps |
| Auth Protection | Non-authenticated users redirected to Sign-In | Redirect works on icon click |
| Performance | Chat response time from frontend to backend | <500ms round-trip |
| Error Handling | All error types handled gracefully | No unhandled exceptions in console |

---

## Scope

### In Scope
- ✅ Fix backend chat router registration
- ✅ Fix user_id path parameter alignment
- ✅ Implement glasmorphic ChatWidget theme
- ✅ Add ChatWidget to Homepage
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Language toggle (English/Roman Urdu)
- ✅ Auth protection (redirect if no session)
- ✅ Message history persistence
- ✅ Z-index hierarchy management
- ✅ Error handling for network/auth issues

### Out of Scope
- ❌ Voice input/transcription (Phase IV)
- ❌ Real-time WebSocket updates (Phase V)
- ❌ Tool execution UI (Phase II+)
- ❌ Message search/filtering (Phase V)
- ❌ Chat history export (Phase V)
- ❌ Custom themes (Phase V)

---

## Key Entities

### Backend
- **Conversation** table: Stores chat sessions with user_id, language preference, created_at
- **Message** table: Stores individual messages with conversation_id, role, content, timestamps
- **Chat Endpoint**: `POST /api/{user_id}/chat` accepts `{conversation_id?, message, language_hint?}`

### Frontend
- **ChatWidget** component: Floating fixed panel with message display, input field, language toggle
- **ChatMessage** interface: id, role ("user"|"assistant"), content
- **Z_INDEX** constants: Chat button (40), Chat panel (50)

---

## Dependencies

### Internal
- Conversation & Message SQLModels (already created)
- ChatService & AgentRunner (already created)
- Chat API endpoint (already created in `src/api/chat.py`)
- Better Auth session management
- OpenRouter API configuration

### External
- Framer Motion (animation library) - already in dependencies
- Lucide React (icons) - already in dependencies
- Tailwind CSS (styling) - already in dependencies

---

## Assumptions

1. **Database**: Neon PostgreSQL is available and Conversation/Message tables exist (or will be created via `reset_database.py`)
2. **Authentication**: Better Auth session management works correctly and provides `session.user.id`
3. **OpenRouter API**: OPENROUTER_API_KEY is configured in backend `.env`
4. **Fonts**: Montserrat and Poppins are available via Tailwind or Google Fonts import
5. **Z-Index Values**: Sidebar uses z-40 in full mode; no other elements use z-40 or z-50
6. **Message Format**: Backend returns JSON with `{conversation_id, assistant_message, tool_calls, messages}`
7. **User ID**: Always a string (not UUID) in path and JWT tokens
8. **Error Messages**: User-friendly messages acceptable in English and Roman Urdu

---

## Constraints

- **Cannot modify Sidebar component** - ChatWidget must integrate without changing Sidebar logic
- **Must preserve responsive behavior** - existing dashboard layout must not break
- **Must not hardcode secrets** - OpenRouter API key must come from environment variables
- **Must handle token expiration** - ChatWidget must redirect to Sign-In if session expires

---

## Testing Strategy

### Unit Tests
- Chat endpoint registration (router exists and is callable)
- User ID verification (JWT user_id matches path parameter)
- Message persistence (messages saved with correct data)
- Language preference storage and retrieval

### Integration Tests
- End-to-end chat flow (send message → backend → OpenRouter → response → display)
- User isolation (User A cannot see User B's conversations)
- Auth state changes (sign in/out triggers proper ChatWidget behavior)
- Message history persistence (refresh page → history visible)

### E2E Tests
- Homepage visibility (chat icon visible on Home page)
- ChatWidget interactions (open/close, send message, toggle language)
- Mobile responsive behavior (layout correct on small screens)
- Error scenarios (no connection, expired session, API error)

---

## Acceptance Tests

| Test | Action | Expected Result |
|------|--------|-----------------|
| T001 | POST `/api/{user_id}/chat` with valid request | Returns 200 OK (not 404) |
| T002 | View Homepage while authenticated | Chat icon visible in bottom-right |
| T003 | Click chat icon, open ChatWidget | Panel appears with smooth animation |
| T004 | Send message "hello" | Message appears in chat, response received |
| T005 | Click "Roman Urdu" button | Language toggles, placeholder text changes |
| T006 | Send message in Roman Urdu | LLM responds in Roman Urdu |
| T007 | Refresh page | Message history visible, conversation persists |
| T008 | Sign out, view Homepage | Chat icon still visible, click redirects to Sign-In |
| T009 | View on mobile (≤375px) | ChatWidget fits screen, no horizontal scroll |
| T010 | Inspect z-index of ChatWidget | Panel doesn't obscure Sidebar or other elements |

---

## Implementation Notes

- Backend fix is minimal: add import + router registration in `main.py`
- Frontend refactor: replace hardcoded styles with Tailwind classes for glasmorphic theme
- Component placement: inject ChatWidget in both Homepage and Dashboard layout (or use shared wrapper)
- Testing: verify POST endpoint returns 200 before testing frontend
- Rollout: test locally first, then deploy to staging for QA before production

