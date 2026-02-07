# Research: Frontend Authentication Bridge Implementation

## Overview
Research into implementing the Plannoir Premium Frontend with Better Auth integration, JWT communication, and "Fliki-style" UI.

## Frontend Architecture Analysis

### Next.js App Router Structure
- Layout-based routing with shared components
- Public routes accessible without authentication
- Protected routes requiring valid JWT
- Loading states and error boundaries for better UX

## Auth Integration Strategies

### Better Auth + JWT Plugin
- Better Auth handles the authentication flow
- JWT plugin generates tokens compatible with backend verification
- Client-side hooks for session management
- Token refresh mechanisms

### Auth Guard Strategy Options

**Option 1: Middleware-based Redirection**
- Uses Next.js middleware for route protection
- Handles authentication checks before page rendering
- Redirects unauthenticated users to sign-in page
- Pro: Centralized protection logic
- Pro: Server-side check prevents client-side bypass
- Con: Additional network round-trips for auth verification

**Option 2: Component-level Guards**
- Uses React components to wrap protected content
- Checks authentication state during render
- Displays loading/auth states inline
- Pro: Faster rendering, no extra round-trips
- Pro: More flexible per-component logic
- Con: Requires wrapping each protected component
- Con: Client-side only check (potential bypass)

**Decision**: Implement middleware-based redirection for dashboard routes as it provides stronger security guarantees and centralizes the auth logic, which is critical for protecting sensitive task management functionality.

## State Management Approaches

### React Context vs. Native Better Auth Hooks

**React Context**
- Pro: Full control over state management
- Pro: Can combine auth state with other app state
- Pro: Familiar pattern for React developers
- Con: Additional boilerplate code
- Con: Need to implement persistence separately
- Con: Possible inconsistency with Better Auth's internal state

**Native Better Auth Hooks**
- Pro: Officially supported and maintained
- Pro: Automatic token refresh and persistence
- Pro: Built-in error handling
- Pro: Less custom code to maintain
- Con: Less control over internal state
- Con: Dependency on Better Auth's API

**Decision**: Use native Better Auth hooks for managing session persistence as it provides official support, automatic token management, and reduces custom code maintenance.

## Component Strategy

### Shadcn/UI vs. Custom Components

**Structural Elements (Shadcn/UI)**
- Buttons, modals, inputs, dialogs
- Well-tested and accessible
- Consistent design system
- Faster development

**Custom Glow Effects (Custom)**
- Radial glows and animations
- Unique visual identity
- Brand-specific styling
- Requires custom implementation

**Decision**: Use Shadcn/UI for structural elements to leverage well-tested, accessible components while custom-coding glow effects to achieve the specific "Fliki-style" aesthetic required by the design specifications.

## API Client Implementation

### Centralized Fetch Wrapper
- Intercepts all API requests
- Attaches JWT token from auth client
- Handles token expiration and refresh
- Centralizes error handling
- Provides consistent request/response patterns

## Animation and Styling

### Framer Motion for Glowing Effects
- Provides advanced animation capabilities
- Good performance with React
- Support for complex gesture interactions
- Can create the pulsing and glow effects needed
- Integrates well with Tailwind CSS

## Security Considerations
- JWT tokens stored securely in httpOnly cookies where possible
- Proper token validation on both client and server
- Protection against CSRF and XSS attacks
- Secure communication with backend API
- Proper logout functionality clearing all tokens