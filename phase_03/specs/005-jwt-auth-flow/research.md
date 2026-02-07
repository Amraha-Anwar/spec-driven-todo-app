# Research & Decisions: Secure JWT Auth Flow

**Feature Branch**: `005-jwt-auth-flow`
**Date**: 2026-01-11

## Decisions

### 1. Token Storage Strategy
**Decision**: Use **HTTP-Only Cookies** for storing tokens.
**Rationale**: 
- **Security**: Mitigates Cross-Site Scripting (XSS) attacks as JavaScript cannot access the tokens.
- **Standards**: Aligns with the project constitution principle of "Stateless Reliability" and standard secure web practices.
- **Better Auth Integration**: Better Auth natively supports cookie-based sessions, simplifying integration.
**Alternatives Considered**:
- *Local Storage*: Rejected due to high vulnerability to XSS attacks.
- *Session Storage*: Rejected due to poor UX (session lost on tab close) and XSS vulnerability.

### 2. Token Refresh & Persistence
**Decision**: **Silent Refresh** (Short-lived Access Token + Long-lived Refresh Token).
**Rationale**:
- **Security**: Access tokens expire quickly, limiting the window of opportunity for stolen tokens.
- **UX**: Refresh tokens allow users to stay logged in seamlessly without frequent re-logins.
- **Mechanism**: The Refresh Token is stored as a secure HTTP-only cookie, automatically sent with requests to the refresh endpoint.
**Alternatives Considered**:
- *Sliding Expiration*: Rejected as it can keep sessions alive indefinitely if compromised and is less standard for stateless JWTs.
- *Long-lived Token*: Rejected due to security risks; hard to revoke without a blacklist.

### 3. Data Fetching & Caching
**Decision**: Use **SWR** (or React Query) for protected resources.
**Rationale**:
- **Performance**: Provides automatic caching, reducing unnecessary API calls.
- **UX**: "Stale-while-revalidate" strategy ensures the UI is snappy while data updates in the background.
- **Integration**: Fits naturally with the Next.js ecosystem and standard hooks patterns.
**Alternatives Considered**:
- *Manual `useEffect`*: Rejected due to boilerplate and lack of robust features like caching and deduplication.
- *Server Components (RSC)*: While powerful, client-side interactivity (like task management) benefits from SWR's client-side cache and revalidation on focus.

### 4. API Error Handling (401/Retry)
**Decision**: Use **Axios Interceptors**.
**Rationale**:
- **Centralization**: Handles 401 Unauthorized errors in one place, preventing code duplication across components.
- **Automation**: Can automatically trigger the token refresh flow and retry the failed request transparently to the user.
**Alternatives Considered**:
- *Custom Fetch Wrapper*: Valid but requires re-implementing interceptor logic manually.
- *SWR Global Error Handling*: Good for notifications but less capable of handling the specific "refresh and retry" flow compared to Axios.

### 5. UI Error Presentation
**Decision**: **Generic Error Component** (Toast/Alert).
**Rationale**:
- **Consistency**: Ensures all errors (e.g., 409 Conflict during signup) look and behave the same way.
- **Maintainability**: Centralizes the UI logic for errors, making it easier to update the design globally.
**Alternatives Considered**:
- *Page-specific handling*: Rejected as it leads to inconsistent UI and duplicated code.
