---
id: 0006
title: Plan Bugfix UI Enhancement Sprint
stage: plan
date: 2026-02-05
surface: agent
model: claude-opus-4-5-20251101
feature: 009-bugfix-ui-enhancement
branch: 010-add-cors-deployment-config
user: developer
command: /sp.plan
labels: ["plan", "bugfix", "ui", "tasks", "settings", "glassmorphic"]
links:
  spec: specs/009-bugfix-ui-enhancement/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/009-bugfix-ui-enhancement/plan.md
tests:
  - none (planning phase)
---

## Prompt

/sp.plan

Objective: Execute the bug fixes and UI enhancements defined in specs/009-bugfix-ui-enhancement/spec.md.

Strategy for Claude:

P1 Fixes (Immediate Priority): > * Convert current_user.id to current_user["id"] in tasks.py to resolve the 500 Internal Server Error.

Fix the build-breaking imports in login-form.tsx and signup-form.tsx by ensuring they use valid exports from toast.tsx.

Surface backend error detail fields to the frontend toasts.

P2 Settings Logic: > * Replace the simulated setTimeout in the Settings page with a real authClient.updateUser() call and implement an optimistic UI update.

P3 UI/UX Overhaul: > * Rebuild the Landing page, Features, About, and Pricing sections using the Glassmorphic design language.

Use the dark burgundy/purple-600 palette from reference.png.

Rewrite all marketing copy to be professional and focused on "Plannoir" as an AI-native productivity tool.

Verification: After each fix, ensure the Next.js build command succeeds and the FastAPI backend remains stable.

## Response snapshot

Created implementation plan with 3 phases, 9 files to modify, ordered by priority with verification gates:

**Phase 1 (P1)** — 6 steps:
- 1.1: Fix `current_user.id` → `current_user["id"]` in tasks.py (5 occurrences, confirmed root cause)
- 1.2-1.3: Fix toast imports in login-form.tsx and signup-form.tsx (`showErrorToast` → `toast.error()`)
- 1.4: Fix user-menu.tsx `@/` imports to relative paths (tsconfig has no paths alias; decided to use relative imports for consistency)
- 1.5: Add network error detection in auth page catch blocks
- 1.6: Verification gate — `npx next build` must pass

**Phase 2 (P2)** — 2 steps:
- 2.1: Replace `setTimeout` with `authClient.updateUser({ name })` + session refresh in settings
- 2.3: Verification gate — name persists across refresh

**Phase 3 (P3)** — 3 steps:
- 3.2: Landing page overhaul (hero, trust section, about, pricing, professional copy)
- 3.3: Features page professional copy update
- 3.5: Visual + build verification

Key decision: Use relative imports in user-menu.tsx instead of adding `@/` path alias to keep import style consistent with the rest of the codebase.

## Outcome

- Impact: Complete implementation plan covering all 14 functional requirements from the spec
- Tests: Verification gates defined after each phase
- Files: 1 file created (plan.md)
- Next prompts: `/sp.tasks` to generate tasks.md, then `/sp.implement` to execute
- Reflection: Reading every file involved was critical — initial hypothesis about user-menu.tsx was partially wrong (auth-actions.ts exists, the issue is the missing tsconfig path alias)

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Plan template compliance PASS
- Prompt variant (if applicable): sp.plan with explicit strategy input
- Next experiment (smallest change to try): Start implementation with Phase 1.1 (single file, highest impact)
