---
id: 001
title: Email Verification Spec
stage: spec
date: 2026-01-08
surface: agent
model: claude-haiku-4-5-20251001
feature: email-verification
branch: 001-email-verification
user: claude
command: /sp.specify "Implement Email Verification using Resend and Better Auth v1.0+..."
labels: ["auth", "email", "verification", "resend"]
links:
  spec: /mnt/d/phase-2/specs/001-email-verification/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-email-verification/spec.md
  - specs/001-email-verification/checklists/requirements.md
tests:
  - spec validation completed
  - checklist verification passed
---

## Prompt

Implement Email Verification using Resend and Better Auth v1.0+

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
- Multi-factor authentication (MFA).

## Response snapshot

Created a comprehensive specification for email verification using Resend and Better Auth. The specification includes:

- User scenarios covering the primary email verification flow
- Functional requirements for integrating Resend, implementing verification hooks, updating user status
- Key entities like User, Verification Token, and Email Template
- Success criteria measuring the completion of the email verification flow

The spec addresses all requirements including Resend integration, branded HTML templates, database updates, and backend verification checks while preserving existing UI elements.

## Outcome

- ✅ Impact: Created complete feature specification for email verification system
- 🧪 Tests: Spec validation and checklist verification completed successfully
- 📁 Files: Created spec.md and requirements checklist in specs/001-email-verification/
- 🔁 Next prompts: Ready for planning phase with /sp.plan
- 🧠 Reflection: Specification comprehensively covers all requirements with clear acceptance criteria

## Evaluation notes (flywheel)

- Failure modes observed: None - spec creation completed successfully
- Graders run and results (PASS/FAIL): PASS - all checklist items validated
- Prompt variant (if applicable): Standard spec creation
- Next experiment (smallest change to try): Proceed to planning phase