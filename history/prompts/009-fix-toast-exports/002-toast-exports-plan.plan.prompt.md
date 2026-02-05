---
id: 002
title: Toast Exports Implementation Plan
stage: plan
date: 2026-02-04
surface: agent
model: claude-opus-4-5-20251101
feature: 009-fix-toast-exports
branch: 009-fix-toast-exports
user: Amraha-Anwar
command: /sp.plan
labels: ["toast", "type-error", "vercel", "build-fix", "plan", "implementation"]
links:
  spec: specs/009-fix-toast-exports/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/009-fix-toast-exports/plan.md
  - specs/009-fix-toast-exports/research.md
  - specs/009-fix-toast-exports/quickstart.md
tests:
  - N/A (planning phase - no code changes yet)
---

## Prompt

Decisions:

Inspect frontend/components/ui/toast.tsx to identify the actual exported function names (e.g., they might be named toast.error or notifyError instead).

Update the import statements in LoginForm.tsx and any other affected components to match the verified exports.

If the functions are missing entirely, implement minimal export wrappers around the existing toast library (like sonner or react-hot-toast) to satisfy the dependency without changing the UI behavior.

Technical Details:

Perform a workspace-wide grep for showErrorToast to ensure all instances are fixed.

Run npx tsc --noEmit to verify type safety before committing.

## Response snapshot

Created implementation plan at `specs/009-fix-toast-exports/plan.md`. Root cause: `components/ui/toast.tsx` exports only `Toaster` but `login-form.tsx` and `signup-form.tsx` import `showErrorToast`/`showSuccessToast` from it. Selected Option A: add two thin wrapper functions to `toast.tsx` that delegate to `sonner`'s `toast.error()` and `toast.success()`. This is the smallest diff (1 file, ~8 lines added). All 7 constitution checks pass. Generated research.md (3 research tasks), quickstart.md (before/after code), and updated agent context.

## Outcome

- Impact: Plan complete; ready for /sp.tasks to generate implementation tasks
- Tests: N/A (planning phase)
- Files: plan.md, research.md, quickstart.md created
- Next prompts: /sp.tasks to generate task list, then /sp.implement to execute
- Reflection: Narrow scope fix with clear Option A vs Option B tradeoff analysis

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution check PASS (7/7 principles)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Execute /sp.tasks then implement the single-file change
