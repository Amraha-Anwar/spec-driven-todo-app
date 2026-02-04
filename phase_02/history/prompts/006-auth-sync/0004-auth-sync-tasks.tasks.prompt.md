---
id: 0004
title: auth-sync-tasks
stage: tasks
date: 2026-01-29
surface: agent
model: claude-sonnet-4-5-20250929
feature: 006-auth-sync
branch: 006-auth-sync
user: pc
command: sp.tasks
labels: ["authentication", "ui", "sync", "jwt", "verification", "tasks"]
links:
  spec: "D:/phase-2/specs/006-auth-sync/spec.md"
  ticket: null
  adr: "D:/phase-2/history/adr/0001-authentication-ui-sync-approach.md"
  pr: null
files:
 - D:/phase-2/specs/006-auth-sync/tasks.md
 - D:/phase-2/history/prompts/006-auth-sync/0004-auth-sync-tasks.tasks.prompt.md
tests:
 - No tests created yet
---

## Prompt

Generate 4 atomic tasks to finalize Phase II frontend-backend sync.

Task 1.1: Fix Frontend JWT Injection
- Duration: 20 mins
- What to do: Update all fetch calls in the frontend to include the JWT token from Better Auth session.
- Acceptance: "Backend logs show 200 OK instead of 401 for /api/verification-status".

Task 1.2: Sync Verification Status
- Duration: 15 mins
- What to do: Map the response from /api/verification-status to the UI 'Verified/Unverified' badge.
- Acceptance: "User status updates from 'Checking status' to 'Verified' on successful login".

Task 1.3: Enable Update/Delete UI Components
- Duration: 25 mins
- What to do: Add 'Complete' and 'Delete' buttons to the task list component and link them to the fixed backend endpoints.
- Acceptance: "Clicking 'Delete' removes task from Neon DB and UI; 'Complete' toggles status".

Task 1.4: Final Phase II Cleanup
- Duration: 15 mins

## Response snapshot

Created a comprehensive tasks document for Phase II Authentication & UI Sync feature with 4 atomic tasks:

Task 1.1: Fix Frontend JWT Injection - Update all fetch calls in the frontend to include JWT tokens from Better Auth session with clear acceptance criteria and test cases.

Task 1.2: Sync Verification Status - Map verification status API response to UI badge with proper handling of unauthenticated states.

Task 1.3: Enable Update/Delete UI Components - Add Complete and Delete buttons to task list with backend integration.

Task 1.4: Final Phase II Cleanup - Security hardening and final validation to ensure all acceptance criteria are met.

Each task includes duration estimates, file modifications, acceptance criteria, and test cases.

## Outcome

- ✅ Impact: Created detailed implementation roadmap with testable tasks for Phase II
- 🧪 Tests: Defined test cases for each task
- 📁 Files: Created tasks.md document and PHR
- 🔁 Next prompts: Ready for implementation phase
- 🧠 Reflection: Tasks are well-defined with clear dependencies and risk assessments

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Not applicable
- Prompt variant (if applicable): Not applicable
- Next experiment (smallest change to try): Begin implementation of Task 1.1
