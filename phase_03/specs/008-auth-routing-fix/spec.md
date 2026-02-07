# Feature Specification: Fix Authentication Middleware and URL Routing

**Feature Branch**: `008-auth-routing-fix`
**Created**: 2026-02-02
**Status**: Draft
**Input**: User description: "Fix Authentication Middleware and URL Routing
MUST GENERATE PHRs And look for the relevant skills/sug-agent and use them
Goal: Resolve remaining 401 Unauthorized and 404 Not Found errors in Phase II.

Focus:
- [cite_start]URL Consistency: All Task endpoints MUST start with /api/ prefix as per Phase II spec.
- [cite_start]JWT Verification: Fix get_current_user to properly decode Better Auth JWT tokens using the shared secret[cite: 158, 165].
- [cite_start]Frontend Headers: Ensure all fetch calls include 'Authorization: Bearer <token>'[cite: 157, 162].

Success Criteria:
- [cite_start]Tasks are successfully fetched and posted with 200/201 status.
- [cite_start]No 401 Unauthorized errors in logs for authenticated users."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Successful Task Operations with Authentication (Priority: P1)

Authenticated users can perform CRUD operations on tasks without encountering 401 Unauthorized or 404 Not Found errors. The system properly validates JWT tokens issued by Better Auth and routes requests to the correct endpoints.

**Why this priority**: This is the core functionality that must work for the application to be usable by authenticated users. Without proper authentication and routing, users cannot interact with their tasks.

**Independent Test**: Can be fully tested by logging in, performing various task operations (create, read, update, delete), and verifying that all operations return 200/201 status codes without authentication errors.

**Acceptance Scenarios**:

1. **Given** user is logged in with valid JWT token, **When** user attempts to fetch tasks, **Then** system returns 200 status with user's tasks
2. **Given** user is logged in with valid JWT token, **When** user attempts to create a new task, **Then** system returns 201 status with created task
3. **Given** user is logged in with valid JWT token, **When** user attempts to update a task, **Then** system returns 200 status with updated task
4. **Given** user is logged in with valid JWT token, **When** user attempts to delete a task, **Then** system returns 200 status confirming deletion

---

### User Story 2 - Proper URL Endpoint Consistency (Priority: P2)

All task-related API endpoints consistently use the /api/ prefix as specified in the Phase II specification, ensuring proper routing and avoiding 404 errors.

**Why this priority**: URL consistency is essential for maintaining a standardized API structure and preventing routing errors that lead to 404 responses.

**Independent Test**: Can be tested by verifying that all task endpoints follow the /api/ pattern and that requests to these endpoints are properly routed without returning 404 errors.

**Acceptance Scenarios**:

1. **Given** user has valid authentication token, **When** user makes requests to task endpoints, **Then** all endpoints start with /api/ prefix and return successful responses
2. **Given** frontend application makes API calls, **When** requests are sent to task endpoints, **Then** all requests are properly routed to backend services

---

### User Story 3 - Secure JWT Token Verification (Priority: P3)

The system properly verifies JWT tokens issued by Better Auth using the shared secret, ensuring that only authenticated users can access protected task endpoints.

**Why this priority**: Security is paramount to ensure that users can only access their own data and that unauthorized users cannot gain access to protected endpoints.

**Independent Test**: Can be tested by attempting to access protected endpoints with valid and invalid JWT tokens, ensuring that only valid tokens grant access.

**Acceptance Scenarios**:

1. **Given** user has valid JWT token from Better Auth, **When** user accesses protected task endpoints, **Then** system successfully authenticates the user
2. **Given** user has invalid or expired JWT token, **When** user accesses protected task endpoints, **Then** system returns 401 Unauthorized error
3. **Given** user makes request without JWT token, **When** user accesses protected task endpoints, **Then** system returns 401 Unauthorized error

---

### Edge Cases

- What happens when a JWT token is malformed or corrupted?
- How does the system handle expired JWT tokens?
- What occurs when the shared secret used for JWT verification becomes compromised?
- How does the system behave when there are mismatched URL patterns between frontend and backend?
- What happens when multiple authentication schemes are attempted simultaneously?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST verify JWT tokens using the shared secret from Better Auth
- **FR-002**: System MUST route all task endpoints with the /api/ prefix pattern
- **FR-003**: System MUST include 'Authorization: Bearer <token>' header in all frontend fetch calls to protected endpoints
- **FR-004**: System MUST return 200 status for successful task retrieval operations
- **FR-005**: System MUST return 201 status for successful task creation operations
- **FR-006**: System MUST return 401 status for unauthorized access attempts
- **FR-007**: System MUST return 404 status only for non-existent resources, not for routing errors
- **FR-008**: Backend get_current_user function MUST properly decode Better Auth JWT tokens
- **FR-009**: Frontend API calls MUST consistently use the correct URL format with /api/ prefix
- **FR-010**: System MUST ensure user isolation - authenticated users can only access their own tasks

### Key Entities

- **JWT Token**: Authentication token issued by Better Auth containing user identity information
- **Task**: User data entity representing a task item that requires authentication to access
- **API Endpoint**: Server routes that follow the /api/ prefix pattern for task operations
- **Authentication Middleware**: Server-side component that validates JWT tokens before allowing access to protected endpoints

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Task operations succeed - All task CRUD operations return 200/201 status codes for authenticated users
- **SC-002**: Authentication errors eliminated - No 401 Unauthorized errors occur for users with valid JWT tokens
- **SC-003**: Routing errors eliminated - No 404 Not Found errors occur due to incorrect URL patterns
- **SC-004**: URL consistency achieved - All task endpoints follow the /api/ prefix pattern
- **SC-005**: JWT verification works - Backend properly decodes and validates Better Auth JWT tokens using shared secret
- **SC-006**: Frontend headers correct - All fetch calls include proper Authorization header with Bearer token
- **SC-007**: User isolation maintained - Each authenticated user can only access their own tasks based on JWT claims
