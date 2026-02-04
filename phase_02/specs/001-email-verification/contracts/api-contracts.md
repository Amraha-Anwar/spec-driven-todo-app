# API Contracts: Email Verification

## Better Auth Integration Hooks

### sendVerificationEmail Hook
**Purpose**: Trigger email sending when user registers

**Input**:
```typescript
{
  email: string,
  url: string,  // Verification link
  token: string // Verification token
}
```

**Output**: Promise<void>

**Behavior**:
- Called automatically when user registers
- Sends email using Resend API
- Includes branded HTML template
- Contains verification link with token

## Database Operations

### Update User Verification Status
**Endpoint**: Internal (triggered by verification link click)

**Operation**: UPDATE users SET emailVerified = TRUE

**Where**: id = (extracted from verification token)

**Triggers**: User clicks verification link in email

## Verification Status Check
**Purpose**: Allow backend services to check verification status

**Method**: GET /api/user/{userId}/verification-status

**Response**:
```json
{
  "emailVerified": boolean,
  "email": string
}
```

**Authentication**: Requires valid JWT token

## Frontend Redirects

### After Successful Verification
**From**: Verification link click
**To**: /auth/signin?verified=true
**With**: Success message indicating verification completed

## Session Creation Constraints

### Pre-verification
- Block session creation for unverified users
- Return appropriate error when requireEmailVerification is true

### Post-verification
- Allow normal session creation flow
- No 500 errors during sign-in