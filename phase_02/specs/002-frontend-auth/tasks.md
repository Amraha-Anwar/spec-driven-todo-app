---
description: "Task list for Plannoir Frontend & Auth Reconstruction implementation"
---

# Tasks: Plannoir Frontend & Auth Reconstruction

**Input**: Design documents from `/specs/002-frontend-auth/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by implementation phases to enable structured development of the frontend.

## Format: `[ID] [P?] [Phase] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Phase]**: Which implementation phase this task belongs to (e.g., Phase1, Phase2, Phase3, Phase4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume web app structure - adjust based on plan.md structure

## Phase 1: Foundation & Styling (3 tasks)

**Purpose**: Establish the Next.js environment and the premium visual identity

### T1.1: Initialize Next.js Project

- [x] Initialize Next.js 16 (App Router) in `/frontend` directory
- [x] Install required dependencies: Tailwind CSS, Lucide React, Framer Motion, and Shadcn/UI
- [x] Set up basic project structure with proper TypeScript configuration
- [x] Configure Tailwind CSS with the "Plannoir" color palette (#0a0a0a, #e11d48)
- [x] Verify app starts successfully on localhost:3000
- [x] Output: `/frontend` directory with boilerplate and package configurations

### T1.2: "Fliki" Global Theme & Layout

- [x] Set up global CSS with deep dark backgrounds and radial glow utility classes
- [x] Implement root layout with sticky glassmorphism Navbar in `frontend/src/app/layout.tsx`
- [x] Create responsive navigation component with proper styling
- [x] Verify layout reflects the deep black/red aesthetic
- [x] Ensure Navbar is responsive and translucent as per design
- [x] Output: `globals.css` and `layout.tsx` with proper styling

### T1.3: Premium Hero Section

- [x] Build the Landing Page Hero section in `frontend/src/app/page.tsx`
- [x] Implement "heading for my app" layout as per design specifications
- [x] Add glowy pulsing "Get Started" button using Framer Motion
- [x] Ensure Hero section matches screenshot fidelity requirements
- [x] Verify buttons have correct hover/glow effects
- [x] Output: `page.tsx` (Landing page) and Hero component

---

## Phase 2: Authentication Bridge (3 tasks)

**Purpose**: Implement the Better Auth client and the JWT extraction logic

### T2.1: Better Auth Client Setup

- [x] Configure `auth-client.ts` with the JWT plugin
- [x] Ensure auth client points to Next.js auth routes
- [x] Export authClient instance for use in client components
- [x] Verify authClient instance is properly configured and usable
- [x] Output: `lib/auth-client.ts` with proper configuration

### T2.2: Auth API Routes

- [x] Create catch-all API route `frontend/src/app/api/auth/[...all]/route.ts`
- [x] Implement the Better Auth handler in the route
- [x] Verify navigating to `/api/auth/session` returns valid (or null) session object
- [x] Test that auth routes properly handle various authentication states
- [x] Output: Auth route handler in `api/auth/[...all]/route.ts`

### T2.3: Centralized Secure Fetcher

- [x] Implement `apiFetch` utility in `frontend/src/lib/api.ts`
- [x] Ensure utility automatically retrieves JWT from authClient
- [x] Add logic to append JWT to Authorization header for backend requests
- [x] Verify apiFetch successfully calls FastAPI backend with Bearer token when session exists
- [x] Output: `lib/api.ts` with secure fetch implementation

---

## Phase 3: Public & Protected Views (3 tasks)

**Purpose**: Build the informational sections and the secure Dashboard gate

### T3.1: Public Features & Use Cases

- [x] Build grid sections for Features as seen in screenshots
- [x] Build Use Cases section matching design specifications
- [x] Ensure all content is accessible without login
- [x] Verify content matches "Plannoir" branding requirements
- [x] Make sure UI is fully responsive on mobile devices
- [x] Output: Landing page feature components in appropriate directories

### T3.2: Auth Modals (Sign In/Up)

- [x] Implement Shadcn/UI-based dialogs for Login and Signup
- [x] Connect modals to authClient for authentication flow
- [x] Update Navbar state to show "Dashboard" or "Profile" after authentication
- [x] Verify users can successfully sign up and sign in
- [x] Output: `components/auth-modals.tsx` with functional auth modals

### T3.3: Dashboard Guard & Layout

- [x] Create `/dashboard` route with proper layout structure
- [x] Implement middleware redirect or client-side layout guard
- [x] Verify unauthorized users are redirected to home page when accessing `/dashboard`
- [x] Ensure protected route properly checks authentication status
- [x] Output: `/app/dashboard/layout.tsx` with authentication guard

---

## Phase 4: Task Management (3 tasks)

**Purpose**: Connect the UI to the FastAPI backend CRUD operations

### T4.1: Task List Component

- [x] Create the main dashboard view in `/app/dashboard/page.tsx`
- [x] Implement logic to fetch tasks using apiFetch
- [x] Display tasks in a "premium" list format matching design requirements
- [x] Verify tasks are correctly fetched from FastAPI backend and rendered
- [x] Output: `/app/dashboard/page.tsx` with task list implementation

### T4.2: Create/Update Task Forms

- [x] Implement forms to add and edit tasks with proper validation
- [x] Add optimistic updates for a "snappy" premium user experience
- [x] Connect forms to backend via POST/PUT API calls
- [x] Verify new tasks appear instantly in the list with proper feedback
- [x] Output: Task form components with create/update functionality

### T4.3: Toggle & Delete Logic

- [x] Connect the "Complete" toggle functionality to backend PATCH endpoint
- [x] Implement delete functionality using backend DELETE endpoint
- [x] Ensure task state updates correctly in both UI and database
- [x] Verify all CRUD operations work properly with the backend
- [x] Output: Final task logic integration with complete CRUD functionality

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundation)**: No dependencies - can start immediately
- **Phase 2 (Auth Bridge)**: Depends on Task 1.1 completion
- **Phase 3 (Views)**: Depends on Task 1.3 and Task 2.2 completion
- **Phase 4 (Task Management)**: Depends on Task 2.3 and Task 3.3 completion

### Task Dependencies Within Phases

- **Phase 1**: T1.1 → T1.2 → T1.3 (sequential dependencies)
- **Phase 2**: T2.1 → T2.2, T2.3 (T2.2 and T2.3 can run in parallel after T2.1)
- **Phase 3**: T3.1, T3.2 → T3.3 (T3.1 and T3.2 can run in parallel, both required before T3.3)
- **Phase 4**: T4.1 → T4.2 → T4.3 (sequential dependencies)