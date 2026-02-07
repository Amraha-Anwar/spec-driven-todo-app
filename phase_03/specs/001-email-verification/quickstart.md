# Quickstart Guide: Email Verification

## Prerequisites
- Node.js 18+ and npm/yarn
- Next.js 16+ project
- Better Auth v1.0+ configured
- Neon PostgreSQL database connected
- Resend account and API key

## Setup Steps

### 1. Environment Variables
Add to your `.env` file:
```bash
RESEND_API_KEY=your_resend_api_key_here
```

### 2. Update Better Auth Configuration
Modify `lib/auth.ts` to include:
- Resend integration for `sendVerificationEmail` hook
- Enable `requireEmailVerification: true` after testing
- Ensure pg Pool adapter is configured

### 3. Verification Email Template
Create branded HTML template with cinematic styling matching:
- Background: #26131B
- Primary: #C94261
- Surface: #2F1A22

### 4. Database Schema
Verify Neon PostgreSQL 'user' table has:
- email (varchar) field
- emailVerified (boolean, default: false) field

## Testing the Flow
1. Register a new user account
2. Check Resend dashboard for API call
3. Verify email is sent to user's inbox
4. Click verification link in email
5. Confirm emailVerified status updates to TRUE
6. Attempt sign-in to verify 500 error is resolved

## Expected Behavior
- New users receive verification email after registration
- Unverified users cannot sign in (prevents 500 error)
- Verified users can sign in normally
- Verification status accessible to backend services