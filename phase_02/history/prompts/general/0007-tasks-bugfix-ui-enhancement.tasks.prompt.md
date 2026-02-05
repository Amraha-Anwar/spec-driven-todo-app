---
id: 0007
title: Generate Tasks Bugfix UI Enhancement
stage: tasks
date: 2026-02-05
surface: agent
model: claude-opus-4-5-20251101
feature: 009-bugfix-ui-enhancement
branch: 010-add-cors-deployment-config
user: developer
command: /sp.tasks
labels: ["tasks", "bugfix", "ui", "task-breakdown", "implementation"]
links:
  spec: specs/009-bugfix-ui-enhancement/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/009-bugfix-ui-enhancement/tasks.md
tests:
  - none (task generation phase)
---

## Prompt

/sp.tasks

Goal: Break down the approved plan into atomic, executable tasks to resolve the 500 errors, fix the build-breaking imports, and enhance the Plannoir UI.

Task Architecture:

Critical Path (Backend Fix): Focus on the AttributeError in tasks.py by converting object access to dictionary access for the current_user.

Build Path (Frontend Fix): Resolve import aliases and missing toast exports to ensure npm run build succeeds.

Persistence Path: Implement the real updateUser logic for the settings page.

Aesthetic Path: Apply the glassmorphic overhaul and Plannoir-specific copywriting across all public-facing pages.

Success Criteria for each task:

Code must be lint-free.

No breaking changes to the authentication handshake.

Visual consistency with the burgundy/glassmorphic theme.

## Response snapshot

Generated 12 tasks (10 implementation + 2 verification gates) organized into 7 phases by user story:

- **Phase 1 (US1)**: T001 — Fix `current_user.id` → `current_user["id"]` in tasks.py (5 occurrences)
- **Phase 2 (US4)**: T002-T004 — Fix toast imports in login-form/signup-form and `@/` aliases in user-menu (parallel). T005 — Build gate.
- **Phase 3 (US2)**: T006-T007 — Network error detection in signin/signup pages (parallel)
- **Phase 4 (US3)**: T008 — Replace setTimeout with authClient.updateUser() in settings
- **Phase 5 (US5)**: T009 — Landing page full rewrite with 7 sections (hero, trust, features, about, pricing, CTA, footer)
- **Phase 6 (US6)**: T010 — Features page copy rewrite + nav
- **Phase 7**: T011-T012 — Final build gate + manual verification checklist

Each task includes exact line numbers, before/after code, and acceptance criteria. Dependency graph ensures build passes before adding features.

## Outcome

- Impact: Complete executable task breakdown — each task is atomic, has exact file + line references, and can be independently verified
- Tests: Verification gates at T005 (build), T011 (final build), T012 (manual checklist)
- Files: 1 file created (tasks.md)
- Next prompts: `/sp.implement` to execute tasks in order
- Reflection: Including exact line numbers and before/after code makes tasks truly atomic — the implementor doesn't need to re-read files

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Tasks template compliance PASS
- Prompt variant (if applicable): sp.tasks with explicit task architecture input
- Next experiment (smallest change to try): Execute T001 first (single file, biggest impact, unblocks dashboard)
