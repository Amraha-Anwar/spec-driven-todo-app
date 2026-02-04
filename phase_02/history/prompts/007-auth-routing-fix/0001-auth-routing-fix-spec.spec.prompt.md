---
id: 0001
title: auth-routing-fix-spec
stage: spec
date: 2026-01-29
surface: agent
model: claude-sonnet-4-5-20250929
feature: 007-auth-routing-fix
branch: 007-auth-routing-fix
user: pc
command: sp.specify
labels: ["authentication", "routing", "middleware", "url", "jwt", "verification"]
links:
  spec: "D:/phase-2/specs/007-auth-routing-fix/spec.md"
  ticket: null
  adr: null
  pr: null
files:
 - D:/phase-2/specs/007-auth-routing-fix/spec.md
 - D:/phase-2/specs/007-auth-routing-fix/checklists/requirements.md
 - D:/phase-2/history/prompts/007-auth-routing-fix/0001-auth-routing-fix-spec.spec.prompt.md
tests:
 - No tests created yet
---

## Prompt

Fix Authentication Middleware and URL Routing

Goal: Resolve remaining 401 Unauthorized and 404 Not Found errors in Phase II.

Focus:
- [cite_start]URL Consistency: All Task endpoints MUST start with /api/ prefix as per Phase II spec.
- [cite_start]JWT Verification: Fix get_current_user to properly decode Better Auth JWT tokens using the shared secret[cite: 158, 165].
- [cite_start]Frontend Headers: Ensure all fetch calls include 'Authorization: Bearer <token>'[cite: 157, 162].
MUST CREATE ALL THE PHRs
Success Criteria:
- [cite_start]Tasks are successfully fetched and posted with 200/201 status.
- [cite_start]No 401 Unauthorized errors in logs for authenticated users.

## Response snapshot

Created a comprehensive specification for fixing authentication middleware and URL routing issues. The specification includes:

- User Story 1: Successful Task Operations (P1 priority) - ensuring users can perform CRUD operations without 401/404 errors
- User Story 2: Consistent API Routing (P1 priority) - standardizing URL patterns with /api/ prefix
- User Story 3: Secure JWT Token Processing (P2 priority) - proper decoding of Better Auth JWT tokens

Key functional requirements include:
- Ensuring task endpoints follow /api/{user_id}/tasks pattern
- Properly decoding Better Auth JWT tokens with shared secret
- Including Authorization headers in all frontend requests
- Returning 200/201 status codes for successful operations

Success criteria address the core issues: successful task operations with proper status codes and elimination of 401 errors for authenticated users.

## Outcome

- ✅ Impact: Created complete specification addressing authentication and routing issues
- 🧪 Tests: No tests created yet
- 📁 Files: Created spec.md and requirements checklist
- 🔁 Next prompts: Ready for /sp.plan to create implementation plan
- 🧠 Reflection: Specification addresses all focus areas with clear acceptance criteria

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Not applicable
- Prompt variant (if applicable): Not applicable
- Next experiment (smallest change to try): Begin implementation planning
