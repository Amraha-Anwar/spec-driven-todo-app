# Tasks: Email Verification with Resend

**Feature**: Email Verification with Resend
**Branch**: `001-email-verification`
**Created**: 2026-01-08
**Input**: Feature specification from `/specs/001-email-verification/spec.md`

## Dependencies

- **User Story 1 (P1)**: New User Registration with Email Verification
- **User Story 2 (P2)**: Email Verification Status Check
- **User Story 3 (P3)**: Branded Email Template

## Parallel Execution Examples

- T001-T003 can be executed in parallel (setup tasks)
- T010-T012 [US1] can be worked on independently from T020 [US2]
- T015 [US3] can be developed in parallel with other user stories

## Implementation Strategy

MVP: Implement User Story 1 with minimal email verification functionality.
Incremental delivery: Add branding and backend verification checks in subsequent phases.

---

## Phase 1: Setup

**Goal**: Prepare the development environment and verify existing infrastructure

- [x] T001 Create .env file with RESEND_API_KEY placeholder
- [x] T002 Verify existing Neon DB connection in lib/auth.ts
- [x] T003 Research Better Auth v1.0+ sendVerificationEmail hook syntax

---

## Phase 2: Foundation & Stability

**Goal**: Stabilize database connections and prepare for email verification

- [x] T004 [P] Verify 'pg' Pool configuration in lib/auth.ts; ensure DATABASE_URL includes 'sslmode=require' for Neon stability
- [x] T005 [P] Update lib/auth.ts with optimized Postgres adapter settings
- [x] T006 [P] Verify 'user' table schema has 'emailVerified' boolean field
- [x] T007 [P] Document Better Auth v1.0 payload format for 'sendVerificationEmail' hook
- [ ] T008 [P] Verify existing session creation flow works with current setup
- [ ] T009 [P] Set up error logging for sign-up attempts to verify no timeout issues

---

## Phase 3: User Story 1 - New User Registration with Email Verification (P1)

**Goal**: Enable email verification flow for new users to resolve 500 errors during sign-in

**Independent Test**: Can be fully tested by registering a new user, receiving a verification email, clicking the link, and then successfully signing in. This delivers the primary value of secure user authentication.

- [x] T010 [US1] Configure Resend API integration in lib/auth.ts with RESEND_API_KEY from environment variables
- [x] T011 [US1] Implement 'sendVerificationEmail' hook to trigger Resend API when user registers
- [x] T012 [US1] Verify that console logs show Resend API being triggered on signup
- [x] T013 [US1] Configure 'requireEmailVerification: true' in auth settings after testing flow
- [x] T014 [US1] Implement verification link handling that updates 'emailVerified' to TRUE in Neon DB
- [x] T015 [US1] Set up redirect logic to send verified users to '/auth/signin?verified=true'
- [x] T016 [US1] Test complete flow: register → receive email → click link → see verification success notification
- [x] T017 [US1] Verify sign-in works without 500 error for verified users
- [x] T018 [US1] Test that unverified users are blocked from signing in (should prevent 500 error)

---

## Phase 4: User Story 2 - Email Verification Status Check (P2)

**Goal**: Allow backend services to check email verification status for FastAPI integration

**Independent Test**: Can be tested by querying the user verification status through the authentication system and confirming that the status reflects the actual database value.

- [x] T020 [US2] Create backend endpoint GET /api/user/{userId}/verification-status in FastAPI
- [x] T021 [US2] Implement JWT verification middleware for verification status endpoint
- [x] T022 [US2] Query user's emailVerified status from Neon PostgreSQL
- [x] T023 [US2] Return appropriate response format: { "emailVerified": boolean, "email": string }
- [x] T024 [US2] Test that endpoint returns FALSE for unverified users
- [x] T025 [US2] Test that endpoint returns TRUE for verified users

---

## Phase 5: User Story 3 - Branded Email Template (P3)

**Goal**: Create branded, cinematic HTML template for verification emails

**Independent Test**: Can be tested by examining the verification email sent to users and confirming it matches the cinematic design standards.

- [x] T030 [US3] Create branded HTML template function with cinematic styling
- [x] T031 [US3] Apply Plannoir color scheme: Background #26131B, Primary #C94261, Surface #2F1A22
- [x] T032 [US3] Ensure template includes valid verification link with proper token
- [x] T033 [US3] Test email rendering in Gmail to ensure proper display
- [x] T034 [US3] Verify template includes proper styling for glassmorphic UI aesthetic
- [x] T035 [US3] Optimize template for mobile email clients

---

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Handle edge cases and finalize the implementation

- [x] T040 Implement verification token expiration (24 hours) handling
- [x] T041 Create error message for expired verification links
- [x] T042 Create error message for already-used verification tokens
- [x] T043 Handle invalid verification tokens with appropriate error response
- [x] T044 Implement graceful error handling when email service is unavailable
- [x] T045 Test edge case: user clicks verification link that has already been used
- [x] T046 Test edge case: user clicks an expired verification link
- [x] T047 Test edge case: user provides invalid verification token
- [x] T048 Document the complete email verification flow for future maintenance
- [x] T049 Verify all existing UI logic, Framer Motion animations, and glassmorphic styling remain unchanged
- [x] T050 Run complete end-to-end test of email verification flow