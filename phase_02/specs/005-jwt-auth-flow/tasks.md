# Tasks: Secure JWT Auth Flow

**Feature Branch**: `005-jwt-auth-flow`
**Spec**: [specs/005-jwt-auth-flow/spec.md](./spec.md)
**Status**: Ready

## Implementation Strategy
- **Phase 1 (Setup)**: Initialize Axios, SWR, and UI components.
- **Phase 2 (Foundational)**: Setup Authentication Context and Hooks using Better Auth.
- **Phase 3 (Signup/Login)**: Implement Signup and Login flows with error handling.
- **Phase 4 (Access)**: Implement Protected Routes and Task Fetching logic using SWR and Axios interceptors.
- **Phase 5 (User Management)**: Implement Verification Status and Logout.
- **Phase 6 (Polish)**: Final verification and cleanup.

---

## Phase 1: Setup

**Goal**: Prepare the frontend environment with necessary libraries and shared components.

- [x] T001 Install dependencies: `axios`, `swr` (or `@tanstack/react-query`), `sonner` in frontend/package.json
- [x] T002 [P] Create `GenericError` component (Toast/Alert) using `sonner` in frontend/src/components/ui/error-toast.tsx
- [x] T003 [P] Configure Axios instance with base URL in frontend/src/lib/api.ts

---

## Phase 2: Foundational (Auth Core)

**Goal**: Establish the authentication infrastructure using Better Auth and Axios interceptors.

- [x] T004 Implement `useAuth` hook wrapping Better Auth's `useSession` in frontend/src/hooks/use-auth.ts
- [x] T005 Implement Axios Request Interceptor to attach Access Token from memory/context in frontend/src/lib/api.ts
- [x] T006 Implement Axios Response Interceptor for 401 handling and silent refresh in frontend/src/lib/api.ts
- [x] T007 Create `AuthContext` provider to manage Access Token state in frontend/src/lib/auth-context.tsx

---

## Phase 3: Signup & Login (User Story 1)

**Goal**: Enable users to sign up and log in securely.
**Independent Test**: Signup -> 201 -> Dashboard; Duplicate Email -> 409 Toast.

- [x] T008 [US1] Create Signup Form component with validation in frontend/src/components/auth/signup-form.tsx
- [x] T009 [US1] Implement Signup logic calling `/auth/signup/email` and handling 409 errors in frontend/src/pages/auth/signup/page.tsx
- [x] T010 [US1] Create Login Form component in frontend/src/components/auth/login-form.tsx
- [x] T011 [US1] Implement Login logic calling Better Auth login endpoint in frontend/src/pages/auth/login/page.tsx
- [x] T012 [US1] Create integration test for Signup flow (Success & Duplicate) in frontend/tests/integration/auth-flow.test.ts

---

## Phase 4: Authenticated Task Access (User Story 2)

**Goal**: Fetch and display user-specific tasks securely.
**Independent Test**: Fetch Tasks -> 200 with Header; Token Expired -> Auto Refresh -> 200.

- [x] T013 [US2] Create SWR fetcher function using configured Axios instance in frontend/src/lib/fetcher.ts
- [x] T014 [US2] Implement `useTasks` hook using SWR for `/api/{user_id}/tasks` in frontend/src/hooks/use-tasks.ts
- [x] T015 [US2] Create Task List component displaying data from `useTasks` in frontend/src/components/tasks/task-list.tsx
- [x] T016 [US2] Implement Dashboard page ensuring protected access (redirect if no user) in frontend/src/pages/dashboard/page.tsx
- [x] T017 [US2] Create integration test for Protected Route access and Token Injection in frontend/tests/integration/task-access.test.ts

---

## Phase 5: Verification & Logout (User Stories 3 & 4)

**Goal**: Manage session lifecycle and account status.
**Independent Test**: Logout -> Clear State -> Redirect to Login.

- [x] T018 [US4] Implement `useVerificationStatus` hook fetching `/verification-status` in frontend/src/hooks/use-verification.ts
- [x] T019 [US4] Display verification status on Dashboard using the hook in frontend/src/pages/dashboard/page.tsx
- [x] T020 [US3] Implement Logout function clearing tokens and cache in frontend/src/lib/auth-actions.ts
- [x] T021 [US3] Connect Logout button in UI to Logout function in frontend/src/components/ui/user-menu.tsx
- [x] T022 [US3] Create integration test for Logout flow (Cache clear & Redirect) in frontend/tests/integration/logout.test.ts

---

## Phase 6: Polish

**Goal**: Final cleanups and end-to-end verification.

- [x] T023 Run full frontend test suite and ensure 100% pass rate
- [x] T024 Verify E2E flow: Signup -> Fetch Tasks -> Logout manually
- [x] T025 Update README with frontend auth flow details

## Dependencies

- **Phase 1 & 2** are prerequisites for all other phases.
- **Phase 3 (Signup/Login)** provides the tokens needed for **Phase 4 & 5**.
- **Phase 4** and **Phase 5** can be implemented in parallel once Auth Core is ready.
