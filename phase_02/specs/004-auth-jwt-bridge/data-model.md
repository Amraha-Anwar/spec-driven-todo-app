# Data Model: Better Auth JWT Bridge

## Entities

### User
Represents the identity of a system user.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | String | Yes | PK | Better Auth ID (TEXT) |
| email | String | Yes | Unique, Email | User's email address |
| emailVerified | Boolean | Yes | Default: False | Email verification status |
| name | String | Yes | | User's display name |
| image | String | No | | Profile image URL |
| createdAt | DateTime | Yes | | Creation timestamp |
| updatedAt | DateTime | Yes | | Last update timestamp |

### Task
A unit of work created by a user.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | UUID | Yes | PK | Unique task identifier |
| title | String | Yes | Max 255 | Task title |
| description | String | No | | Detailed description |
| is_completed | Boolean | Yes | Default: False | Completion status |
| user_id | String | Yes | FK -> User.id | Owner ID (TEXT) |
| created_at | DateTime | Yes | | Creation timestamp |
| updated_at | DateTime | Yes | | Last update timestamp |

### Account
OAuth/Provider account details (Better Auth managed).

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | String | Yes | PK | Account ID |
| userId | String | Yes | FK -> User.id | Linked User ID |
| accountId | String | Yes | | Provider's internal ID |
| providerId | String | Yes | | Provider name (e.g. "google") |
| accessToken | String | No | | OAuth access token |
| refreshToken | String | No | | OAuth refresh token |
| expiresAt | DateTime | No | | Token expiration |
| password | String | No | | Hashed password (if credential auth) |

### Session
Active user session (Better Auth managed).

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | String | Yes | PK | Session ID |
| userId | String | Yes | FK -> User.id | Linked User ID |
| token | String | Yes | Unique | Session token |
| expiresAt | DateTime | Yes | | Expiration timestamp |
| ipAddress | String | No | | Client IP |
| userAgent | String | No | | Client User Agent |

### Verification
Verification tokens (Better Auth managed).

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | String | Yes | PK | Verification ID |
| identifier | String | Yes | | Target (e.g., email) |
| value | String | Yes | | Token value |
| expiresAt | DateTime | Yes | | Expiration timestamp |

## Relationships

- **User (1) -> (Many) Task**: One user can own multiple tasks. Task cannot exist without a User (`ON DELETE CASCADE`).
- **User (1) -> (Many) Account**: One user can have multiple auth accounts (e.g., Email + Google).
- **User (1) -> (Many) Session**: One user can have multiple active sessions.
