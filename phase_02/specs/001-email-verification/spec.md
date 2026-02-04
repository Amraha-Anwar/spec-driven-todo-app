# Feature Specification: Email Verification with Resend

**Feature Branch**: `001-email-verification`
**Created**: 2026-01-08
**Status**: Draft
**Input**: User description: "Implement Email Verification using Resend and Better Auth v1.0+

Context:
The app currently has a working Neon DB connection and styling. Users are successfully stored in the 'user' table, but 'emailVerified' is FALSE. We are facing a 500 error during the sign-in session creation because the email is unverified and the database handshake for sessions is failing.

Target outcome:
A secure, cinematic email verification flow where users must verify their email via Gmail before being allowed to log in.

Success criteria:
- Integrate Resend as the email service provider.
- Implement the 'sendVerificationEmail' hook in lib/auth.ts using a branded, cinematic HTML template.
- Disable 'requireEmailVerification: false' and set it to 'true' once the flow is verified.
- Ensure the verification link successfully updates 'emailVerified' to TRUE in the Neon 'user' table.
- Redirect users to the Sign In page after successful verification with a success notification.
- Maintain a 'Stateless Bridge' where FastAPI can check the verification status.

Constraints:
- Do not modify or disturb any existing UI logic, Framer Motion animations, or glassmorphic styling.
- Use the 'pg' Pool adapter in lib/auth.ts to ensure database stability.
- All environment variables (RESEND_API_KEY) must be used from .env.
- Ensure compatibility with Next.js 16 (Turbopack).

Not building:
- A custom SMTP server (using Resend API instead).
- Password reset flow (separate specification).
- Social login providers (GitHub/Google).
- Multi-factor authentication (MFA)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - New User Registration with Email Verification (Priority: P1)

When a new user registers for the application, they must verify their email address before being allowed to sign in. The system sends an email with a verification link, and upon clicking it, the user's email status is updated in the database.

**Why this priority**: This is the core functionality that prevents unverified users from accessing the system and addresses the current 500 error during sign-in.

**Independent Test**: Can be fully tested by registering a new user, receiving a verification email, clicking the link, and then successfully signing in. This delivers the primary value of secure user authentication.

**Acceptance Scenarios**:

1. **Given** a user has registered with a valid email address, **When** the registration is completed, **Then** the system sends a verification email with a unique verification link and the user's emailVerified status is FALSE in the database.

2. **Given** a user has received a verification email, **When** the user clicks the verification link, **Then** the user's emailVerified status is updated to TRUE in the database and the user is redirected to the Sign In page with a success notification.

3. **Given** a user has verified their email, **When** the user attempts to sign in, **Then** the sign-in process completes successfully without errors.

---

### User Story 2 - Email Verification Status Check (Priority: P2)

The system must allow backend services to check the email verification status of users to maintain the 'Stateless Bridge' functionality for FastAPI integration.

**Why this priority**: This ensures that backend services can properly authenticate users based on their verification status, maintaining security and proper user isolation.

**Independent Test**: Can be tested by querying the user verification status through the authentication system and confirming that the status reflects the actual database value.

**Acceptance Scenarios**:

1. **Given** a user with an unverified email, **When** a backend service checks the user's verification status, **Then** the system returns FALSE indicating the email is not verified.

2. **Given** a user with a verified email, **When** a backend service checks the user's verification status, **Then** the system returns TRUE indicating the email is verified.

---

### User Story 3 - Branded Email Template (Priority: P3)

The verification emails must use a branded, cinematic HTML template that matches the application's aesthetic design.

**Why this priority**: This maintains consistency with the application's premium aesthetic and provides a professional user experience.

**Independent Test**: Can be tested by examining the verification email sent to users and confirming it matches the cinematic design standards.

**Acceptance Scenarios**:

1. **Given** a user has registered for an account, **When** the verification email is sent, **Then** the email contains properly formatted HTML with the application's branded styling and cinematic aesthetic.

---

### Edge Cases

- What happens when a user clicks an expired verification link? The system should display an appropriate error message.
- What happens when a user clicks a verification link that has already been used? The system should indicate the email is already verified.
- How does the system handle invalid verification tokens? The system should reject invalid tokens with an appropriate error message.
- What happens when the email service is unavailable during registration? The system should handle the error gracefully and inform the user.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST integrate with Resend as the email service provider to send verification emails
- **FR-002**: System MUST implement the 'sendVerificationEmail' hook in the authentication library to trigger email sending
- **FR-003**: System MUST generate unique, secure verification tokens for each email verification request
- **FR-004**: System MUST update the user's 'emailVerified' status to TRUE when the verification link is clicked successfully
- **FR-005**: System MUST redirect users to the Sign In page after successful email verification with an appropriate success notification
- **FR-006**: System MUST use a branded, cinematic HTML template for verification emails that matches the application's aesthetic
- **FR-007**: System MUST require email verification before allowing users to sign in successfully
- **FR-008**: System MUST provide backend services with the ability to check user email verification status
- **FR-009**: System MUST use the PostgreSQL Pool adapter to ensure database stability during verification operations
- **FR-010**: System MUST read Resend API key from environment variables (.env file)

### Key Entities *(include if feature involves data)*

- **User**: Represents the registered user with attributes including email, emailVerified status, and verification token
- **Verification Token**: A unique, time-limited token associated with email verification requests
- **Email Template**: The branded HTML template used for sending verification emails with cinematic styling

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Email verification flow completed - users can register, receive verification emails, click links, and have their emailVerified status updated to TRUE in the database.
- **SC-002**: Sign-in error resolved - users with verified emails can successfully sign in without 500 errors during session creation.
- **SC-003**: Resend integration verified - verification emails are successfully sent through the Resend API using environment variables.
- **SC-004**: Branded template implemented - verification emails use the cinematic HTML template matching application aesthetics.
- **SC-005**: Backend verification check available - FastAPI services can check user email verification status through the authentication system.
- **SC-006**: Database integrity maintained - emailVerified status is properly updated in the Neon database without affecting other user data.
- **SC-007**: User experience preserved - existing UI logic, animations, and styling remain unchanged during implementation.
