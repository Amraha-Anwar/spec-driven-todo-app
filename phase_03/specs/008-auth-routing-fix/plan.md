# Plan: 008-auth-routing-fix

## 1. Scope and Dependencies

### In Scope
- Fix authentication middleware to properly decode Better Auth JWT tokens
- Standardize all backend routes under the /api/ prefix
- Update frontend to automatically attach JWT to all API headers
- Ensure proper user ID passing in dynamic URL paths
- Fix 401 Unauthorized and 404 Not Found errors

### Out of Scope
- Changing authentication provider (Better Auth remains unchanged)
- Major UI redesign or functionality additions beyond authentication fixes
- Database schema changes

### External Dependencies
- Better Auth service for JWT token generation
- Environment variables containing shared secrets
- Existing Neon PostgreSQL database with user table

## 2. Key Decisions and Rationale

### Decision 1: Standardize Backend Routes Under /api/ Prefix
- **Options Considered**: Keep current mixed routing vs. standardize all under /api/
- **Trade-offs**: Standardization improves consistency but requires URL updates across codebase
- **Rationale**: Following API best practices and meeting Phase II spec requirements
- **Principle**: Maintain consistent API endpoint structure

### Decision 2: Shared Utility for Frontend JWT Attachment
- **Options Considered**: Individual header management vs. centralized utility
- **Trade-offs**: Centralized approach reduces duplication but creates single dependency
- **Rationale**: Ensures all API calls consistently include authorization headers
- **Principle**: DRY (Don't Repeat Yourself) approach to authentication

### Decision 3: Environment Variable for Shared Secret
- **Options Considered**: Hardcoded secrets vs. environment variables vs. external secret store
- **Trade-offs**: Env vars balance security with ease of deployment
- **Rationale**: Standard practice for managing sensitive configuration
- **Principle**: Security through environment-based configuration

## 3. Interfaces and API Contracts

### Public APIs
- **Inputs**: JWT tokens in Authorization header, user ID in URL paths
- **Outputs**: Protected resource access, task operations responses
- **Errors**: 401 for unauthorized, 404 for not found, 200/201 for success

### Versioning Strategy
- No versioning required - maintaining existing API contract with fixes

### Error Handling
- **Timeouts**: Standard HTTP timeouts apply
- **Retries**: Client-side retry logic for failed requests
- **Error Taxonomy**: 401 (Unauthorized), 404 (Not Found), 200/201 (Success)

## 4. Non-Functional Requirements (NFRs) and Budgets

### Performance
- p95 latency: <200ms for authenticated API requests
- Throughput: Support 100 concurrent authenticated users

### Reliability
- SLOs: 99.5% uptime for authenticated endpoints
- Error budget: <0.5% 401/404 errors for valid requests

### Security
- AuthN/AuthZ: JWT verification using shared secret
- Data handling: User isolation via JWT claims
- Secrets: Stored in environment variables, never hardcoded

### Cost
- No additional infrastructure costs anticipated

## 5. Data Management and Migration

### Source of Truth
- Better Auth for user authentication
- Neon PostgreSQL for task data

### Schema Evolution
- No schema changes required for this feature

### Migration Strategy
- No data migration needed

## 6. Operational Readiness

### Observability
- Log authentication success/failure events
- Monitor 401/404 error rates
- Track API response times

### Alerting
- Alert on sudden increases in 401/404 errors
- Monitor authentication failure patterns

### Runbooks
- Document JWT verification troubleshooting steps
- API routing verification procedures

### Deployment Strategy
- Standard deployment with authentication verification post-deploy

## 7. Risk Analysis and Mitigation

### Top 3 Risks
1. **Authentication Breakage**: Risk of breaking existing user sessions
   - Mitigation: Thorough testing with valid/invalid tokens

2. **Route Conflicts**: Risk of creating conflicting API endpoints
   - Mitigation: Verify all routes follow /api/ prefix pattern

3. **Secret Exposure**: Risk of exposing shared secrets
   - Mitigation: Use environment variables, audit code for hardcoded values

## 8. Evaluation and Validation

### Definition of Done
- All API endpoints accessible with proper authentication
- No 401 errors for valid JWT tokens
- No 404 errors for valid API routes
- Frontend consistently sends authorization headers

### Output Validation
- Test suite passes for authentication flows
- Manual verification of task CRUD operations
- Verification that all endpoints follow /api/ pattern

## 9. Implementation Steps

### Step 1: Backend Route Standardization
1. Update `main.py` to include all routers with `/api/` prefix
2. Verify `tasks_router` is properly prefixed
3. Test all backend endpoints for correct routing

### Step 2: JWT Verification Fix
1. Update `get_current_user` function to properly decode Better Auth JWTs
2. Use shared secret from environment variables
3. Test JWT verification with valid and invalid tokens

### Step 3: Frontend Authentication Utility
1. Create shared utility to automatically attach JWT to headers
2. Update all frontend API calls to use the utility
3. Verify proper user ID passing in dynamic URL paths

### Step 4: Integration Testing
1. Test complete authentication flow
2. Verify all task operations work with authentication
3. Confirm no 401/404 errors for authenticated users

## Architectural Decision Records (ADR)
- For each significant decision, create an ADR and link it if needed.