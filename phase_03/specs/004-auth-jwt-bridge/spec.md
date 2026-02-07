# Feature Specification: Better Auth JWT Bridge

**Feature Branch**: `004-auth-jwt-bridge`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "Configuring Better Auth + JWT Bridge for FastAPI + Neon DB..."

## Clarifications

### Session 2026-01-11
- Q: How should we resolve the mismatch between Better Auth's string IDs and Neon DB's UUIDs? → A: Option A - Modify the Neon DB schema to use `TEXT` or `VARCHAR` for `user.id` and all related foreign keys.
- Q: How should the system handle potential sync failures between Better Auth's state and the application database? → A: Option A - Strict Transaction: Wrap both writes in a single DB transaction; rollback all if the application DB write fails.
- Q: Which header should be used to transmit the JWT token for API requests? → A: Option A - Bearer Token: `Authorization: Bearer <token>`.
- Q: Which API routes should be protected by JWT validation? → A: Option A - All Task Routes: Protect all CRUD operations for Tasks with JWT validation to ensure user-specific data isolation.
- Q: How should foreign key cleanup be handled when a user is deleted? → A: Option A - Cascade Delete: Configure DB-level `ON DELETE CASCADE` for all related tables (Tasks, Sessions, Accounts).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - New User Signup (Priority: P1)

As a new user, I want to sign up with my email and password so that I can create a secure account and access the system.

**Why this priority**: Core entry point for the application. Without signup, no other features can be used.

**Independent Test**: Can be fully tested by sending a POST request to `/auth/signup/email` and verifying the user is created in the database.

**Acceptance Scenarios**:

1. **Given** a new user with a valid email and password, **When** they submit the signup form, **Then** the system creates a user record in Neon DB, establishes a session, and returns a 201 Created response.
2. **Given** an existing user email, **When** a user tries to sign up with the same email, **Then** the system prevents duplicate creation and returns an appropriate error (409 or 400).

---

### User Story 2 - Authenticated API Access (Priority: P1)

As an authenticated user, I want my requests to be validated using a secure token so that I can access protected resources.

**Why this priority**: Essential for security and ensuring only valid users can interact with the API.

**Independent Test**: Can be tested by accessing a protected endpoint (e.g., `/tasks`) with a valid JWT and an invalid JWT.

**Acceptance Scenarios**:

1. **Given** a valid JWT token in the Authorization header, **When** the user accesses a protected endpoint, **Then** the request succeeds (200 OK) and the system correctly identifies the user.
2. **Given** an invalid or expired JWT token, **When** the user accesses a protected endpoint, **Then** the system denies access with a 401 Unauthorized response.

---

### User Story 3 - Data Privacy & Isolation (Priority: P1)

As a user, I want to only see and manage my own tasks so that my data remains private and secure.

**Why this priority**: Fundamental privacy requirement for a multi-user system.

**Independent Test**: Create two users (A and B) and two tasks (Task A owned by A). Authenticate as User B and attempt to access/modify Task A.

**Acceptance Scenarios**:

1. **Given** User A and User B exist, **When** User B attempts to access a task belonging to User A, **Then** the system denies access with a 403 Forbidden response.
2. **Given** an authenticated user, **When** they create a task, **Then** the task is automatically assigned to their user ID (foreign key).

### Edge Cases

- **UUID Mismatch**: (Resolved: Schema will use TEXT/VARCHAR).
- **Orphaned Records**: (Resolved: Cascade Delete). System MUST configure `ON DELETE CASCADE` on all foreign keys related to `user.id`.
- **DB Sync Failure**: (Resolved: Strict Transaction rollback). System MUST wrap Better Auth user creation and Neon DB user record insertion in a single atomic transaction.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST persist user identity data to the `user` table in Neon DB upon successful signup.
- **FR-002**: System MUST validate JWT tokens on all protected endpoints using `jwt-fastapi-bridge`.
- **FR-003**: System MUST extract the `user_id` from the validated JWT token and make it available to the route handler.
- **FR-004**: System MUST enforce foreign key constraints between `task`, `account`, `session`, `verification` tables and the `user` table.
- **FR-005**: System MUST use `TEXT` or `VARCHAR` for `user.id` in Neon DB to match Better Auth's string ID format.
- **FR-006**: System MUST prevent users from accessing or modifying resources (Tasks) not owned by their `user_id`.
- **FR-007**: System MUST use atomic transactions for user signup to ensure consistency between Auth state and Neon DB.
- **FR-008**: System MUST accept JWT tokens via the `Authorization: Bearer <token>` header for all authenticated requests.
- **FR-009**: System MUST protect all Task-related CRUD endpoints with JWT validation and owner-based authorization.
- **FR-010**: System MUST implement database-level `ON DELETE CASCADE` for all entities linked to the user.

### Key Entities

- **User**: Represents the identity, stored in `user` table. PK is `id` (String).
- **Task**: A unit of work. FK `user_id` (String) links to `User`.
- **Account**: Auth provider account details. FK `userId` (String) links to `User`.
- **Session**: Active user session. FK `userId` (String) links to `User`.
- **Verification**: Email/action verification tokens. FK `user_id` (String) links to `User`.

### Constraints

- **Libraries**: Must use `configuring-better-auth` for signup/DB mapping and `jwt-fastapi-bridge` for verification.
- **Framework**: FastAPI + SQLModel.
- **Database**: Neon DB (PostgreSQL).
- **UI**: No frontend UI changes are in scope.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `POST /auth/signup/email` returns HTTP 201 and creates a verifiable row in the `user` table.
- **SC-002**: Valid JWT tokens result in HTTP 200/201 on protected endpoints.
- **SC-003**: Invalid/Expired JWT tokens result in HTTP 401 on protected endpoints.
- **SC-004**: Requests for resources owned by another user result in HTTP 403.
- **SC-005**: Deleting a user record cascades and removes related Task, Session, and Account records (0 orphaned records).
