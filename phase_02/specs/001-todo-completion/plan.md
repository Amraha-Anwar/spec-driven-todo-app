# Implementation Plan: Full-Stack Todo Phase II: Completion & Optimization

**Feature**: Full-Stack Todo Phase II: Completion & Optimization
**Branch**: 001-todo-completion
**Created**: 2026-01-20
**Status**: Draft

## Overview

This plan outlines the surgical implementation of missing CRUD operations and the verification endpoint fix. The approach preserves all existing functionality while adding the required features.

## Architecture Decision Summary

- **Task Schema Enhancement**: Extend TaskResponse to support full CRUD without changing base classes
- **Verification Endpoint**: Add dedicated `/api/verification-status` route using JWT verification
- **Security Enforcement**: Ensure all PATCH/DELETE operations use JWT-verified user_id to prevent cross-user data access
- **Consistency**: Use Pydantic's model_dump and UTC timestamps for consistency

## Technical Implementation Plan

### Phase 1: Enhance Task API with Missing CRUD Operations

#### 1.1 Update src/api/tasks.py - Add Individual Task View
- **Location**: Add new GET endpoint after existing get_user_tasks
- **Function**: `get_task(user_id: str, task_id: UUID, session: Session = Depends(get_session))`
- **Return**: TaskResponse with complete task details
- **Security**: Verify task belongs to authenticated user via user_id check

#### 1.2 Update src/api/tasks.py - Enhance Update Operation
- **Current**: Already implemented PATCH operation
- **Verify**: PATCH endpoint properly uses user_id to prevent cross-user access
- **Enhancement**: Ensure all fields can be updated while maintaining user isolation

#### 1.3 Update src/api/tasks.py - Enhance Delete Operation
- **Current**: Already implemented DELETE operation
- **Verify**: DELETE endpoint properly uses user_id to prevent cross-user access
- **Enhancement**: Add proper error handling for unauthorized deletions

### Phase 2: Implement Verification Status Endpoint

#### 2.1 Create new verification endpoint
- **Location**: Create new file src/api/verification.py or add to existing auth router
- **Route**: `GET /api/verification-status` (matches frontend expectation)
- **Dependencies**: Use existing JWT verification dependency (`get_current_user` from src/api/deps.py)
- **Logic**: Return `{ "verified": boolean }` from current_user.email_verified field
- **Security**: Protected by JWT authentication - only authenticated users can check their own status
- **Implementation**:
  ```python
  from fastapi import APIRouter, Depends
  from src.api.deps import get_current_user
  from src.models.user import User

  router = APIRouter()

  @router.get("/verification-status")
  def get_verification_status(current_user: User = Depends(get_current_user)):
      """Get current user's email verification status"""
      return {"verified": current_user.email_verified}
  ```
- **Integration**: Include router in main.py with prefix `/api`

### Phase 3: Schema Updates for Full CRUD Support

#### 3.1 Update TaskResponse Schema
- **Location**: src/schemas/task.py
- **Action**: Ensure TaskResponse supports all CRUD operations
- **Verify**: Schema includes all necessary fields for complete task representation
- **Maintain**: Backward compatibility with existing functionality

### Phase 4: Security Hardening

#### 4.1 Validate JWT Protection
- **Verify**: All PATCH/DELETE operations use JWT-verified user_id from the authentication flow
- **Existing Implementation**: Current endpoints already check `Task.user_id == user_id` in WHERE clauses:
  - PATCH: `select(Task).where(Task.id == task_id, Task.user_id == user_id)`
  - DELETE: `select(Task).where(Task.id == task_id, Task.user_id == user_id)`
- **Ensure**: Cross-user data access prevention through user_id validation in all operations
- **Test**: Verify user A cannot access user B's tasks through ID manipulation
- **Consistency**: All endpoints use the same user_id validation pattern for security

## Detailed Implementation Steps

### Step 1: Add Individual Task View Endpoint
```python
@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
def get_task(user_id: str, task_id: UUID, session: Session = Depends(get_session)):
    """Get a specific task"""
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
```

### Step 2: Verify PATCH/DELETE Security
- Confirm existing endpoints properly check `Task.user_id == user_id`
- Ensure all operations validate user ownership before execution

### Step 3: Create Verification Status Endpoint
```python
# Add to a new file src/api/verification.py or extend existing router
@router.get("/verification-status", response_model=dict)
def get_verification_status(current_user: User = Depends(get_current_user)):
    """Get current user's email verification status"""
    return {"verified": current_user.email_verified}
```

### Step 4: Integrate Verification Endpoint
- Add router inclusion in main.py if using separate file
- Or add to existing appropriate router

## Risk Mitigation

### Potential Risks
1. **Breaking existing functionality**: Only add new code, do not modify existing logic
2. **Security vulnerabilities**: Double-check all user_id validations
3. **Type mismatches**: Use existing UUID patterns and datetime handling

### Safeguards
1. **Incremental testing**: Test each endpoint individually
2. **Authentication validation**: Verify JWT dependency works correctly
3. **Data isolation**: Confirm user isolation through user_id checks

## Dependencies

- src/models/task.py: Task model with UUID primary key
- src/schemas/task.py: TaskResponse schema
- src/api/deps.py: JWT authentication dependency
- src/models/user.py: User model with email_verified field
- datetime and timezone: For consistent timestamp handling

## Technical Implementation Details

### Pydantic model_dump Usage
- **Current Implementation**: PATCH endpoint already uses `task_update.model_dump(exclude_unset=True)` for partial updates
- **Pattern**: Follow existing pattern for consistency
- **Benefit**: Allows partial updates without affecting unset fields

### UTC Timestamp Management
- **Current Implementation**: All timestamps use `datetime.now(timezone.utc)` as required
- **Consistency**: Both created_at and updated_at fields follow this pattern
- **Import**: Use `from datetime import datetime, timezone` for consistency

## Success Criteria

- [X] Individual task view endpoint returns complete task details
- [X] PATCH/DELETE operations properly isolate user data
- [X] Verification status endpoint returns accurate email verification status
- [X] All existing functionality remains intact
- [X] No cross-user data access possible
- [X] Type safety maintained with UUID and UTC timestamps
- [X] Pydantic model_dump used consistently for updates
- [X] UTC timestamps applied to all datetime fields