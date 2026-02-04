# Implementation Tasks: Phase II Authentication & UI Sync

## Overview
This document breaks down the implementation of the Phase II Authentication & UI Sync feature into testable tasks with clear acceptance criteria.

## Task 1.1: Fix Frontend JWT Injection
- **Duration**: 20 mins
- **Description**: Update all fetch calls in the frontend to include the JWT token from Better Auth session
- **Files to modify**:
  - `frontend/lib/api.ts`
  - `frontend/lib/fetcher.ts`
  - `frontend/components/tasks/add-task-form.tsx`
  - `frontend/components/tasks/task-list.tsx`
- **Acceptance Criteria**:
  - Backend logs show 200 OK instead of 401 for /api/verification-status
  - All API calls include Authorization: Bearer <token> header
  - JWT token is retrieved from Better Auth session using `authClient.getSession()`
- **Test Cases**:
  - [X] API calls include JWT token in headers
  - [X] Token refresh mechanism works when token expires
  - [X] Unauthenticated requests fail appropriately

## Task 1.2: Sync Verification Status
- **Duration**: 15 mins
- **Description**: Map the response from /api/verification-status to the UI 'Verified/Unverified' badge
- **Files to modify**:
  - `backend/src/api/verification.py`
  - `frontend/app/hooks/use-verification.ts`
  - `frontend/app/dashboard/page.tsx` (or wherever verification status is displayed)
- **Acceptance Criteria**:
  - User status updates from 'Checking status' to 'Verified' on successful login
  - Verification endpoint handles unauthenticated requests gracefully
  - UI displays correct verification status based on backend response
- **Test Cases**:
  - [X] Verified user shows 'Verified' status in UI
  - [X] Unverified user shows 'Unverified' status in UI
  - [X] Unauthenticated user shows appropriate default state
  - [X] Verification status updates correctly after verification

## Task 1.3: Enable Update/Delete UI Components
- **Duration**: 25 mins
- **Description**: Add 'Complete' and 'Delete' buttons to the task list component and link them to the fixed backend endpoints
- **Files to modify**:
  - `frontend/components/tasks/task-list.tsx`
  - `backend/src/api/tasks.py`
  - `frontend/app/hooks/use-tasks.ts`
- **Acceptance Criteria**:
  - Clicking 'Delete' removes task from Neon DB and UI
  - Clicking 'Complete' toggles status in DB and UI
  - Task completion/deletion works through the UI
  - Proper error handling for failed operations
- **Test Cases**:
  - [X] Complete button toggles task completion status
  - [X] Delete button removes task from UI and DB
  - [X] Error handling works when operations fail
  - [X] Task list refreshes after operations

## Task 1.4: Final Phase II Cleanup
- **Duration**: 15 mins
- **Description**: Security hardening and final cleanup for Phase II
- **Files to modify**:
  - `backend/src/api/tasks.py`
  - `backend/src/api/verification.py`
  - Create/update documentation
- **Acceptance Criteria**:
  - No 401 errors in backend logs for authenticated requests
  - Users can only access their own tasks (security validation)
  - JWT tokens are properly validated across all protected endpoints
  - Dashboard shows 'Verified' status after backend verification
  - CRUD operations (Update/Delete) are visible and functional in the UI
- **Test Cases**:
  - [X] User isolation enforced - users can only access their own tasks
  - [X] Verification endpoint properly secured
  - [X] All acceptance criteria from previous tasks met
  - [X] PHRs created for all completed work

## Dependencies
- Task 1.1 must be completed before Task 1.2 and Task 1.3
- Task 1.2 and Task 1.3 can be worked on in parallel
- Task 1.4 requires all previous tasks to be completed

## Risk Assessment
- High risk on Task 1.1: Incorrect JWT implementation could break all authenticated API calls
- Medium risk on Task 1.3: Improper user isolation could allow cross-user data access
- Low risk on Task 1.2 and Task 1.4: Primarily UI and cleanup work

## Success Metrics
- All acceptance criteria met
- No regressions in existing functionality
- All tests pass
- Security validation passed
- Performance remains acceptable