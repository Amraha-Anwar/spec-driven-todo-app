---
id: 0012
title: Fix Agent Complete Task Sync
stage: green
date: 2026-06-23
surface: agent
model: claude-opus-4-8[1m]
feature: none
branch: main
user: Amraha Anwar
command: general
labels: ["backend", "bugfix", "agent", "tasks", "data-integrity"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - backend/src/tools/task_toolbox.py
 - backend/src/api/tasks.py
tests:
 - backend/tests/unit/test_schema_fixes_verification.py (12 relevant pass; 2 fail on a hardcoded /mnt/d path, env-only)
 - manual in-memory SQLite check of complete_task + update_task field sync (PASS)
---

## Prompt

now the agent is not marking the pending tasks as completed. fix this

## Response snapshot

Root cause: the Task model has TWO completion fields that had drifted apart — `is_completed: bool` and `status: str` (models/task.py:13-14). The REST `TaskResponse` schema and the frontend (`use-tasks.ts`, chat task panel) decide done-vs-pending from `is_completed`, but the agent's `TaskToolbox.complete_task` set only `status = "completed"` and never touched `is_completed`. So the agent WAS completing the task in the DB (status column), but the GET /tasks response still returned `is_completed=False` and the UI kept showing it as pending.

Fixes (keep the two fields in sync everywhere they're written):
1. task_toolbox.py `complete_task`: also set `task.is_completed = True`.
2. task_toolbox.py `update_task`: when `status` is updated, also set `is_completed = (status == "completed")`.
3. api/tasks.py PATCH endpoint (reverse drift): when `is_completed` is updated via the dashboard checkbox, also set `status` accordingly, so a task completed in the UI is seen as completed by the agent's list/complete tools.

Verified with an in-memory SQLite run: add → `is_completed False / status pending`; complete → `True / completed`; update status=pending → `False / pending`. Both fields move together.

## Outcome

- ✅ Impact: AI "mark X as done" now flips `is_completed`, so the task list (chat panel + dashboard) shows it completed immediately. Dashboard completion now also updates `status` for the agent.
- 🧪 Tests: 12/12 relevant schema-fix unit tests pass; the 2 failures are a hardcoded `/mnt/d/...` path in the test file (environment, pre-existing). Manual field-sync check passes.
- 📁 Files: 2 modified.
- 🔁 Next prompts: optional — consider collapsing `status` + `is_completed` into one source of truth (migration) to prevent future drift.
- 🧠 Reflection: Dual booleans/enums for the same concept are a drift hazard; synced all write paths now, but a single field would be the durable fix.

## Evaluation notes (flywheel)

- Failure modes observed: silent data drift — write succeeded on one column, UI read another.
- Graders run and results (PASS/FAIL): PASS (relevant unit tests + manual sync verification).
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): add a regression unit test asserting complete_task sets is_completed=True (avoids relying on manual check).

📋 Architectural decision detected: Task completion is modeled by two redundant fields (`status` + `is_completed`). Collapsing to a single source of truth via migration — Document reasoning and tradeoffs? Run `/sp.adr task-completion-single-source-of-truth`
