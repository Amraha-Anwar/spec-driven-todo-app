# Task Breakdown: 008-auth-routing-fix

## Phase 1: Routing & Connectivity (2 tasks)

### Task 1.1: Standardize API Base URL & Prefixes

**What to do:** Update src/main.py to ensure tasks_router and verification_router are included with the correct /api prefix. Update frontend environment variables and fetch calls to use the standardized ${API_URL}/api/... path.

**Acceptance:** "Backend logs show 200 or 401 (not 404) for all task operations; POST requests hit the correct endpoint".

**Output:** Updated backend/src/main.py and frontend/lib/api.ts.

**Implementation Steps:**
1. Update backend/src/main.py to include all routers with /api/ prefix
2. Update frontend/lib/api.ts to use standardized API URL with /api/ prefix
3. Verify all task endpoints follow the /api/ pattern
4. Test that backend no longer returns 404s for task operations

**Status:** [X] Completed

### Task 1.2: Resolve Better Auth Session Path 404s

**What to do:** Check the frontend auth configuration. Ensure the authClient is pointing to the correct backend route for session management and refresh tokens.

**Acceptance:** "Next.js logs no longer show 404 for /api/auth/refresh or /api/auth/get-session".

**Output:** Updated frontend/lib/auth.ts (or relevant auth config file).

**Implementation Steps:**
1. Review current authClient configuration
2. Verify correct backend routes for session management
3. Update auth configuration to use proper API paths
4. Test that no 404s occur for auth-related endpoints

**Status:** [X] Completed

## Phase 2: Authentication & Security (3 tasks)

### Task 2.1: Synchronize JWT Shared Secret

**What to do:** Verify that the BETTER_AUTH_SECRET is identical in both frontend/.env and backend/.env. Ensure the backend uses this secret for the verify_jwt function.

**Acceptance:** "JWT decoding succeeds on the backend without signature mismatch errors".

**Output:** Synced .env files and updated backend/src/core/security.py.

**Implementation Steps:**
1. Verify BETTER_AUTH_SECRET consistency between frontend and backend
2. Update backend JWT verification to use shared secret
3. Test JWT decoding functionality
4. Ensure no signature mismatch errors occur

**Status:** [X] Completed

### Task 2.2: Implement Security through Isolation in Queries

**What to do:** Update all task endpoints in src/api/tasks.py to use the user_id extracted from the JWT token as a mandatory filter in SQLModel queries.

**Acceptance:** "Each user only sees their own tasks; requests without a valid token receive a 401 error".

**Output:** Hardened src/api/tasks.py with mandatory user_id filtering.

**Implementation Steps:**
1. Update get_current_user function to properly extract user_id from JWT
2. Add user_id filtering to all task query operations
3. Ensure unauthorized requests return 401
4. Test user isolation functionality

**Status:** [X] Completed

### Task 2.3: Final E2E Validation of Full CRUD

**Duration:** 20 minutes

**What to do:** Perform a full test loop: Signup → Login → Add Task → View Task → Toggle Completion → Delete Task.

**Acceptance:** "All operations return 200/201/204 status; UI reflects database state; logs are clean of 401/404 errors".

**Output:** Finalized Phase II implementation ready for submission.

**Implementation Steps:**
1. Test complete user registration and login flow
2. Create new tasks and verify they're stored correctly
3. View tasks and confirm proper data retrieval
4. Toggle task completion and verify state changes
5. Delete tasks and confirm removal
6. Verify all operations return appropriate status codes
7. Confirm no authentication or routing errors occur

**Status:** [X] Completed

## Dependencies

- Task 1.1 must be completed before Task 2.2 (routing setup required for authentication)
- Task 1.2 should be completed before Task 2.1 (auth configuration needed for JWT verification)
- Task 2.1 must be completed before Task 2.2 (JWT verification required for user isolation)
- Task 2.3 depends on all previous tasks being completed

## Success Criteria

- All API endpoints accessible with proper authentication
- No 401 errors for valid JWT tokens
- No 404 errors for valid API routes
- Frontend consistently sends authorization headers
- Users can only access their own tasks based on JWT claims
- Complete CRUD operations work end-to-end with proper authentication