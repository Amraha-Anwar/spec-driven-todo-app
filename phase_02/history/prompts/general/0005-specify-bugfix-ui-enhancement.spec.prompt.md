---
id: 0005
title: Specify Bugfix UI Enhancement Sprint
stage: spec
date: 2026-02-05
surface: agent
model: claude-opus-4-5-20251101
feature: 009-bugfix-ui-enhancement
branch: 010-add-cors-deployment-config
user: developer
command: /sp.specify
labels: ["spec", "bugfix", "ui", "tasks", "settings", "glassmorphic"]
links:
  spec: specs/009-bugfix-ui-enhancement/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/009-bugfix-ui-enhancement/spec.md
  - specs/009-bugfix-ui-enhancement/checklists/requirements.md
tests:
  - none (specification phase)
---

## Prompt

/sp.specify

Current Issues:

500 Internal Server Error: Tasks are not loading/adding. The frontend is calling .../api/[userId]/tasks, which is causing a routing mismatch or database error on the backend.

Settings Page: Name edits and Avatar uploads are not reflecting in real-time or persisting correctly.

Error Handling: Errors are generic; need meaningful messages (e.g., "User already exists", "Invalid credentials").

UI/UX Enhancement Requirements:

Visual Style: Implement a strict Glassmorphic effect and color theme exactly matching /frontend/reference.png.

Pages to Enhance: Landing Page (Home), Features, About, and Pricing.

Copywriting: Update all headings, subheadings, and body text to be professional and suitable for "Plannoir" (a premium AI-native TODO app).

Constraints:

Maintain the exact same UI theme/colors, just make it more "premium" and "enhanced."

Do not break the now-working Auth handshake.

## Response snapshot

Created comprehensive spec `009-bugfix-ui-enhancement` with 6 user stories across 3 priority levels:

- **P1 (Critical)**: Fix 500 on task CRUD (root cause: dict attribute access in tasks.py), fix build-breaking imports (login-form, signup-form, user-menu), and surface specific auth error messages
- **P2 (Important)**: Settings page persistence via Better Auth's `authClient.updateUser()`
- **P3 (Polish)**: Glassmorphic UI enhancement for Landing, Features, About, and Pricing matching reference.png

Key finding: The 500 error is likely caused by `current_user.id` attribute access on a dict (should be `current_user["id"]`), not a routing mismatch. The routes resolve correctly.

## Outcome

- Impact: Spec defines 14 functional requirements, 7 success criteria, and 5 edge cases covering all reported issues
- Tests: Acceptance scenarios defined for each user story (manual verification)
- Files: 2 files created (spec.md, requirements checklist)
- Next prompts: `/sp.plan` to generate implementation plan, then `/sp.tasks` for task breakdown
- Reflection: Root cause analysis of the 500 error required tracing the full request path from frontend hook through axios interceptor to backend route handler and dependency injection

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Spec template compliance PASS
- Prompt variant (if applicable): sp.specify with multi-issue input
- Next experiment (smallest change to try): Validate 500 root cause hypothesis by reading deps.py return type vs tasks.py access pattern
