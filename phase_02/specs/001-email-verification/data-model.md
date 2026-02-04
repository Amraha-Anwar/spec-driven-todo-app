# Data Model: Email Verification

## Entities

### User
- **id**: string (primary key) - Unique identifier for the user
- **email**: string (required) - User's email address
- **emailVerified**: boolean (default: false) - Whether the user has verified their email
- **name**: string (optional) - User's display name
- **createdAt**: timestamp - Account creation date
- **updatedAt**: timestamp - Last update date

**Validation rules**:
- email must be valid email format
- email must be unique
- emailVerified must be boolean

**State transitions**:
- emailVerified: false → true (when verification link is clicked)

### Verification Token
- **token**: string (primary key) - Unique verification token
- **userId**: string (foreign key) - Associated user
- **expiresAt**: timestamp - Expiration time for the token
- **createdAt**: timestamp - Token creation date

**Validation rules**:
- token must be unique
- expiresAt must be in the future
- userId must reference existing user

## Relationships
- User (1) ←→ (0..1) Verification Token (one-to-zero-or-one, as token is consumed after use)

## Constraints
- Users cannot sign in if emailVerified is false when requireEmailVerification is enabled
- Verification tokens expire after 24 hours
- Email addresses must be unique across all users