# Feature Specification: Fix UI Fidelity and Auth Routing for Plannoir

**Feature Branch**: `003-ui-fix-auth-routing`
**Created**: 2026-01-07
**Status**: Draft
**Input**: User description: "Fix UI Fidelity and Auth Routing for Plannoir

 Focus: Resolving style compilation errors, restoring \"Fliki\" aesthetic, and fixing broken routing

Success criteria:

Style Compilation: Tailwind CSS successfully compiles and applies bg-deep-black and text-pink-red to all components.

Visual Accuracy: Homepage renders with a pitch-black background (#0a0a0a), radial glows, and glassmorphism navbar matching the reference image.

Route Resolution: Navigating to \"Sign In\" or \"Sign Up\" no longer results in a 404 error.

Metadata Fix: Metadata is correctly exported from a Server Component while maintaining framer-motion interactivity in the layout.

Responsiveness: Navbar and Hero section display correctly as flex/grid containers rather than stacked plain text.

Constraints:

Tailwind Configuration: tailwind.config.ts must include the correct content paths to watch all files in src/app and src/components.

Path Aliases: Use absolute @/ imports for globals.css to prevent \"Module not found\" errors.

Next.js Standards: Move metadata out of 'use client' files to comply with App Router requirements.

Framework: Next.js 16+ using Turbopack for development.

Not building:

New backend features (focus is purely on UI/Frontend fix).

Database schema changes.

External assets or custom font hosting."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access Application with Proper Styling (Priority: P1)

Users need to access the application and see the proper "Fliki-style" aesthetic with the correct dark theme, radial glows, and glassmorphism effects. The system should render all components with the specified color palette (#0a0a0a background, #e11d48 pink-red accents).

**Why this priority**: This is the foundational visual experience that users encounter when visiting the application and must be consistent across all pages.

**Independent Test**: Can be fully tested by visiting any page and verifying that Tailwind CSS properly compiles and applies the bg-deep-black and text-pink-red classes, delivering the premium visual experience.

**Acceptance Scenarios**:
1. **Given** a user visits the homepage, **When** the page loads, **Then** they see the pitch-black background (#0a0a0a) with radial glows and glassmorphism effects
2. **Given** a user navigates to any page, **When** the page renders, **Then** all components properly display the specified color palette and visual effects

---

### User Story 2 - Navigate Auth Flows Without Errors (Priority: P1)

Users need to access authentication flows (Sign In/Up) without encountering 404 errors. The system should properly route users to the authentication modals or pages.

**Why this priority**: Authentication is a critical user journey and broken routing prevents users from signing in or signing up, which impacts core functionality.

**Independent Test**: Can be fully tested by clicking Sign In/Up links and verifying they lead to functional authentication UI, delivering the ability for users to authenticate.

**Acceptance Scenarios**:
1. **Given** a user is on any page, **When** they click the Sign In button, **Then** they are presented with a working authentication modal or routed to a Sign In page
2. **Given** a user is on any page, **When** they click the Sign Up button, **Then** they are presented with a working authentication modal or routed to a Sign Up page

---

### User Story 3 - Experience Responsive Layout (Priority: P2)

Users need to experience a responsive layout where the Navbar and Hero section display correctly as flex/grid containers rather than plain stacked text. The system should properly render layout elements using modern CSS techniques.

**Why this priority**: Proper layout is essential for user experience and ensures the application looks professional across different devices and screen sizes.

**Independent Test**: Can be fully tested by viewing the application on different screen sizes and verifying layout elements render as intended, delivering proper responsive design.

**Acceptance Scenarios**:
1. **Given** a user is viewing the application, **When** they resize the browser window, **Then** the Navbar and Hero section maintain proper flex/grid layouts
2. **Given** a user is on a mobile device, **When** they view the application, **Then** the layout elements adapt appropriately without stacking incorrectly

---

### Edge Cases

- What happens when Tailwind CSS fails to compile due to configuration errors?
- How does the system handle missing metadata in server components?
- What occurs when the global CSS file cannot be loaded?
- How does the application respond when framer-motion components fail to initialize?
- What happens when path aliases are misconfigured causing module resolution errors?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST configure Tailwind CSS to properly compile and apply bg-deep-black and text-pink-red classes to all components
- **FR-002**: System MUST render the homepage with pitch-black background (#0a0a0a) and radial glow effects matching reference images
- **FR-003**: System MUST implement glassmorphism navbar that works across all pages
- **FR-004**: System MUST fix routing to Sign In/Up pages to prevent 404 errors
- **FR-005**: System MUST export metadata from Server Components while maintaining framer-motion interactivity
- **FR-006**: System MUST ensure Navbar and Hero section display as flex/grid containers instead of stacked plain text
- **FR-007**: System MUST update tailwind.config.ts with correct content paths to watch files in src/app and src/components
- **FR-008**: System MUST use absolute @/ imports for globals.css to prevent module resolution errors
- **FR-009**: System MUST move metadata out of 'use client' files to comply with App Router requirements
- **FR-010**: System MUST maintain responsive design across different screen sizes

### Key Entities

- **Layout Component**: Represents the main application layout structure with proper metadata handling
- **Navigation State**: Manages the responsive navigation across different screen sizes
- **Styling Configuration**: Handles Tailwind CSS configuration and global styles application

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Style Compilation achieved - Tailwind CSS successfully compiles and applies bg-deep-black and text-pink-red to all components.
- **SC-002**: Visual Accuracy achieved - Homepage renders with pitch-black background (#0a0a0a), radial glows, and glassmorphism navbar matching reference image.
- **SC-003**: Route Resolution fixed - Navigating to "Sign In" or "Sign Up" no longer results in 404 errors.
- **SC-004**: Metadata Fix completed - Metadata is correctly exported from a Server Component while maintaining framer-motion interactivity in the layout.
- **SC-005**: Responsiveness achieved - Navbar and Hero section display correctly as flex/grid containers rather than stacked plain text.
- **SC-006**: Tailwind Configuration compliant - tailwind.config.ts includes correct content paths to watch all files in src/app and src/components.
- **SC-007**: Path Aliases resolved - Absolute @/ imports for globals.css prevent "Module not found" errors.
- **SC-008**: Next.js Standards compliance - Metadata is moved out of 'use client' files to comply with App Router requirements.
