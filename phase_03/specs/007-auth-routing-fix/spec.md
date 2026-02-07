# Feature Specification: Authentication Middleware and URL Routing Fix

**Feature Branch**: `007-auth-routing-fix`
**Created**: 2026-01-29
**Status**: Draft
**Input**: User description: "Fix Authentication Middleware and URL Routing

Goal: Resolve remaining 401 Unauthorized and 404 Not Found errors in Phase II.

Focus:
- [cite_start]URL Consistency: All Task endpoints MUST start with /api/ prefix as per Phase II spec.
- [cite_start]JWT Verification: Fix get_current_user to properly decode Better Auth JWT tokens using the shared secret[cite: 158, 165].
- [cite_start]Frontend Headers: Ensure all fetch calls include 'Authorization: Bearer <token>'[cite: 157, 162].
MUST CREATE ALL THE PHRs
Success Criteria:
- [cite_start]Tasks are successfully fetched and posted with 200/201 status.
- [cite_start]No 401 Unauthorized errors in logs for authenticated users."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Successful Task Operations (Priority: P1)

As an authenticated user, I want to be able to create, read, update, and delete tasks without encountering 401 Unauthorized or 404 Not Found errors, so that I can effectively manage my tasks through the application.

**Why this priority**: This is the core functionality of the application. Without proper authentication and routing, users cannot perform any task operations.

**Independent Test**: Can be fully tested by making authenticated API calls to task endpoints and verifying that they return 200/201 status codes instead of 401/404 errors.

**Acceptance Scenarios**:

1. **Given** a user is authenticated with a valid JWT token, **When** they make requests to task endpoints, **Then** the system returns 200/201 status codes for all operations
2. **Given** a user makes requests with proper 'Authorization: Bearer <token>' headers, **When** they interact with task endpoints, **Then** the system processes the requests without authentication errors

---

### User Story 2 - Consistent API Routing (Priority: P1)

As a developer, I want all task endpoints to follow consistent URL patterns with the /api/ prefix, so that the API is predictable and standardized across the application.

**Why this priority**: Consistent URL patterns are critical for API reliability and maintainability. Inconsistent routing leads to 404 errors and confusion.

**Independent Test**: Can be fully tested by verifying that all task endpoints follow the /api/{user_id}/tasks pattern and return proper responses.

**Acceptance Scenarios**:

1. **Given** a user makes requests to task endpoints, **When** the URLs follow the /api/ prefix pattern, **Then** the system routes requests to the correct endpoints
2. **Given** a user makes requests to legacy URLs without /api/ prefix, **When** the system receives the request, **Then** the system returns appropriate error responses or redirects to correct endpoints

---

### User Story 3 - Secure JWT Token Processing (Priority: P2)

As a security-conscious user, I want the system to properly decode and verify my JWT tokens using the shared Better Auth secret, so that my authentication is secure and reliable.

**Why this priority**: Proper JWT verification is essential for security and preventing unauthorized access to user data.

**Independent Test**: Can be tested by sending valid and invalid JWT tokens to protected endpoints and verifying that only valid tokens are accepted.

**Acceptance Scenarios**:

1. **Given** a user has a valid JWT token from Better Auth, **When** they make requests to protected endpoints, **Then** the system successfully verifies the token and grants access
2. **Given** a user has an invalid or expired JWT token, **When** they make requests to protected endpoints, **Then** the system returns appropriate authentication errors

---

### Edge Cases

- What happens when a JWT token is malformed or tampered with?
- How does the system handle requests with missing Authorization headers?
- What occurs when the Better Auth shared secret is incorrect or missing?
- How does the system behave when the /api/ prefix is partially present in URLs?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST ensure all task endpoints follow the /api/{user_id}/tasks pattern to maintain URL consistency
- **FR-002**: System MUST properly decode Better Auth JWT tokens using the shared secret to verify user authentication
- **FR-003**: System MUST include 'Authorization: Bearer <token>' header in all frontend fetch calls to authenticate requests
- **FR-004**: System MUST return 200/201 status codes for successful task operations instead of 401/404 errors
- **FR-005**: System MUST reject invalid JWT tokens and return appropriate authentication errors
- **FR-006**: System MUST maintain backward compatibility during the routing transition period if needed
- **FR-007**: System MUST log authentication failures for monitoring and debugging purposes

### Key Entities *(include if feature involves data)*

- **JWT Token**: Represents user authentication state, contains user identity and permissions, validated by backend services using Better Auth shared secret
- **Task**: Represents individual items that users can create, update, complete, or delete in the application
- **API Endpoint**: HTTP routes that handle task operations with proper /api/ prefix routing

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Tasks are successfully fetched and posted with 200/201 status - API calls return success status codes instead of 401/404 errors
- **SC-002**: No 401 Unauthorized errors in logs for authenticated users - authentication system properly validates JWT tokens
- **SC-003**: URL consistency maintained - all task endpoints use /api/ prefix pattern as required
- **SC-004**: JWT verification works correctly - Better Auth tokens are properly decoded using shared secret
- **SC-005**: Frontend headers properly set - all fetch calls include 'Authorization: Bearer <token>' headers
- **SC-006**: User isolation preserved - users can only access their own tasks based on authenticated identity
