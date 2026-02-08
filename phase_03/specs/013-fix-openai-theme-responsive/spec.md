# Feature Specification: Fix OpenAI Error, Restore Burgundy Theme, and Fix UI Responsiveness

**Feature Branch**: `013-fix-openai-theme-responsive`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "Fix the 'OpenAI' undefined error, restore Burgundy theme, and fix UI responsiveness/visibility"

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

### User Story 1 - Fix Backend OpenAI Import Error (Priority: P1)

Users attempting to send messages in the ChatWidget receive a 500 Internal Server Error because the backend chat router fails to initialize the OpenAI client due to missing import statement. This is a critical blocker that prevents any chat functionality from working.

**Why this priority**: This is a critical backend error that completely breaks chat functionality. Without fixing this, users cannot send any messages regardless of frontend state. It's a P1 blocker.

**Independent Test**: Backend chat endpoint is tested by sending a message through the ChatWidget and verifying the endpoint returns a 200 response with a valid assistant message, not a 500 error.

**Acceptance Scenarios**:

1. **Given** a user is signed in and ChatWidget is open, **When** the user sends a message "hello", **Then** the backend receives the message, initializes the OpenAI client without errors, and returns a 200 response with the assistant's reply.
2. **Given** the backend service is restarted, **When** a user sends a chat message, **Then** the OpenAI client initializes successfully on the first request without NameError.

---

### User Story 2 - Restore Burgundy Theme Globally (Priority: P1)

The ChatWidget and dashboard components are displaying with inconsistent colors. The burgundy theme (#865A5B) that was applied during the previous implementation is not consistently visible across the application, particularly in the ChatWidget where it should provide strong visual branding. Buttons, borders, and accent colors need to use the burgundy palette.

**Why this priority**: This is a critical visual/branding issue. The burgundy theme is a key part of the application's identity. It's equally important as fixing the backend error.

**Independent Test**: Can be tested by opening the application on desktop and verifying that all burgundy theme elements (chat button, message bubbles, borders, toggles) display the correct color (#865A5B).

**Acceptance Scenarios**:

1. **Given** the application is loaded on desktop, **When** viewing the home page, **Then** the chat button appears with a burgundy gradient (from-burgundy to-purple-600).
2. **Given** the ChatWidget is open, **When** viewing the message interface, **Then** user message bubbles have a burgundy background and borders are burgundy-tinted.

---

### User Story 3 - Fix ChatWidget Responsiveness and Visibility (Priority: P1)

The ChatWidget is not visible or accessible on mobile and tablet devices. The chat icon is missing from the home page on small screens, the widget panel doesn't resize properly for mobile viewports, and the interface becomes unusable on devices under 640px width. Users on mobile devices cannot access the chat feature at all.

**Why this priority**: This is critical because it completely blocks mobile users from using the chat feature. The application must be responsive across all device sizes to meet modern web standards.

**Independent Test**: Can be tested by opening the application on a mobile device or simulating mobile viewport and verifying that: (1) the chat icon is visible, (2) clicking the icon opens the widget, (3) the widget panel is properly sized for mobile, and (4) users can send and receive messages.

**Acceptance Scenarios**:

1. **Given** the application is accessed on a mobile device (<640px width), **When** the home page loads, **Then** the chat button is visible and properly positioned.
2. **Given** the ChatWidget panel is opened on mobile, **When** viewing the panel, **Then** it takes up an appropriate width and fits within the mobile viewport without horizontal scrolling.

### Edge Cases

- What happens when the OpenAI client initialization fails due to invalid API key or network error?
- How does the system handle users accessing the app on ultra-wide displays (>1920px)?
- What happens when the viewport is at the exact breakpoint (640px)?
- How does the theme render on devices with reduced motion preferences?
- What happens when the ChatWidget is opened while the page is still loading?
- How does the responsive design handle landscape mode on mobile devices?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: Backend MUST import the OpenAI client at the start of the chat router module and make it available for all chat operations.
- **FR-002**: The OpenAI client MUST be initialized before any chat request is processed, preventing NameError exceptions.
- **FR-003**: All chat API endpoints MUST return proper error responses (not 500 errors) when OpenAI initialization fails, with a meaningful error message.
- **FR-004**: The ChatWidget button MUST be visible and clickable on all screen sizes (mobile, tablet, desktop).
- **FR-005**: The ChatWidget panel MUST display responsively on mobile devices with full-width layout when viewport is <640px.
- **FR-006**: The ChatWidget panel MUST display at 384px × 600px on desktop devices (≥640px) with proper positioning.
- **FR-007**: All visual elements in the ChatWidget MUST use the burgundy color (#865A5B) for primary theme elements.
- **FR-008**: The ChatWidget MUST be globally injected into the application layout so it appears on all pages.
- **FR-009**: The application MUST use Montserrat font for headings and Poppins font for body text.
- **FR-010**: The ChatWidget input field MUST use 16px font size to prevent iOS auto-zoom behavior.
- **FR-011**: All responsive styling MUST use Tailwind CSS breakpoints (sm: 640px) for consistency.

### Key Entities

- **ChatMessage**: Represents a single message in the conversation with role (user/assistant), content, and timestamp.
- **Conversation**: Represents a chat session with ID, user reference, created timestamp, and message history.
- **OpenAI Client**: The backend service that handles communication with OpenAI API for generating assistant responses.
- **ChatWidget Component**: The React component that provides the UI for chat interactions across the application.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Backend chat endpoint returns 200 status code for 100% of message submissions (previously failing with 500 errors).
- **SC-002**: ChatWidget button is visible and accessible on all tested screen sizes (320px mobile, 768px tablet, 1920px desktop).
- **SC-003**: ChatWidget panel displays within the mobile viewport without horizontal scrolling on screens <640px.
- **SC-004**: All burgundy-themed elements (#865A5B) render visually consistently across the application.
- **SC-005**: Users can send and receive messages on mobile devices without needing to switch to desktop view.
- **SC-006**: No JavaScript console errors related to OpenAI, component rendering, or responsive styling.
- **SC-007**: Production build completes successfully with no TypeScript errors or warnings.
- **SC-008**: ChatWidget component renders on all application pages without layout breakage.

---

## Assumptions

- OpenAI API keys are properly configured in the backend environment variables.
- The backend framework (FastAPI) is properly configured to load the OpenAI library.
- Tailwind CSS is configured with the `sm:` breakpoint at 640px.
- The Montserrat and Poppins font families are available and loaded from the previous implementation.
- CSS variables for burgundy color are already defined in Tailwind config from the previous implementation.
- Mobile testing will be performed using browser dev tools viewport simulation and physical devices.
- The application uses a single layout for all pages where the ChatWidget can be globally injected.

---

## Constraints & Scope

### In Scope

- Backend: Import and initialize OpenAI client in chat router
- Frontend: Fix ChatWidget responsiveness for mobile/tablet/desktop
- Frontend: Ensure burgundy theme is applied consistently
- Frontend: Global injection of ChatWidget into application layout
- Testing: Verify functionality on multiple viewport sizes

### Out of Scope

- Custom theme switching system
- Voice input/transcription features
- Message persistence improvements
- WebSocket real-time updates
- Advanced styling animations beyond current implementation
- OpenAI API parameter tuning or model selection

---

## Dependencies & Related Features

- **Previous Feature (012)**: Font configuration (Montserrat/Poppins) and color theming - assumed complete
- **Backend Service**: OpenAI API access and credentials
- **Build System**: Next.js and Tailwind CSS compilation
- **Testing**: Browser DevTools for responsive testing, physical devices for verification
