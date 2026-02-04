# ADR-0002: Authentication & URL Routing Approach

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-01-29
- **Feature:** 007-auth-routing-fix
- **Context:** Need to resolve 401 Unauthorized and 404 Not Found errors in the authentication middleware and URL routing. The solution must standardize all backend routes under the /api/ prefix, create a shared utility in frontend to automatically attach JWT to all headers, and use the shared secret from environment variables for JWT signing and verification. This affects the entire application's authentication and routing architecture.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

Implement a comprehensive authentication and URL routing approach that includes:

- **Route Standardization**: Standardize all backend routes under the /api/ prefix to ensure URL consistency and eliminate 404 errors
- **Centralized JWT Management**: Create a shared utility in frontend to automatically attach JWT to all headers for consistent authentication
- **Secure Secret Management**: Use the shared secret from environment variables for JWT signing and verification to ensure security
- **Correct Prefixing**: Update main.py router inclusion for tasks_router with correct prefixing to maintain proper routing
- **Dynamic Path Verification**: Verify userId is correctly passed in the dynamic URL path to maintain user isolation

## Consequences

### Positive

- URL consistency maintained across the entire API surface with standardized /api/ prefix
- Reduced authentication errors with centralized JWT header management ensuring all requests are properly authenticated
- Improved security posture with shared secrets properly managed through environment variables
- Better maintainability with consistent routing patterns across all endpoints
- Elimination of 401 Unauthorized and 404 Not Found errors for authenticated users
- Clear separation of concerns with centralized authentication utilities

### Negative

- Potential breaking changes if clients rely on old URL patterns without /api/ prefix
- Additional complexity in the frontend with centralized JWT utility layer
- Increased dependency on environment variables for secret management
- Need for coordinated deployment to ensure frontend and backend changes align
- Possible performance impact from additional header processing in the centralized utility

## Alternatives Considered

Alternative Approach A: Keep existing mixed routing approach with inconsistent prefixes
- Rejected because it would perpetuate 404 errors and lack of standardization

Alternative Approach B: Manual JWT header attachment in each individual request
- Rejected because it would lead to inconsistent authentication and potential security vulnerabilities

Alternative Approach C: Store shared secrets in configuration files instead of environment variables
- Rejected because it would pose security risks with secrets potentially being checked into version control

Alternative Approach D: Allow inconsistent URL patterns based on individual endpoint needs
- Rejected because it would create confusion and maintenance difficulties

## References

- Feature Spec: D:/phase-2/specs/007-auth-routing-fix/spec.md
- Implementation Plan: D:/phase-2/specs/007-auth-routing-fix/plan.md
- Related ADRs: none
- Evaluator Evidence: PHR records from planning phase
