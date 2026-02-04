# Feature Specification: Plannoir Premium Frontend & Authentication Bridge

**Feature Branch**: `002-frontend-auth`
**Created**: 2026-01-07
**Status**: Draft
**Input**: User description: "Plannoir Premium Frontend & Authentication Bridge

Focus: High-fidelity \"Fliki-style\" UI, secure guest-to-member transitions, and Better Auth JWT integration.

Success criteria:
    - Landing Page Fidelity: Replicates the exact dark aesthetic, pink/red accent glows, and glassmorphism from the provided screenshots (attached in reference-img/img1.png, reference-img/img2.png)
    - Access Control: Features and Use Cases sections are accessible to public users; Todo CRUD functionality is strictly locked behind authentication.
    - Aesthetic Dashboard: A dedicated, classy task management interface for logged-in users.
    - Responsive Navigation: A sticky, glassmorphism navbar that works perfectly on mobile and desktop.
    - JWT Bridge: Successfully attaches valid Better Auth JWT tokens to apiFetch headers for backend verification.

Constraints:
    - Framework: Next.js 16 (App Router) with TypeScript. tailwindcss.
    - UI Libraries: Shadcn/UI for components, Lucide React for icons, and Framer Motion for glowy animations.
    - Color Theory: Strict adherence to the uploaded image palette attached in reference-img/img1.png, reference-img2.png (Deep Black #0a0a0a, Pink-Red #e11d48, and soft radial glows).
    - Authentication: Better Auth with the JWT plugin and shared BETTER_AUTH_SECRET.
    - Folder Structure: All code restricted to the /frontend directory.

Not building:
    - AI Audio/Video features: Visual placeholders for \"AI\" branding only; no actual media processing.
    - Marketing Analytics: No SEO tracking or external analytics scripts.
    - Multi-tenant Workspaces: Single-user task management only (no team sharing)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Landing Page as Guest (Priority: P1)

Public users need to view the landing page with the premium aesthetic and features overview without authentication. The system should display the landing page with the exact dark aesthetic, pink/red accent glows, and glassmorphism as shown in the reference images.

**Why this priority**: This is the primary entry point for potential users and must showcase the premium aesthetic to attract signups.

**Independent Test**: Can be fully tested by accessing the homepage without authentication, verifying the visual fidelity matches reference images, delivering the value of showcasing the premium UI.

**Acceptance Scenarios**:
1. **Given** a user is not logged in, **When** they visit the homepage, **Then** they see the landing page with dark aesthetic, pink/red accents, and glassmorphism effects
2. **Given** a user is on the landing page, **When** they navigate to features/use cases sections, **Then** they can access this content without authentication

---

### User Story 2 - Authenticate and Access Protected Dashboard (Priority: P1)

Users need to authenticate with Better Auth and access the protected task management dashboard. The system should verify the JWT token and provide access to the aesthetic dashboard with task functionality.

**Why this priority**: Core functionality for converting guests to active users by providing the task management features.

**Independent Test**: Can be fully tested by authenticating as a user and accessing the dashboard, verifying JWT attachment to API calls, delivering the core value of task management.

**Acceptance Scenarios**:
1. **Given** a user is on the landing page, **When** they click to sign in, **Then** they can authenticate via Better Auth
2. **Given** a user is authenticated, **When** they access the dashboard, **Then** they see the task management interface with protected functionality

---

### User Story 3 - Perform Task Operations with JWT Authentication (Priority: P2)

Authenticated users need to perform CRUD operations on tasks with proper JWT authentication. The system should attach JWT tokens to API requests and ensure all operations are properly authenticated.

**Why this priority**: Essential functionality for the core value proposition of the application once users are authenticated.

**Independent Test**: Can be fully tested by authenticated user performing task operations with JWT-secured API calls, delivering the core task management value.

**Acceptance Scenarios**:
1. **Given** a user is authenticated, **When** they create a task, **Then** the API request includes a valid JWT header
2. **Given** a user is authenticated, **When** they perform any task operation, **Then** the JWT is verified by the backend

---

### User Story 4 - Navigate with Responsive Glassmorphism UI (Priority: P2)

Users need to navigate the application seamlessly across devices with the premium glassmorphism navbar. The system should provide a sticky, responsive navigation that works on both mobile and desktop.

**Why this priority**: Critical for user experience across all devices and maintains the premium aesthetic throughout the application.

**Independent Test**: Can be fully tested by navigating on different screen sizes, verifying responsive behavior and visual consistency, delivering consistent premium experience.

**Acceptance Scenarios**:
1. **Given** a user is on desktop, **When** they interact with the navbar, **Then** it displays with glassmorphism and glow effects
2. **Given** a user is on mobile, **When** they interact with the navbar, **Then** it remains functional and visually consistent

---

### Edge Cases

- What happens when a user's JWT token expires during a task operation?
- How does the system handle malformed JWT tokens in API requests?
- What occurs when a user tries to access protected routes without authentication?
- How does the system respond when authentication fails during login?
- What happens when the reference images are not accessible for color matching?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement Next.js 16 with App Router and TypeScript
- **FR-002**: System MUST use Tailwind CSS for styling with the specified color palette (#0a0a0a, #e11d48)
- **FR-003**: System MUST integrate Shadcn/UI components for consistent UI elements
- **FR-004**: System MUST use Lucide React for iconography
- **FR-005**: System MUST implement Framer Motion for glowy animations and transitions
- **FR-006**: System MUST integrate Better Auth with JWT plugin for authentication
- **FR-007**: System MUST attach JWT tokens to all API request headers for backend verification
- **FR-008**: System MUST restrict task CRUD functionality to authenticated users only
- **FR-009**: System MUST allow public access to landing page, features, and use cases sections
- **FR-010**: System MUST implement responsive glassmorphism navbar that works on mobile and desktop
- **FR-011**: System MUST ensure visual fidelity matches the reference images (dark aesthetic, pink/red accents, glassmorphism)
- **FR-012**: System MUST store BETTER_AUTH_SECRET consistently with backend for JWT verification

### Key Entities

- **User Session**: Represents an authenticated user session with JWT token for API authentication
- **Navigation State**: Manages the responsive navigation state across different screen sizes
- **API Client**: Handles authenticated requests to the backend with proper JWT headers

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Landing Page Fidelity achieved - frontend interface replicates exact dark aesthetic, pink/red accent glows, and glassmorphism from reference images.
- **SC-002**: Access Control implemented - Features and Use Cases sections accessible to public users while Todo CRUD functionality locked behind authentication.
- **SC-003**: Aesthetic Dashboard delivered - dedicated, classy task management interface for logged-in users with premium styling.
- **SC-004**: Responsive Navigation functional - sticky, glassmorphism navbar works perfectly on both mobile and desktop.
- **SC-005**: JWT Bridge operational - successfully attaches valid Better Auth JWT tokens to API fetch headers for backend verification.
- **SC-006**: Authentication Integration complete - Better Auth with JWT plugin properly configured and working.
- **SC-007**: Visual Consistency maintained - strict adherence to color palette (#0a0a0a, #e11d48) and design elements from reference images.
- **SC-008**: User Flow seamless - smooth transition from guest browsing to authenticated task management.
