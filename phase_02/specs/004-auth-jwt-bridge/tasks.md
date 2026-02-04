# Tasks: Better Auth JWT Bridge

**Feature Branch**: `004-auth-jwt-bridge`
**Spec**: [specs/004-auth-jwt-bridge/spec.md](./spec.md)
**Status**: Ready

## Implementation Strategy
- **Phase 1 (Setup)**: Prepare environment and DB connection.
- **Phase 2 (Foundational)**: Implement Data Models (User, Task, etc.) and JWT verification core.
- **Phase 3 (Signup)**: Implement User Story 1 - Secure signup with Better Auth & Neon DB persistence.
- **Phase 4 (Access)**: Implement User Story 2 - Authenticated API access with JWT.
- **Phase 5 (Isolation)**: Implement User Story 3 - Data privacy and task ownership logic.
- **Phase 6 (Polish)**: Final cleanup and end-to-end verification.

---

## Phase 1: Setup

**Goal**: Prepare the environment and verify database connectivity.

- [x] T001 Verify .env configuration for `DATABASE_URL` and `BETTER_AUTH_SECRET` in backend/.env
- [x] T002 Implement database connection logic with SQLModel in backend/src/db/session.py
- [x] T003 Verify Neon DB connectivity and permissions in backend/tests/integration/test_db_conn.py
- [x] T003b Configure Better Auth client in frontend/lib/auth-client.ts
- [x] T003c Configure Better Auth server instance in frontend/lib/auth.ts

---

## Phase 2: Foundational (Models & JWT Core)

**Goal**: Define schema entities and implement core JWT verification logic used by all stories.

- [x] T004 [P] Define `User` SQLModel entity with String ID in backend/src/models/user.py
- [x] T005 [P] Define `Task` SQLModel entity with String ID foreign key and Cascade Delete in backend/src/models/task.py
- [x] T006 [P] Define `Account`, `Session`, `Verification` SQLModel entities with foreign keys in backend/src/models/auth.py
- [x] T007 Implement Alembic migration to create all tables in backend/alembic/versions/
- [x] T008 [P] Implement `verify_jwt` dependency manually using `BETTER_AUTH_SECRET` (no session lookups) in backend/src/core/security.py
- [x] T008b Implement Global Exception Middleware for consistent error responses in backend/src/core/middleware.py
- [x] T009 [P] Create unit tests for `verify_jwt` (valid, invalid, expired tokens) in backend/tests/unit/test_security.py

---

## Phase 3: New User Signup (User Story 1)

**Goal**: Enable users to sign up, ensuring persistence in Neon DB with correct ID mapping.
**Independent Test**: POST `/auth/signup/email` -> 201 Created -> DB Row Exists.

- [x] T010 [US1] Create Signup Request/Response schemas in backend/src/schemas/auth.py
- [x] T011 [US1] Implement atomic signup service logic (Better Auth + DB Insert transaction) in backend/src/services/auth_service.py
- [x] T012 [US1] Implement POST `/api/auth/signup/email` endpoint using atomic transaction service in backend/src/api/auth/routes.py
- [x] T013 [US1] Create integration test for successful signup flow in backend/tests/integration/test_signup.py
- [x] T014 [US1] Create integration test for duplicate email handling (409 Conflict) in backend/tests/integration/test_signup.py

---

## Phase 4: Authenticated API Access (User Story 2)

**Goal**: Protect API endpoints using the JWT bridge.
**Independent Test**: GET `/api/protected` -> 200 (with token) / 401 (without token).

- [x] T015 [US2] Implement `get_current_user` dependency utilizing `verify_jwt` in backend/src/api/deps.py
- [x] T016 [US2] Create a dedicated test endpoint `/api/health/protected` in backend/src/api/health.py to verify auth
- [x] T017 [US2] Update `main.py` to include auth router and exception handlers in backend/src/main.py
- [x] T018 [US2] Create integration tests for protected endpoint access (200 OK vs 401 Unauthorized) in backend/tests/integration/test_auth_access.py

---

## Phase 5: Data Privacy & Isolation (User Story 3)

**Goal**: Ensure users can only access their own tasks.
**Independent Test**: User A cannot access User B's task -> 403 Forbidden.

- [x] T019 [P] [US3] Create Task Request/Response schemas in backend/src/schemas/task.py
- [x] T020 [US3] Implement TaskService with owner-based filtering for all CRUD ops in backend/src/services/task_service.py
- [x] T021 [US3] Implement Task CRUD endpoints at `/api/{user_id}/tasks` using `get_current_user` in backend/src/api/tasks.py
- [x] T022 [US3] Create integration test for Task Creation (auto-assign user_id) in backend/tests/integration/test_task_isolation.py
- [x] T023 [US3] Create integration test verifying 403 Forbidden when accessing another user's task in backend/tests/integration/test_task_isolation.py
- [x] T024 [US3] Verify `ON DELETE CASCADE` behavior (delete user -> delete tasks) in backend/tests/integration/test_cascade_delete.py

---

## Phase 6: Polish

**Goal**: Final cleanups and verification.

- [x] T025 Run full backend test suite and ensure 100% pass rate
- [x] T026 Update project documentation/README if necessary
- [x] T027 Verify frontend-backend integration manually via Quickstart steps

## Dependencies

- **Phase 1** must complete before **Phase 2**.
- **Phase 2** must complete before **Phase 3, 4, 5**.
- **Phase 3, 4, 5** can be partially parallelized, but **Phase 3** (User creation) is logically required for integration testing **Phase 5** (User-owned tasks).
