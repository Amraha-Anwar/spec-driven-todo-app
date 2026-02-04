---
id: 003
title: Email Verification Tasks
stage: tasks
date: 2026-01-08
surface: agent
model: claude-haiku-4-5-20251001
feature: email-verification
branch: 001-email-verification
user: claude
command: /sp.tasks "Implement Email Verification & Session Stability"
labels: ["auth", "email", "verification", "resend", "better-auth", "tasks"]
links:
  spec: /mnt/d/phase-2/specs/001-email-verification/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-email-verification/tasks.md
tests:
  - task completeness validation
  - dependency mapping verification
  - user story organization check
---

## Prompt

Implement Email Verification & Session Stability

Phase 1: Foundation & Stability (3 tasks)

These tasks resolve the current 500 errors and stabilize the Neon DB connection.

Task 1.1: Database Connection Handshake Verification

Depends on: Nothing

What to do: Verify the 'pg' Pool configuration in lib/auth.ts; ensure DATABASE_URL includes 'sslmode=require' for Neon stability.

Acceptance: "Sign-up attempts no longer timeout; database logs show successful pool connection"

Output: Updated lib/auth.ts with optimized Postgres adapter settings.

Task 1.2: Session Schema Validation

Depends on: Task 1.1

What to do: Cross-reference Better Auth v1.0 internal schema with the manual 'session' table in Neon.

Acceptance: "All session columns (userId, expiresAt, etc.) match library expectations exactly"

Output: SQL migration script or manual fix for any column naming mismatches.

Task 1.3: Verification Logic Research

Depends on: Nothing

What to do: Identify the specific Better Auth v1.0 payload format for 'sendVerificationEmail'.

Acceptance: "Documentation of the 'url' and 'user' objects provided by the hook recorded"

Output: Research notes file with implementation syntax.

Phase 2: Resend Integration & Branding (3 tasks)

Task 2.1: Resend API Infrastructure

Depends on: Task 1.3

What to do: Configure Resend API Key in .env and implement the 'sendVerificationEmail' hook.

Acceptance: "Console logs show Resend API being triggered on signup"

Output: Integrated Resend logic in lib/auth.ts.

Task 2.2: Cinematic HTML Template Development

Depends on: Task 2.1

What to do: Create a branded HTML template that matches the Plannoir glassmorphic UI for Gmail delivery.

Acceptance: "Email renders correctly in Gmail with the Plannoir pink-red accent color and valid verification link"

Output: Inline HTML template function within the auth configuration.

Task 2.3: Verification Redirection Flow

Depends on: Task 2.2

What to do: Configure 'callbackURL' and redirect logic to send verified users to '/auth/signin?verified=true'.

Acceptance: "Clicking the link in Gmail updates Neon 'emailVerified' to TRUE and redirects to Sign-in"

Output: Updated redirection routes in Next.js config.

## Response snapshot

Generated comprehensive task list for email verification implementation with 50 tasks organized across 6 phases:

- Phase 1: Setup (3 tasks) - Environment preparation
- Phase 2: Foundation & Stability (6 tasks) - Database and auth configuration
- Phase 3: User Story 1 (9 tasks) - Core email verification flow
- Phase 4: User Story 2 (6 tasks) - Backend verification status check
- Phase 5: User Story 3 (6 tasks) - Branded email templates
- Phase 6: Polish & Cross-Cutting (20 tasks) - Edge cases and finalization

Tasks follow the required checklist format with sequential IDs, user story labels, and specific file paths. Each user story is organized with independent test criteria and follows the priority order from the specification (P1, P2, P3).

## Outcome

- ✅ Impact: Created complete task breakdown with 50 specific, executable tasks organized by user story
- 🧪 Tests: All tasks validated for completeness and proper dependency mapping
- 📁 Files: Generated tasks.md with comprehensive implementation roadmap
- 🔁 Next prompts: Ready for implementation phase
- 🧠 Reflection: Tasks organized by user story priority with clear acceptance criteria

## Evaluation notes (flywheel)

- Failure modes observed: None - task generation completed successfully
- Graders run and results (PASS/FAIL): PASS - all tasks follow required format and dependencies mapped
- Prompt variant (if applicable): Standard task generation
- Next experiment (smallest change to try): Begin implementation with Phase 1 tasks