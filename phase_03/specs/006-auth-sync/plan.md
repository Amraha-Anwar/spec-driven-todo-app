# Implementation Plan: Phase II Authentication & UI Sync

## 1. Scope and Dependencies

### In Scope:
- Fix 401 Unauthorized errors in verification-status endpoint
- Enhance JWT handling in frontend API calls
- Implement task completion UI with complete/delete buttons
- Secure the verification endpoint to handle unauthenticated states gracefully
- Address the security vulnerability in the tasks API

### Out of Scope:
- Major UI redesign beyond adding completion controls
- Adding new authentication providers
- Database schema changes

### External Dependencies:
- Better Auth for authentication
- FastAPI backend
- SWR for data fetching
- Axios for HTTP requests

## 2. Key Decisions and Rationale

### Options Considered:
1. **Authentication Flow**: Use Better Auth's session management vs. custom JWT handling
2. **UI Update Approach**: Add buttons to existing components vs. creating new components
3. **Error Handling**: Hard error vs. graceful degradation for unauthenticated states

### Rationale:
- Leverage Better Auth's existing infrastructure while ensuring JWT tokens are properly attached to all API requests
- Use optional authentication for verification endpoint to prevent crashes during initial load
- Implement security measures to prevent users from accessing other users' tasks

### Principles:
- Maintain backward compatibility
- Ensure security-first approach
- Minimal viable changes to achieve the goals

## 3. Interfaces and API Contracts

### Public APIs:
- `/api/verification-status` - Returns verification status with optional authentication
- Task CRUD endpoints with proper JWT validation
- Better Auth session endpoints for token refresh

### Versioning Strategy:
- No versioning required - maintaining existing API contracts

### Error Taxonomy:
- 401: Invalid/expired JWT token
- 403: Insufficient permissions (user attempting to access others' data)
- 404: Resource not found

## 4. Non-Functional Requirements

### Performance:
- p95 latency < 500ms for verification-status endpoint
- Sub-second response times for task operations
- Efficient token refresh mechanism to prevent delays

### Reliability:
- SLO: 99.5% availability for authenticated endpoints
- Graceful handling of token refresh failures
- Robust error recovery

### Security:
- JWT validation on all protected endpoints
- User isolation to prevent cross-user data access
- Secure token storage and transmission

### Cost:
- Minimal additional computational overhead
- Efficient token refresh to reduce unnecessary API calls

## 5. Data Management and Migration

### Source of Truth:
- Better Auth for user identity and sessions
- Backend database for task data

### Schema Evolution:
- No schema changes required for this feature

### Migration:
- No data migration required

## 6. Operational Readiness

### Observability:
- Log authentication failures
- Monitor 401 error rates
- Track token refresh success/failure rates

### Alerting:
- Threshold: >5% 401 error rate
- On-call rotation for authentication issues

### Runbooks:
- Troubleshooting JWT validation issues
- Token refresh debugging

## 7. Risk Analysis and Mitigation

### Top 3 Risks:
1. **Authentication Failures**: Risk of users being unable to access protected resources
   - Mitigation: Comprehensive testing of JWT flow, fallback mechanisms
2. **Security Vulnerabilities**: Cross-user data access if authentication checks are insufficient
   - Mitigation: Thorough validation of user ID matching, penetration testing
3. **UI Inconsistencies**: Inconsistent state between frontend and backend
   - Mitigation: Proper synchronization of task completion states

### Blast Radius:
- Authentication issues could affect all protected endpoints
- Token refresh issues could impact user experience

### Kill Switches:
- Ability to disable JWT validation temporarily for debugging
- Feature flags for new UI elements

## 8. Implementation Steps

### Step 1: Secure the Verification Endpoint
**Files to modify**: `backend/src/api/verification.py`

- Change the endpoint to use optional authentication instead of required authentication
- Return default unverified status for unauthenticated requests

### Step 2: Enhance JWT Handling in Frontend
**Files to modify**:
- `frontend/lib/api.ts` - Update the token retrieval to use Better Auth's getSession()
- `frontend/lib/token-store.ts` - Potentially update to use a more persistent storage if needed

### Step 3: Update Task List UI
**Files to modify**: `frontend/components/tasks/task-list.tsx`

- Add complete/delete buttons for each task
- Implement functionality to toggle task completion status
- Map the `is_completed` field from the database to the UI status

### Step 4: Update Add Task Form
**Files to modify**: `frontend/components/tasks/add-task-form.tsx`

- Ensure JWT is properly attached to the API call
- Handle any authentication errors gracefully

### Step 5: Secure Tasks API
**Files to modify**: `backend/src/api/tasks.py`

- Add user ID validation to ensure users can only access their own tasks
- This addresses the security vulnerability identified in the codebase analysis

### Step 6: Implement Task Update Functionality
**Files to modify**: `frontend/components/tasks/task-list.tsx`

- Add functions to update task completion status via API
- Add functions to delete tasks via API

## 9. Technical Implementation Details

### Frontend Changes:
1. **Enhanced Token Retrieval**:
   - Use `authClient.getSession()` to get current session and JWT
   - Update axios interceptors to use this method
   - Handle cases where session is not available

2. **Task List UI Updates**:
   - Add buttons for completing and deleting tasks
   - Implement onClick handlers that call the appropriate API endpoints
   - Update UI state optimistically and handle errors gracefully

### Backend Changes:
1. **Secure Verification Endpoint**:
   - Modify to handle unauthenticated requests gracefully
   - Return appropriate default values when user is not authenticated

2. **Enhanced Task Security**:
   - Add validation to ensure user_id in the JWT matches the user_id in the request path
   - Prevent cross-user data access

## 10. Testing Approach

### Unit Tests:
- JWT validation functions
- Task CRUD operations with proper user validation
- Token refresh mechanisms

### Integration Tests:
- End-to-end authentication flow
- Task operations with proper user isolation
- Verification endpoint behavior with/without authentication

### Manual Testing:
- Verify UI elements work correctly
- Test error handling scenarios
- Validate security measures

## 11. Acceptance Criteria

- [ ] Dashboard shows 'Verified' status after backend verification
- [ ] CRUD operations (Update/Delete) are visible and functional in the UI
- [ ] No 401 errors in backend logs for authenticated requests
- [ ] Verification endpoint handles unauthenticated requests gracefully
- [ ] Users can only access their own tasks (security validation)
- [ ] JWT tokens are properly attached to all API requests
- [ ] Task completion/deletion works through the UI