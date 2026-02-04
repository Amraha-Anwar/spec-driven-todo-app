# Tasks: UI Recovery, Route Repair, and PHR Compliance

**Feature**: Fix UI Fidelity and Auth Routing for Plannoir
**Branch**: `003-ui-fix-auth-routing`
**Spec**: [specs/003-ui-fix-auth-routing/spec.md](file:///mnt/d/phase-2/specs/003-ui-fix-auth-routing/spec.md)
**Plan**: [specs/003-ui-fix-auth-routing/plan.md](file:///mnt/d/phase-2/specs/003-ui-fix-auth-routing/plan.md)

## Phase 1: Architecture & Documentation Recovery

### Task 1.1: Retroactive PHR Generation (Phase 2)
- **Action**: Generate the missing 002-frontend-auth folder and history logs to document the Auth Bridge implementation.
- **Acceptance**: PHR files exist in history/ for Phase 2.
- **Files**: history/prompts/002-frontend-auth/
- **Tests**: Verify PHR files exist and contain relevant implementation details
- **Status**: [X] COMPLETED

### Task 1.2: Layout & Metadata Decoupling
- **Action**: Split layout.tsx into a Server Component (for metadata) and ClientLayout.tsx (for animations/state).
- **Acceptance**: Next.js builds without "export metadata from client component" error.
- **Files**: frontend/src/app/layout.tsx, frontend/src/app/ClientLayout.tsx
- **Tests**: Build the application and verify no metadata/client component errors
- **Status**: [X] COMPLETED

### Task 1.3: Absolute Path Alignment
- **Action**: Update all CSS and component imports to use the @/ alias (e.g., @/app/globals.css).
- **Acceptance**: No "Module not found" errors in the terminal.
- **Files**: All files that import CSS or components
- **Tests**: Run the application and verify all imports resolve correctly
- **Status**: [X] COMPLETED

## Phase 2: Visual Fidelity & Style Engine

### Task 2.1: Tailwind Config Audit
- **Action**: Fix tailwind.config.ts to include the correct content array paths so styles are compiled.
- **Acceptance**: Background turns pitch-black (#0a0a0a) on save.
- **Files**: frontend/tailwind.config.ts
- **Tests**: Verify bg-deep-black class renders as #0a0a0a background
- **Status**: [X] COMPLETED

### Task 2.2: Global Style Restoration
- **Action**: Inject the base body styles and .glassmorphism utility into globals.css.
- **Acceptance**: Navigation bar shows transparency and blur effects.
- **Files**: frontend/src/styles/globals.css
- **Tests**: Verify glassmorphism effect appears on navbar
- **Status**: [X] COMPLETED

### Task 2.3: Radial Glow Implementation
- **Action**: Add the radial-glow utility and apply it to the main motion.div in the layout.
- **Acceptance**: Homepage shows a subtle red glow behind the content.
- **Files**: frontend/tailwind.config.ts, frontend/src/styles/globals.css, frontend/src/app/ClientLayout.tsx
- **Tests**: Verify radial glow effect appears on homepage
- **Status**: [X] COMPLETED

## Phase 3: Route Resolution & 404 Fixes

### Task 3.1: Auth Directory Structure
- **Action**: Create the physical directory for /src/app/auth/signin/page.tsx and /src/app/auth/signup/page.tsx.
- **Acceptance**: Navigating to /auth/signin no longer returns a 404.
- **Files**: frontend/src/app/auth/signin/page.tsx, frontend/src/app/auth/signup/page.tsx
- **Tests**: Navigate to /auth/signin and /auth/signup and verify pages load without 404 errors
- **Status**: [X] COMPLETED

### Task 3.2: Sign-In/Up UI Construction
- **Action**: Build basic but functional auth forms in the new routes using Shadcn/UI.
- **Acceptance**: Login forms are visible and match the theme.
- **Files**: frontend/src/app/auth/signin/page.tsx, frontend/src/app/auth/signup/page.tsx
- **Tests**: Verify forms render with proper styling and inputs
- **Status**: [X] COMPLETED

### Task 3.3: Navbar Link Verification
- **Action**: Update the Navbar buttons to link correctly to the new auth paths.
- **Acceptance**: Clicking "Sign In" button changes the URL correctly.
- **Files**: frontend/src/app/ClientLayout.tsx  <!-- Updated to reflect actual file -->
- **Tests**: Click navbar buttons and verify navigation to correct routes
- **Status**: [X] COMPLETED

### Task 3.4: Final Turn PHR Entry
- **Action**: Update the tasks.md and generate the final implementation history record for this recovery phase.
- **Acceptance**: PHR record matches the current state of the UI and routing.
- **Files**: history/prompts/003-ui-fix-auth-routing/
- **Tests**: Verify PHR record is created with all implementation details
- **Status**: [X] COMPLETED