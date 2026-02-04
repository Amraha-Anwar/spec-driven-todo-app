# Feature Specification: Secure JWT Auth Flow

**Feature Branch**: `005-jwt-auth-flow`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "Focus: Secure JWT authentication, signup/login flows, user-specific task access..."

## Clarifications

### Session 2026-01-11
- Q: Where should the JWT be stored on the frontend? → A: Option A - HTTP-Only Cookies: Safest against XSS; handled automatically by browser.
- Q: How should token expiration and persistence be handled? → A: Option A - Silent Refresh: Short-lived Access Token (JWT) + Long-lived Refresh Token (cookie).
- Q: Which data fetching strategy should be used for protected resources (Tasks)? → A: Option A - SWR/React Query: Best practice for Next.js; automatic caching and revalidation.
- Q: How should the frontend handle 401 Unauthorized errors and token refresh? → A: Option A - Axios Interceptors: Centralized 401 handling + automatic retry using Axios interceptors.
- Q: How should API errors (e.g., 409 Conflict) be presented to the user? → A: Option A - Generic Error Component: Consistent, centralized messaging (e.g., Toast or Alert) triggered by interceptors.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Signup & Login (Priority: P1)

As a new or returning user, I want to sign up or log in securely using my email and password so that I can access my private task list.

**Why this priority**: Fundamental entry point for the application.

**Independent Test**: Can be tested by performing a signup flow and verifying a valid JWT is received and stored.

**Acceptance Scenarios**:

1. **Given** a new user, **When** they submit valid email/password to `/auth/signup/email`, **Then** the system returns a 201 response with an Access Token, sets a Refresh Token cookie, and the frontend stores them securely.
2. **Given** an existing user, **When** they try to sign up with the same email, **Then** the system returns a 409 Conflict, and the frontend displays a "User already exists" toast message.
3. **Given** a registered user, **When** they login, **Then** they receive tokens and are redirected to the dashboard.

---

### User Story 2 - Authenticated Task Access (Priority: P1)

As an authenticated user, I want to view and manage my tasks so that I can organize my work without seeing other users' data.

**Why this priority**: Core value proposition of the secure todo app.

**Independent Test**: Can be tested by mocking a JWT for User A and attempting to fetch tasks (expecting User A's tasks) and ensuring no access to User B's tasks.

**Acceptance Scenarios**:

1. **Given** a stored access token, **When** the frontend requests `/tasks`, **Then** it includes the token in the `Authorization: Bearer` header.
2. **Given** a valid token, **When** fetching tasks, **Then** only tasks belonging to the current user are returned and cached locally via SWR/React Query.
3. **Given** an expired access token, **When** requesting tasks, **Then** the Axios interceptor catches the 401, performs a silent refresh, and retries the task fetch automatically.

---

### User Story 3 - Logout (Priority: P2)

As a user, I want to log out so that I can secure my session on a shared device.

**Why this priority**: Essential security feature.

**Independent Test**: Can be tested by clicking logout and verifying storage is cleared.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they click "Logout", **Then** both access and refresh tokens are cleared, the local cache is invalidated, and they are redirected to the home/login page.

---

### User Story 4 - Verification Status (Priority: P2)

As a user, I want to see my email verification status so that I know if my account is fully active.

**Why this priority**: Provides system feedback and encourages account completion.

**Independent Test**: Can be tested by checking the UI against the response from `/verification-status`.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they view their profile/dashboard, **Then** the frontend fetches `/verification-status` and displays whether the email is verified.

### Edge Cases

- **Refresh Failure**: What happens if the refresh token expires while the app is open? (Axios interceptor should redirect to login).
- **Network Error**: What if the API is down during login? (Display friendly error message).
- **Retry Loop**: Prevent infinite retry loops if the refresh endpoint also returns 401.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to sign up via `POST /auth/signup/email`.
- **FR-002**: System MUST return a short-lived Access Token (JWT) and set a long-lived Refresh Token (cookie) upon successful auth.
- **FR-003**: Frontend MUST store the Access Token securely and the browser MUST store the Refresh Token in an HTTP-only cookie.
- **FR-004**: Frontend MUST attach the Access Token to all protected API requests in the `Authorization: Bearer <token>` header via an Axios interceptor.
- **FR-005**: Frontend MUST implement an Axios response interceptor to handle 401 errors by attempting a token refresh and retrying the original request.
- **FR-006**: Frontend MUST display user-friendly error messages (e.g., 409 Conflict) using a centralized Toast or Alert component.
- **FR-007**: Frontend MUST use SWR or React Query for fetching and caching protected data (e.g., Tasks).
- **FR-008**: Frontend MUST display email verification status fetched from `/verification-status`.
- **FR-009**: Logout action MUST clear all tokens, invalidate the fetcher cache, and redirect to login.

### Key Entities

- **User**: The authenticated entity (ID, Email, VerificationStatus).
- **Access Token**: Short-lived JWT containing User ID.
- **Refresh Token**: Long-lived secure cookie for issuing new access tokens.
- **Task**: The resource protected by the JWT.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of API requests from authenticated sessions include a valid Authorization header.
- **SC-002**: Token refresh is transparent to the user, with no page reload required.
- **SC-003**: 409 Duplicate Email errors result in a visible error message 100% of the time.
- **SC-004**: Clicking logout clears all authentication and cached state immediately.
