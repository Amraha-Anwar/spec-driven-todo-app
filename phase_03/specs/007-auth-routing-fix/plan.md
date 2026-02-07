# Plan: Authentication Middleware and URL Routing Fix

## 1. Scope and Dependencies

### In Scope:
- Standardize all backend routes under the /api/ prefix
- Create a shared utility in frontend to automatically attach JWT to all headers
- Use the shared secret from environment variables for JWT signing and verification
- Update main.py router inclusion for tasks_router with correct prefixing
- Verify userId is correctly passed in the dynamic URL path
- Fix 401 Unauthorized and 404 Not Found errors
- Ensure URL consistency with /api/ prefix for task endpoints

### Out of Scope:
- Changing the core authentication flow of Better Auth
- Major UI redesign beyond header adjustments
- Database schema changes

### External Dependencies:
- Better Auth for authentication
- FastAPI backend framework
- Environment variables for shared secrets
- Axios for HTTP requests

## 2. Key Decisions and Rationale

### Options Considered:
1. **Route Prefixing**: Standardize all routes under /api/ vs. maintaining current mixed approach
2. **JWT Header Management**: Centralized utility vs. manual header addition in each request
3. **Secret Management**: Environment variables vs. configuration files for shared secrets

### Rationale:
- Standardize all backend routes under /api/ prefix to ensure URL consistency and eliminate 404 errors
- Create a shared utility in frontend to automatically attach JWT to all headers to ensure authentication consistency
- Use shared secret from environment variables for secure JWT signing and verification

### Principles:
- Maintain backward compatibility where possible
- Ensure security-first approach for authentication
- Apply consistent patterns across all endpoints

## 3. Interfaces and API Contracts

### Public APIs:
- `/api/{user_id}/tasks/*` - Task operations with standardized /api/ prefix
- JWT verification endpoints using shared secret
- All authenticated endpoints requiring proper Authorization header

### Versioning Strategy:
- No versioning required - maintaining existing API contracts with standardized prefixes

### Error Taxonomy:
- 401: Invalid/expired JWT token
- 403: Insufficient permissions (user attempting to access others' data)
- 404: Resource not found (due to incorrect routing)

## 4. Non-Functional Requirements

### Performance:
- p95 latency < 500ms for authentication operations
- Sub-second response times for task operations
- Efficient JWT verification without impacting performance

### Reliability:
- SLO: 99.5% availability for authenticated endpoints
- Graceful handling of authentication failures
- Robust error recovery for routing issues

### Security:
- JWT validation on all protected endpoints
- Secure token storage and transmission
- Proper user isolation to prevent cross-user data access

### Cost:
- Minimal additional computational overhead
- Efficient token validation without unnecessary operations

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
- Track routing errors to identify remaining inconsistencies

### Alerting:
- Threshold: >5% 401 error rate
- On-call rotation for authentication issues

### Runbooks:
- Troubleshooting JWT validation issues
- Resolving routing inconsistencies

## 7. Risk Analysis and Mitigation

### Top 3 Risks:
1. **Authentication Failures**: Risk of users being unable to access protected resources
   - Mitigation: Comprehensive testing of JWT flow, fallback mechanisms
2. **Routing Inconsistencies**: Mixed prefix usage causing 404 errors
   - Mitigation: Thorough audit of all routes, standardized prefix implementation
3. **Header Injection Issues**: Improper JWT attachment to requests
   - Mitigation: Centralized header management utility, testing

### Blast Radius:
- Authentication issues could affect all protected endpoints
- Routing issues could impact specific API sections

### Kill Switches:
- Ability to disable JWT validation temporarily for debugging
- Feature flags for new routing patterns

## 8. Implementation Steps

### Step 1: Standardize Backend Routes
**Files to modify**: `backend/main.py`

- Update router inclusion to use /api/ prefix for all routes
- Ensure tasks_router is properly prefixed with /api/
- Verify all existing routes follow the /api/ standard

### Step 2: Create Frontend JWT Utility
**Files to modify**:
- `frontend/lib/api.ts` - Create centralized utility for JWT header attachment
- `frontend/lib/fetcher.ts` - Update to use the new utility
- `frontend/components/tasks/add-task-form.tsx` - Ensure proper JWT inclusion
- `frontend/components/tasks/task-list.tsx` - Ensure proper JWT inclusion

### Step 3: Update Secret Management
**Files to modify**:
- `backend/src/core/security.py` - Ensure proper use of shared secret from env vars
- `backend/src/api/deps.py` - Update dependency functions to use the correct secret

### Step 4: Verify Dynamic URL Paths
**Files to modify**:
- `frontend/components/tasks/add-task-form.tsx` - Verify userId is correctly passed in the path
- `frontend/components/tasks/task-list.tsx` - Verify userId is correctly passed in the path
- `frontend/app/hooks/use-tasks.ts` - Ensure proper URL construction

### Step 5: Test Route Consistency
**Files to modify**:
- `backend/src/api/tasks.py` - Ensure all task endpoints use consistent /api/ pattern
- Update any remaining routes that don't follow the /api/ prefix convention

### Step 6: Final Integration Testing
- Test all task operations (CRUD) with proper authentication
- Verify no 401 or 404 errors occur with authenticated users
- Confirm all routes follow the /api/ prefix standard

## 9. Technical Implementation Details

### Backend Changes:
1. **Route Standardization**:
   - Update main.py to include all routers with /api/ prefix
   - Ensure tasks endpoints follow pattern: /api/{user_id}/tasks/*

2. **JWT Verification**:
   - Use shared secret from environment variables
   - Implement proper decoding and validation
   - Maintain user isolation through token verification

### Frontend Changes:
1. **Centralized Header Management**:
   - Create utility function to automatically attach JWT to all requests
   - Integrate with existing API client
   - Ensure proper token retrieval from Better Auth session

2. **Dynamic Path Verification**:
   - Verify userId is correctly passed in URL paths
   - Update all fetch calls to use consistent /api/ prefix
   - Ensure proper error handling for routing issues

## 10. Testing Approach

### Unit Tests:
- JWT validation functions
- Route prefixing functionality
- Header attachment utility

### Integration Tests:
- End-to-end authentication flow
- Task operations with proper routing
- Cross-component header management

### Manual Testing:
- Verify all routes use /api/ prefix
- Test task operations with authenticated users
- Confirm no 401/404 errors occur

## 11. Acceptance Criteria

- [ ] All backend routes follow /api/ prefix standard
- [ ] Frontend automatically attaches JWT headers to all requests
- [ ] Shared secret is properly used from environment variables
- [ ] Main.py router inclusion uses correct prefixing
- [ ] UserId is correctly passed in dynamic URL paths
- [ ] No 401 Unauthorized errors for authenticated users
- [ ] No 404 Not Found errors due to routing inconsistencies
- [ ] Tasks are successfully fetched and posted with 200/201 status
- [ ] All task endpoints consistently use /api/{user_id}/tasks pattern