---
id: 3-todo-completion-tasks
title: "Todo Completion Feature Tasks"
stage: tasks
date_iso: 2026-01-20
surface: agent
model: claude-haiku-4-5-20251001
feature: todo-completion
branch: 001-todo-completion
user: claude
command: /sp.tasks
labels: ["tasks", "todo-app", "crud", "email-verification", "security"]
links:
  spec: ../specs/001-todo-completion/spec.md
  plan: ../specs/001-todo-completion/plan.md
  ticket: null
  adr: null
  pr: null
files_yaml:
  - specs/001-todo-completion/tasks.md
tests_yaml:
  - tasks-validation
prompt_text: "Todo Full-Stack project (Phase II) breaks into 3 phases with 6 atomic tasks. Here's the breakdown:\n\nPhase 1: Verification & Type Safety (2 tasks) \nThese tasks fix the 404 errors and ensure UUID consistency across all layers without breaking existing login logic.\nTask 1.1: Implement Verification Status Endpoint \nDepends on: Nothing\n\nWhat to do: Add a GET endpoint /api/verification-status in the backend that reads the email_verified field from the current authenticated user's record.\n\nAcceptance: \"Endpoint returns {\\\"isVerified\\\": true/false}; 404 error on frontend disappears; matches existing User model structure\".\nOutput: Updated src/api/auth/routes.py (or relevant auth file).\n\nTask 1.2: Audit Type Safety (UUID vs INT) \nDepends on: Task 1.1\n\nWhat to do: Review src/schemas/task.py and src/api/tasks.py to ensure task_id is globally treated as UUID.\n\nAcceptance: \"No ResponseValidationError when fetching or creating tasks; all Pydantic schemas use UUID for ID fields\".\nOutput: Verified and updated src/schemas/task.py and src/api/tasks.py.\n\nPhase 2: Full CRUD & User Isolation (3 tasks) \nThese tasks complete the project's core functionality ensuring users only see their own data.\nTask 2.1: Implement Task Toggle (Mark Complete) \nDepends on: Task 1.2\n\nWhat to do: Implement PATCH logic in src/api/tasks.py to toggle is_completed status.\n\nAcceptance: \"User can toggle task status; database updates is_completed column; UI reflects 'Completed' instead of 'in progress'\".\nOutput: Updated PATCH endpoint in src/api/tasks.py.\n\nTask 2.2: Implement Secure Task Deletion\nDepends on: Task 2.1\n\nWhat to do: Implement DELETE logic ensuring the task_id belongs to the requesting user_id.\n\nAcceptance: \"Task removed from Neon DB; user cannot delete another user's task; returns 204 No Content\".\nOutput: Updated DELETE endpoint in src/api/tasks.py.\n\nTask 2.3: Secure Task List Filtering\nDepends on: Task 2.2\n\nWhat to do: Update GET /api/{user_id}/tasks to strictly filter by the authenticated session's user ID.\n\nAcceptance: \"User A cannot see User B's tasks even if they guess the ID; list remains persistent on refresh\".\nOutput: Refined GET logic in src/api/tasks.py.\n\nPhase 3: Final Integration & Cleanup (1 task)\n Final validation to ensure everything works together seamlessly.\nTask 3.1: End-to-End Flow Validation \nDepends on: Task 2.3\n\nWhat to do: Test full flow: Signup → Verify (mock/real) → Add Task → Update → Delete.\n\nAcceptance: \"All features work without console errors; existing Auth/Neon logic remains intact; Project History Records (PHRs) are updated\".\nOutput: Finalized project ready for Phase II submission."
response_text: "Created comprehensive task breakdown for Full-Stack Todo Phase II with 3 phases and 6 atomic tasks. Each task has clear dependencies, acceptance criteria, and defined outputs. The tasks are structured to build upon each other while maintaining existing functionality."
outcome: "Successfully created detailed task breakdown with proper dependencies and acceptance criteria. Tasks are organized into logical phases that build upon each other."
evaluation: "The task breakdown addresses all requirements from the prompt with clear dependencies, acceptance criteria, and outputs. The phased approach allows for incremental development and testing."
---

Todo Full-Stack project (Phase II) breaks into 3 phases with 6 atomic tasks. Here's the breakdown:

Phase 1: Verification & Type Safety (2 tasks)
These tasks fix the 404 errors and ensure UUID consistency across all layers without breaking existing login logic.
Task 1.1: Implement Verification Status Endpoint
Depends on: Nothing

What to do: Add a GET endpoint /api/verification-status in the backend that reads the email_verified field from the current authenticated user's record.

Acceptance: "Endpoint returns {\"isVerified\": true/false}; 404 error on frontend disappears; matches existing User model structure".
Output: Updated src/api/auth/routes.py (or relevant auth file).

Task 1.2: Audit Type Safety (UUID vs INT)
Depends on: Task 1.1

What to do: Review src/schemas/task.py and src/api/tasks.py to ensure task_id is globally treated as UUID.

Acceptance: "No ResponseValidationError when fetching or creating tasks; all Pydantic schemas use UUID for ID fields".
Output: Verified and updated src/schemas/task.py and src/api/tasks.py.

Phase 2: Full CRUD & User Isolation (3 tasks)
These tasks complete the project's core functionality ensuring users only see their own data.
Task 2.1: Implement Task Toggle (Mark Complete)
Depends on: Task 1.2

What to do: Implement PATCH logic in src/api/tasks.py to toggle is_completed status.

Acceptance: "User can toggle task status; database updates is_completed column; UI reflects 'Completed' instead of 'in progress'".
Output: Updated PATCH endpoint in src/api/tasks.py.

Task 2.2: Implement Secure Task Deletion
Depends on: Task 2.1

What to do: Implement DELETE logic ensuring the task_id belongs to the requesting user_id.

Acceptance: "Task removed from Neon DB; user cannot delete another user's task; returns 204 No Content".
Output: Updated DELETE endpoint in src/api/tasks.py.

Task 2.3: Secure Task List Filtering
Depends on: Task 2.2

What to do: Update GET /api/{user_id}/tasks to strictly filter by the authenticated session's user ID.

Acceptance: "User A cannot see User B's tasks even if they guess the ID; list remains persistent on refresh".
Output: Refined GET logic in src/api/tasks.py.

Phase 3: Final Integration & Cleanup (1 task)
Final validation to ensure everything works together seamlessly.
Task 3.1: End-to-End Flow Validation
Depends on: Task 2.3

What to do: Test full flow: Signup → Verify (mock/real) → Add Task → Update → Delete.

Acceptance: "All features work without console errors; existing Auth/Neon logic remains intact; Project History Records (PHRs) are updated".
Output: Finalized project ready for Phase II submission.