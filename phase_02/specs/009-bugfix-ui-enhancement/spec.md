# Feature Specification: Bugfix & UI Enhancement Sprint

**Feature Branch**: `009-bugfix-ui-enhancement`
**Created**: 2026-02-05
**Status**: Draft
**Input**: User description: "Fix 500 errors on tasks, settings persistence, error messages, and enhance UI to match reference.png glassmorphic style across Landing, Features, About, and Pricing pages."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Task CRUD Works End-to-End (Priority: P1)

A signed-in user navigates to their dashboard and sees their tasks load. They can create a new task, edit it, toggle completion, and delete it — all without 500 errors.

**Why this priority**: Tasks are the core product. A 500 on load/create makes the app unusable. This blocks all other features.

**Root Cause Analysis**: The frontend calls `/api/${userId}/tasks` via the `api` axios client. The `api` client has `baseURL` set to the FastAPI backend (e.g., `https://amraha-anwar-plannior-backend.hf.space`). So the actual request becomes `https://.../api/{userId}/tasks`. The backend mounts the tasks router at `prefix="/api"` (`backend/src/main.py:43`), making the full route `/api/{user_id}/tasks`. This means the frontend is sending requests to `/api/{userId}/tasks` which resolves correctly on the backend. The 500 is therefore **not a routing mismatch** but a **server-side error** — likely:
1. The `current_user` dependency (`deps.py:12-55`) returns a dict `{"id": ..., "session_id": ...}` but the tasks router (`tasks.py:17`) compares `current_user.id` (attribute access on a dict), which raises `AttributeError` and results in 500.
2. Or the session token from Better Auth (now properly set via cookie) is not being sent as a Bearer token to FastAPI correctly.

**Independent Test**: Sign in, navigate to `/dashboard`, verify tasks load (no 500). Create a task, refresh, verify it persists.

**Acceptance Scenarios**:

1. **Given** a signed-in user on `/dashboard`, **When** the page loads, **Then** the task list fetches from FastAPI without errors and displays tasks (or empty state).
2. **Given** a signed-in user, **When** they create a task via the "Create New Task" form, **Then** the task appears in the list immediately via SWR revalidation.
3. **Given** a signed-in user with tasks, **When** they toggle completion, edit, or delete a task, **Then** the change persists and the UI updates without 500 errors.
4. **Given** a signed-in user, **When** the Bearer token is missing or expired, **Then** the API returns 401 (not 500) and the frontend redirects to `/auth/signin`.

---

### User Story 2 - Meaningful Auth Error Messages (Priority: P1)

Users see specific, actionable error messages during sign-up and sign-in instead of generic "something went wrong" toasts.

**Why this priority**: Tied with P1 — users cannot self-diagnose login/signup failures without clear messages. This causes support burden and user drop-off.

**Current State**:
- `auth_service.py:13` returns `409` with `"User already exists"` — but the frontend auth pages (`signin/page.tsx`, `signup/page.tsx`) may not surface `error.response?.data?.detail` correctly.
- `login-form.tsx:4` imports `showErrorToast`/`showSuccessToast` from `../ui/toast` — but `toast.tsx` only exports `toast` object with `.success()/.error()/.info()` methods. This causes a **build-breaking import error**.
- The signin/signup page files (inline forms) catch errors but may show generic messages.

**Independent Test**: Attempt signup with an existing email — should see "User already exists". Attempt signin with wrong password — should see "Invalid email or password".

**Acceptance Scenarios**:

1. **Given** the signup page, **When** a user registers with an already-registered email, **Then** a toast displays "An account with this email already exists".
2. **Given** the signin page, **When** a user enters wrong credentials, **Then** a toast displays "Invalid email or password".
3. **Given** the signin page, **When** a user leaves fields empty and submits, **Then** HTML5 validation prevents submission (required fields).
4. **Given** the signup page, **When** a user enters a password under 8 characters, **Then** a client-side validation message appears before the request fires.
5. **Given** any auth page, **When** a network error occurs, **Then** a toast displays "Network error. Please check your connection and try again."

---

### User Story 3 - Settings Page Persistence (Priority: P2)

A user can update their display name on the Settings page and see the change reflected in the sidebar and on page refresh.

**Why this priority**: Settings work is expected by users but is not blocking core task management.

**Current State**:
- `settings/page.tsx:23-31` simulates save with `setTimeout` — no actual API call.
- `handleAvatarChange` (`settings/page.tsx:33-36`) logs to console and shows "coming soon" toast.
- Better Auth provides `authClient.updateUser()` for updating name/image on the user record.

**Independent Test**: Change name on Settings page, click Save. Refresh the page. Verify the new name persists in both Settings and the Sidebar.

**Acceptance Scenarios**:

1. **Given** the Settings page, **When** a user changes their name and clicks Save, **Then** an API call updates the user record via Better Auth's `updateUser` and the sidebar reflects the new name.
2. **Given** the Settings page, **When** the save succeeds, **Then** a success toast appears and the session data is refreshed.
3. **Given** the Settings page, **When** the save fails (e.g., network error), **Then** an error toast appears and the field retains the user's input.
4. **Given** the Settings page avatar section, **When** a user uploads an image, **Then** the avatar updates in real-time (or a clear "feature not available" message is shown with no broken state).

---

### User Story 4 - Fix Build-Breaking Import Errors (Priority: P1)

The production build succeeds without TypeScript errors in `login-form.tsx`, `signup-form.tsx`, and `user-menu.tsx`.

**Why this priority**: The Next.js build fails due to missing imports. This blocks deployment.

**Current State**:
- `components/auth/login-form.tsx:4` imports `{ showErrorToast, showSuccessToast }` from `../ui/toast` — these exports don't exist.
- `components/auth/signup-form.tsx:5` imports the same non-existent exports.
- `components/ui/user-menu.tsx:3-4` imports from `@/lib/auth-actions` and `@/hooks/use-auth` — need to verify these modules exist or fix imports.

**Independent Test**: Run `npx next build` — should complete with exit code 0.

**Acceptance Scenarios**:

1. **Given** the codebase, **When** `npx next build` runs, **Then** it completes successfully with zero TypeScript errors.
2. **Given** `login-form.tsx` and `signup-form.tsx`, **When** they display errors, **Then** they use the correct `toast.error()` / `toast.success()` from `../../lib/toast`.

---

### User Story 5 - Glassmorphic UI Enhancement: Landing Page (Priority: P3)

The landing page (`/`) matches the reference.png visual style: dark burgundy-black background, glassmorphic navbar, prominent hero with accent-colored keyword, trust badges, and a polished CTA.

**Why this priority**: UI polish is important for brand perception but doesn't affect functionality.

**Reference Image Analysis** (from `frontend/reference.png`):
- **Background**: Deep dark burgundy-black (#1a0a10 to #0a0a0f gradient)
- **Navbar**: Transparent/glass with subtle border, logo left, nav links center, Login/Signup buttons right (Signup has accent fill)
- **Hero**: Large bold heading with one accent-colored word, subtitle paragraph, primary CTA button with accent gradient, "No credit card required" subtext
- **Trust section**: "TRUSTED BY" label with logos (horizontal row)
- **Product preview**: Dashboard screenshot at bottom with subtle glow underneath

**Independent Test**: Navigate to `/` — visual comparison against reference.png shows matching layout, color scheme, and glassmorphic effects.

**Acceptance Scenarios**:

1. **Given** the landing page, **When** a visitor loads it, **Then** the hero heading uses 1 accent-colored word within the main title (matching reference pattern).
2. **Given** the landing page, **When** a visitor scrolls, **Then** the features grid displays with glassmorphic cards, radial glow, and hover elevation effects.
3. **Given** the landing page navbar, **When** a user is not signed in, **Then** "Login" appears as text link and "Sign Up" appears as an accent-filled pill button (matching reference).
4. **Given** the landing page, **When** viewed on mobile, **Then** the layout remains responsive with stacked elements and the navbar collapses.

---

### User Story 6 - Glassmorphic UI Enhancement: Features, About & Pricing Sections (Priority: P3)

The Features page, About section, and Pricing section receive premium Plannoir-specific copywriting and strict glassmorphic styling consistent with the landing page.

**Why this priority**: Completes the marketing/public-facing experience but is independent of product functionality.

**Independent Test**: Navigate to `/features` and the landing page `#pricing` / `#about` sections — copywriting is professional, design is consistent with reference.

**Acceptance Scenarios**:

1. **Given** the Features page (`/features`), **When** loaded, **Then** it displays Plannoir-specific feature descriptions (not generic), with glassmorphic cards and the same accent color scheme.
2. **Given** the landing page `#about` section, **When** scrolled to, **Then** it presents Plannoir's value proposition with professional copy (not placeholder text).
3. **Given** the landing page `#pricing` section, **When** scrolled to, **Then** it displays at least 2 pricing tiers (Free / Pro) with glassmorphic card styling, feature lists, and CTA buttons.
4. **Given** all enhanced pages, **When** inspected, **Then** Tailwind classes use the existing `pink-red`, `glow-text`, `glow-effect`, and `glassmorphic` utility classes — no new CSS framework or color system is introduced.

---

### Edge Cases

- **Task API with malformed UUID**: If `userId` in the URL is not a valid UUID format, the backend should return 400 (not 500).
- **Concurrent session expiry**: If a session expires mid-use, the axios 401 interceptor should redirect once (not loop).
- **Empty task list**: Dashboard should display a friendly empty state, not a broken layout.
- **Settings save during session expiry**: If the session expires while saving settings, show "Session expired — please sign in again" instead of a generic error.
- **Large task titles**: Titles exceeding 255 chars should be validated client-side before submission.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Bug Fixes (P1)

- **FR-001**: System MUST fix the 500 error on task operations by ensuring `current_user` dict access is compatible with how `tasks.py` reads `current_user.id` (use `current_user["id"]` or wrap in a proper model).
- **FR-002**: System MUST fix the build-breaking imports in `login-form.tsx` and `signup-form.tsx` by replacing `showErrorToast`/`showSuccessToast` with the correct `toast.error()`/`toast.success()` from `../../lib/toast`.
- **FR-003**: System MUST fix the broken imports in `user-menu.tsx` by resolving `@/lib/auth-actions` and `@/hooks/use-auth` to existing modules or creating them.
- **FR-004**: System MUST surface specific error messages from the backend (`detail` field) in auth toasts — "User already exists" (409), "Invalid email or password" (401), "Session expired" (401).
- **FR-005**: System MUST include a network error fallback message when `error.response` is undefined (no server response).

#### Settings (P2)

- **FR-006**: System MUST call Better Auth's `authClient.updateUser({ name })` when the user saves their name on the Settings page.
- **FR-007**: System MUST refresh the session data after a successful settings save so the sidebar reflects the updated name.
- **FR-008**: System MUST show a clear toast on save success or failure with specific messaging.

#### UI Enhancement (P3)

- **FR-009**: Landing page MUST match reference.png layout: glassmorphic navbar, hero with accent keyword, trust section, product preview area, and CTA.
- **FR-010**: Landing page MUST use professional Plannoir-branded copywriting (not generic placeholder text).
- **FR-011**: Features page MUST use professional Plannoir-specific feature descriptions with consistent glassmorphic styling.
- **FR-012**: Landing page MUST include `#about` and `#pricing` anchor sections with glassmorphic cards and professional copy.
- **FR-013**: All UI changes MUST use existing Tailwind utilities (`pink-red`, `glassmorphic`, `glow-text`, `glow-effect`, `deep-black`) — no new color system.
- **FR-014**: All UI changes MUST be mobile-responsive.

### Key Entities

- **User** (`backend/src/models/user.py`): id, name, email, emailVerified, image, createdAt, updatedAt. Updated via Better Auth `updateUser` for name/image changes.
- **Task** (`backend/src/models/task.py`): id, title, description, is_completed, priority, due_date, user_id, created_at, updated_at. CRUD via FastAPI `/{user_id}/tasks`.
- **Session** (`backend/src/models/auth.py`): id, token, expiresAt, userId. Validated by `deps.py:get_current_user` for Bearer token auth.

---

## Constraints & Invariants

1. **Auth handshake MUST NOT break**: The recently fixed `authClient.baseURL` (pointing to Next.js Better Auth server) and bcrypt password verification MUST remain intact.
2. **No database schema changes**: All fixes use existing tables (`user`, `task`, `session`, `account`).
3. **No FastAPI route changes**: Backend routes (`/api/{user_id}/tasks`) stay the same — only the dict access pattern in `tasks.py` may change.
4. **No new CSS framework**: All styling uses existing Tailwind config with current custom utilities.
5. **No new npm dependencies for UI**: Use existing `framer-motion`, `lucide-react`, `date-fns`, Tailwind.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `npx next build` completes with exit code 0 (zero TypeScript errors).
- **SC-002**: Task CRUD operations (list, create, update, delete, toggle) return 2xx responses — no 500 errors.
- **SC-003**: Auth error messages are specific: "User already exists" on duplicate signup, "Invalid email or password" on wrong credentials.
- **SC-004**: Settings name change persists across page refresh and reflects in the sidebar.
- **SC-005**: Landing page visual layout matches reference.png structure (glassmorphic navbar, hero with accent word, trust section, CTA).
- **SC-006**: Features, About, and Pricing content uses professional Plannoir-branded copy (no placeholder text).
- **SC-007**: All changes pass mobile responsiveness check (no horizontal overflow on 375px viewport).
