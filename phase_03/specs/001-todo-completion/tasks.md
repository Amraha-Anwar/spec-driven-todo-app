# Implementation Tasks: Full-Stack Todo Phase II: Completion & Optimization

**Feature**: Full-Stack Todo Phase II: Completion & Optimization
**Branch**: 001-todo-completion
**Created**: 2026-01-20
**Status**: Draft

## Overview

This document outlines the implementation tasks broken into 3 phases with 6 atomic tasks to complete the Full-Stack Todo Phase II project. Each task is designed to be completed independently while building upon the previous tasks.

## Phase 1: Verification & Type Safety (2 tasks)

These tasks fix the 404 errors and ensure UUID consistency across all layers without breaking existing login logic.

### Task 1.1: Implement Verification Status Endpoint
- **Depends on**: Nothing
- **What to do**: Add a GET endpoint /api/verification-status in the backend that reads the email_verified field from the current authenticated user's record.
- **Acceptance**: "Endpoint returns {"verified": true/false}; 404 error on frontend disappears; matches existing User model structure"
- **Output**: Updated src/api/verification.py with verification-status endpoint
- **Time Estimate**: 1 hour
- **Status**: [X] COMPLETED

### Task 1.2: Audit Type Safety (UUID vs INT)
- **Depends on**: Task 1.1
- **What to do**: Review src/models/task.py, src/schemas/task.py, and src/api/tasks.py to ensure task_id is consistently typed as UUID in models, schemas, and API route parameters. Verify all Pydantic models use UUID type for ID fields.
- **Acceptance**: "No ResponseValidationError when fetching or creating tasks; all Pydantic schemas use UUID for ID fields"
- **Output**: Verified and updated src/schemas/task.py and src/api/tasks.py
- **Time Estimate**: 1 hour
- **Status**: [X] COMPLETED

### Task 1.3: Implement Individual Task View
- **Depends on**: Task 1.2
- **What to do**: Implement GET /api/{user_id}/tasks/{task_id} endpoint in src/api/tasks.py that returns a single task by ID with proper user ownership validation.
- **Acceptance**: "User can view individual task details; endpoint validates user owns the task; returns 404 if task doesn't exist or isn't owned by user"
- **Output**: Updated GET endpoint in src/api/tasks.py
- **Time Estimate**: 1 hour
- **Status**: [X] COMPLETED

## Phase 2: Full CRUD & User Isolation (4 tasks)

These tasks complete the project's core functionality ensuring users only see their own data.

### Task 2.1: Implement Task Toggle (Mark Complete)
- **Depends on**: Task 1.3
- **What to do**: Implement PATCH logic in src/api/tasks.py that specifically updates the is_completed field in the task record based on the request payload.
- **Acceptance**: "User can toggle task status; database updates is_completed column; UI reflects 'Completed' instead of 'in progress'"
- **Output**: Updated PATCH endpoint in src/api/tasks.py
- **Time Estimate**: 1 hour
- **Status**: [X] COMPLETED

### Task 2.2: Implement Secure Task Deletion
- **Depends on**: Task 2.1
- **What to do**: Implement DELETE logic ensuring the task_id belongs to the requesting user_id.
- **Acceptance**: "Task removed from Neon DB; user cannot delete another user's task; returns 204 No Content"
- **Output**: Updated DELETE endpoint in src/api/tasks.py
- **Time Estimate**: 1 hour
- **Status**: [X] COMPLETED

### Task 2.3: Secure Task List Filtering
- **Depends on**: Task 2.2
- **What to do**: Update GET /api/{user_id}/tasks to strictly filter by the authenticated session's user ID.
- **Acceptance**: "User A cannot see User B's tasks even if they guess the ID; list remains persistent on refresh"
- **Output**: Refined GET logic in src/api/tasks.py
- **Time Estimate**: 1 hour
- **Status**: [X] COMPLETED

## Phase 3: Final Integration & Cleanup (1 task)

Final validation to ensure everything works together seamlessly.

### Task 3.1: End-to-End Flow Validation
- **Depends on**: Task 2.3
- **What to do**: Test full flow: Signup → Verify (mock/real) → Add Task → Update → Delete.
- **Acceptance**: "All features work without console errors; existing Auth/Neon logic remains intact; Project History Records (PHRs) are updated"
- **Output**: Finalized project ready for Phase II submission
- **Time Estimate**: 2 hours
- **Status**: [X] COMPLETED

## Dependencies Overview

```
Task 1.1 ──┐
           ├── Task 1.2 ──┐
                        ├── Task 1.3 ──┐
                                     ├── Task 2.1 ──┐
                                                  ├── Task 2.2 ──┐
                                                               ├── Task 2.3 ──┐
                                                                            ├── Task 3.1
```

## Success Metrics

- All endpoints return appropriate responses
- No existing functionality is broken
- User data isolation is maintained
- Type safety is consistent across all layers
- Frontend errors are resolved
- All acceptance criteria are met