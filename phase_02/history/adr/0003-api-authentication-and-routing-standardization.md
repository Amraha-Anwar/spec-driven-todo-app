# ADR-0003: API authentication and routing standardization

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-02-02
- **Feature:** 008-auth-routing-fix
- **Context:** Need to resolve persistent 401 Unauthorized and 404 Not Found errors in the authentication flow. Current system has inconsistent routing patterns and improper JWT token handling that prevents authenticated users from accessing task endpoints reliably.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

Standardize API architecture with consistent patterns for authentication and routing:

- **JWT Verification**: Implement proper decoding of Better Auth JWT tokens using shared secret from environment variables
- **Route Standardization**: All backend routes follow the /api/ prefix pattern for consistency
- **Frontend Integration**: Create shared utility to automatically attach JWT to all API headers
- **URL Consistency**: Ensure proper user ID passing in dynamic URL paths

## Consequences

### Positive

- Consistent API endpoint structure improves developer experience and maintainability
- Proper authentication flow enables secure user isolation
- Centralized JWT handling reduces code duplication and potential security flaws
- Standardized routing eliminates 404 errors caused by inconsistent URL patterns
- Better separation of concerns between frontend and backend authentication logic

### Negative

- Requires refactoring of existing API endpoints which may introduce temporary instability
- Additional complexity in frontend utility layer
- Potential breaking changes to existing API consumers if they relied on inconsistent routes
- Increased dependency on environment variable management for secrets

## Alternatives Considered

Alternative A: Keep current mixed routing approach with selective JWT verification
- Why rejected: Would perpetuate inconsistent API design and ongoing 401/404 errors

Alternative B: Implement separate authentication middleware instead of shared utility
- Why rejected: Would create multiple places for authentication logic, increasing maintenance burden

Alternative C: Use different authentication method (e.g., session-based instead of JWT)
- Why rejected: Would require significant changes to existing Better Auth integration and increase complexity

## References

- Feature Spec: specs/008-auth-routing-fix/spec.md
- Implementation Plan: specs/008-auth-routing-fix/plan.md
- Related ADRs: ADR-0001, ADR-0002
- Evaluator Evidence: history/prompts/008-auth-routing-fix/0001-auth-middleware-fix.spec.prompt.md
