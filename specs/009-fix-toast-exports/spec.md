# Feature Specification: Fix Vercel Deployment Type Errors

**Feature Branch**: `009-fix-toast-exports`
**Created**: 2026-02-04
**Status**: Draft
**Input**: User description: "Fix Vercel Deployment Type Errors — Resolve Next.js build failure caused by missing exports in toast component without altering any existing UI, layout, or authentication logic."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Successful Vercel Build After Fix (Priority: P1)

A developer pushes code to the repository and Vercel triggers a production build. The build completes without type errors. The deployed application functions identically to the local development version — login and signup forms display toast notifications correctly on success and failure.

**Why this priority**: The application cannot be deployed to production at all while the build fails. This is a total blocker for all users and stakeholders.

**Independent Test**: Can be fully tested by running the project build command and verifying zero type errors. Delivers a deployable production build.

**Acceptance Scenarios**:

1. **Given** the current codebase with the toast export fix applied, **When** the production build is executed, **Then** the build completes with zero type errors.
2. **Given** a deployed build, **When** a user submits the login form with valid credentials, **Then** a success toast notification appears and the user is redirected to the dashboard.
3. **Given** a deployed build, **When** a user submits the login form with invalid credentials, **Then** an error toast notification appears with the appropriate message.

---

### User Story 2 - Signup Form Toast Notifications Work (Priority: P1)

A new user fills out the signup form. On successful registration, they see a success toast and are redirected. On failure (e.g., duplicate email), they see an error toast with a meaningful message.

**Why this priority**: Signup is equally critical to login — both forms import the missing exports and both must work for the application to be functional.

**Independent Test**: Can be tested by submitting the signup form with valid and invalid data and observing toast behavior.

**Acceptance Scenarios**:

1. **Given** the signup form, **When** a user registers with a new email, **Then** a success toast appears and the user is redirected.
2. **Given** the signup form, **When** a user registers with an existing email, **Then** an error toast appears with the server-provided error message.

---

### Edge Cases

- What happens if the toast notification library (sonner) is not loaded? The build should still succeed; runtime behavior degrades gracefully.
- What happens if additional components import `showErrorToast` or `showSuccessToast` in the future? The fix must ensure these are stable, named exports that any component can import.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The toast module MUST export named functions `showErrorToast` and `showSuccessToast` that are importable by any component in the frontend.
- **FR-002**: The `showErrorToast` function MUST accept a string message and display an error-styled toast notification to the user.
- **FR-003**: The `showSuccessToast` function MUST accept a string message and display a success-styled toast notification to the user.
- **FR-004**: The production build MUST complete with zero type errors after the fix is applied.
- **FR-005**: The fix MUST NOT alter any existing visual layout, CSS styling, or UI component structure.
- **FR-006**: The fix MUST NOT modify any authentication logic, backend API connectivity, or data handling.
- **FR-007**: The fix MUST preserve the existing folder structure (`frontend/components/ui/` and `frontend/components/auth/`).
- **FR-008**: The existing `Toaster` component export from `components/ui/toast.tsx` MUST remain intact and unchanged.

### Constraints

- **C-001**: Only the import/export mismatch between the toast module and its consumers may be modified.
- **C-002**: No new dependencies may be introduced.
- **C-003**: UUID and user_id handling logic MUST remain untouched across all files.
- **C-004**: The cinematic dark toast styling (existing in `lib/toast.ts`) MUST be preserved.

### Assumptions

- The existing `lib/toast.ts` already contains the toast notification logic (`toast.success`, `toast.error`, `toast.info`) with correct styling. The issue is purely that `components/ui/toast.tsx` does not re-export convenience wrappers matching the names `showErrorToast` and `showSuccessToast`.
- Two consumer files are affected: `components/auth/login-form.tsx` and `components/auth/signup-form.tsx`. Both import `{ showErrorToast, showSuccessToast }` from `../ui/toast`.
- The fix involves either adding the missing named exports to `components/ui/toast.tsx` or updating the import paths in the consumer files — whichever is the smallest viable change.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Production build completes with zero type errors (verified by running the build command).
- **SC-002**: Login form displays success and error toast notifications correctly in all scenarios.
- **SC-003**: Signup form displays success and error toast notifications correctly in all scenarios.
- **SC-004**: No visual differences exist between the application before and after the fix (excluding the toast notifications that were previously broken at build time).
- **SC-005**: Total lines changed is fewer than 20, confirming the fix is minimal and targeted.
