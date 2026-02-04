# ADR-0001: Authentication & UI Sync Approach

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-01-29
- **Feature:** 006-auth-sync
- **Context:** Need to address 401 Unauthorized errors in authentication flow, implement proper JWT handling between Better Auth and FastAPI backend, secure API endpoints against cross-user data access, and enhance UI with task completion controls. The solution must maintain backward compatibility while strengthening security posture.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

Implement an integrated authentication and UI synchronization approach that includes:

- **JWT Integration**: Leverage Better Auth's session management with proper JWT token attachment to all API calls using `authClient.getSession()` method
- **Optional Authentication**: Modify verification endpoint to use optional authentication instead of required authentication to prevent crashes during initial load
- **Enhanced Security**: Add user ID validation to ensure users can only access their own tasks, preventing cross-user data access
- **UI Enhancement**: Add complete/delete buttons to task list UI with proper mapping of `is_completed` field from database to UI status

## Consequences

### Positive

- Stronger security posture with user isolation preventing cross-user data access
- Improved user experience with graceful handling of authentication states
- Consistent JWT handling across all API calls reducing 401 errors
- Enhanced UI functionality allowing direct task completion/deletion
- Maintained backward compatibility while adding security improvements

### Negative

- Additional complexity in token refresh and error handling mechanisms
- Potential performance impact from additional user ID validation on every request
- Increased cognitive load for developers understanding the dual authentication system (Better Auth + custom JWT validation)
- More complex debugging process due to layered authentication mechanisms

## Alternatives Considered

Alternative Approach A: Completely separate authentication flows for frontend and backend without JWT integration
- Rejected because it would lead to inconsistent authentication states and increased security vulnerabilities

Alternative Approach B: Full migration to stateless JWT tokens without Better Auth session management
- Rejected because it would require extensive refactoring of existing authentication infrastructure and lose Better Auth's convenience features

Alternative Approach C: Client-only task access control without server-side validation
- Rejected because it would create serious security vulnerabilities allowing users to manipulate URLs and access other users' data

## References

- Feature Spec: D:/phase-2/specs/006-auth-sync/spec.md
- Implementation Plan: D:/phase-2/specs/006-auth-sync/plan.md
- Related ADRs: none
- Evaluator Evidence: PHR 0002-auth-sync-plan.plan.prompt.md