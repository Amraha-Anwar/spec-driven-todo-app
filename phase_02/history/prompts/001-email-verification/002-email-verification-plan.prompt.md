---
id: 002
title: Email Verification Plan
stage: plan
date: 2026-01-08
surface: agent
model: claude-haiku-4-5-20251001
feature: email-verification
branch: 001-email-verification
user: claude
command: /sp.plan "Implement Cinematic Email Verification & Session Stability"
labels: ["auth", "email", "verification", "resend", "better-auth"]
links:
  spec: /mnt/d/phase-2/specs/001-email-verification/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-email-verification/plan.md
  - specs/001-email-verification/research.md
  - specs/001-email-verification/data-model.md
  - specs/001-email-verification/quickstart.md
  - specs/001-email-verification/contracts/api-contracts.md
tests:
  - constitution check validation passed
  - research consolidation completed
  - data model defined
  - api contracts documented
---

## Prompt

Implement Cinematic Email Verification & Session Stability

Create:
- Architecture sketch: Map the flow between Better Auth, Resend API, and Neon PostgreSQL.
- Section structure: Update 'lib/auth.ts' for Resend integration, define the branded HTML email template, and configure Next.js API route redirects.
- Research approach: Identify Better Auth v1.0+ specific hooks for 'sendVerificationEmail' and 'callbackURL' handling.
- Quality validation: Ensure 'emailVerified' toggles correctly in Neon and sessions are created only after verification.

Decisions needing documentation:
- Choice of email provider: Resend vs. manual SMTP (Choosing Resend for simplicity and free tier).
- Session blocking: Whether to use 'requireEmailVerification: true' immediately or after flow testing.
- Data consistency: Managing 'name' field defaults to prevent 'NOT NULL' database errors during signup.

Testing strategy:
- Validation check: Successful signup triggers a Resend API call visible in the Resend dashboard.
- Validation check: Clicking the Gmail link redirects to '/auth/signin?verified=true'.
- Validation check: Sign-in no longer returns a 500 error once the user is verified.

Technical details:
- Use research-concurrent approach: Identify exact Better Auth v1.0 'user' table field mappings while implementing.
- Follow APA-style documentation for PHR records.
- Organize by phases:
  1. Foundation: Fix session 500 errors via 'pg' pool stabilization.
  2. Integration: Add Resend API key and 'sendVerificationEmail' logic.
  3. Redirection: Configure callback URLs and Sign-in page success states.

## Response snapshot

Completed comprehensive implementation plan for email verification with Resend integration. Created all required planning artifacts:

- Updated implementation plan (plan.md) with technical context and constitution check
- Researched and documented technical decisions (research.md)
- Defined data model for email verification entities (data-model.md)
- Created quickstart guide for implementation (quickstart.md)
- Documented API contracts for the verification flow (contracts/api-contracts.md)
- Updated agent context with new technologies

The plan addresses all requirements including Better Auth integration, Resend API configuration, branded HTML email templates, and verification status management while maintaining session stability.

## Outcome

- ✅ Impact: Created complete implementation plan with all required artifacts for email verification feature
- 🧪 Tests: All planning artifacts validated and constitution check passed
- 📁 Files: Created plan.md, research.md, data-model.md, quickstart.md, and API contracts
- 🔁 Next prompts: Ready for task generation with /sp.tasks
- 🧠 Reflection: Plan comprehensively covers all technical aspects of the email verification feature

## Evaluation notes (flywheel)

- Failure modes observed: None - planning completed successfully
- Graders run and results (PASS/FAIL): PASS - all constitution checks validated
- Prompt variant (if applicable): Standard plan generation
- Next experiment (smallest change to try): Proceed to task generation phase