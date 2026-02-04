# Data Model: Secure JWT Auth Flow (Frontend)

**Note**: This data model represents the frontend state and interfaces. The backend schema is defined in `004-auth-jwt-bridge`.

## Frontend Entities

### User Session
Represents the currently authenticated user state in the frontend application.

| Field | Type | Description |
|-------|------|-------------|
| user | User | The user object (details below) |
| session | SessionInfo | Session metadata (expiry, etc.) |
| accessToken | string | The short-lived JWT for API access |

### User
The user profile information.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique User ID |
| email | string | User's email address |
| name | string | Display name |
| emailVerified | boolean | Verification status |
| image | string? | Profile picture URL (optional) |

### AuthResponse
The standard response structure from Better Auth endpoints (signup/login).

| Field | Type | Description |
|-------|------|-------------|
| user | User | User details |
| session | SessionInfo | Session details |
| token | string | The Access Token |

### APIError
Standard error structure for handling API failures.

| Field | Type | Description |
|-------|------|-------------|
| status | number | HTTP Status Code (e.g., 401, 409) |
| message | string | User-friendly error message |
| code | string? | Machine-readable error code |

## State Management

- **Auth State**: Managed via Better Auth's `useSession` hook (or equivalent).
- **Data Cache**: Managed via `SWR` cache (key-based).
- **Token Storage**:
  - `Access Token`: In-memory (via hook/context) or secure storage mechanism handled by Better Auth client.
  - `Refresh Token`: `HttpOnly` Cookie (browser-managed).
