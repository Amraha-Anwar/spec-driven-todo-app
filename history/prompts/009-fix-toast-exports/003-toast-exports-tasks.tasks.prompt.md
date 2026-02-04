---
id: 003
title: Toast Exports Task Breakdown
stage: tasks
date: 2026-02-04
surface: agent
model: claude-opus-4-5-20251101
feature: 009-fix-toast-exports
branch: 009-fix-toast-exports
user: Amraha-Anwar
command: /sp.tasks
labels: ["toast", "type-error", "vercel", "build-fix", "tasks"]
links:
  spec: specs/009-fix-toast-exports/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/009-fix-toast-exports/tasks.md
tests:
  - N/A (task generation phase - no code changes yet)
---

## Prompt

/sp.tasks
Your deployment fix breaks into 1 phase with 2 atomic tasks:

Phase 1: Build & Type Correction

Task 1.1: Verify and Fix Toast Exports

What to do: Open frontend/components/ui/toast.tsx. Ensure showErrorToast and showSuccessToast are properly exported. If the file uses a different naming convention, update it to match the imports or vice versa.

Acceptance: "File toast.tsx contains explicit export const showErrorToast ... and export const showSuccessToast ... statements."

Output: Corrected frontend/components/ui/toast.tsx.

Task 1.2: Update Component Imports

What to do: Update LoginForm.tsx and any other component throwing a type error to use the correct exported members from the toast utility.

Acceptance: "npm run build completes successfully on the local machine; no 404 or 401 errors introduced in the process."

Output: Updated frontend/components/auth/login-form.tsx.

## Response snapshot

Generated `specs/009-fix-toast-exports/tasks.md` with 2 atomic tasks in 1 phase. T001: Add `showErrorToast` and `showSuccessToast` exports to `toast.tsx` (~8 lines added, 1 line modified). T002: Verify build with `npx tsc --noEmit` and `npm run build`, plus grep audit of all toast imports. Per plan.md Option A, only 1 file is modified — consumer imports already point to the correct path. Total change budget: <20 lines.

## Outcome

- Impact: Task list ready for /sp.implement execution
- Tests: N/A (task generation phase)
- Files: tasks.md created
- Next prompts: /sp.implement to execute T001 and T002
- Reflection: User's 2-task breakdown aligned with the plan; Task 1.2 refined to verification-only since Option A requires no consumer file changes

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Task format validation PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Execute /sp.implement
