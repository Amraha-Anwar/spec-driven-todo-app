# Secure JWT Auth Flow (Frontend)

## Overview
Implemented a secure authentication and data fetching flow in the Next.js frontend.

## Key Components
- **Better Auth Client**: Handles signup, login, and session management.
- **AuthContext**: Manages the short-lived `access_token` in memory.
- **Axios Interceptors**:
  - Request: Injects the `Authorization: Bearer <token>` header.
  - Response: Handles 401 Unauthorized errors by triggering a silent refresh.
- **SWR Hooks**: Provides cached, auto-revalidating data fetching for Tasks and Verification Status.
- **UI Components**: Secure Signup/Login forms and user menus.

## Verification
Run tests:
```bash
cd frontend
npm test
```

## Security Decisions
- **HttpOnly Cookies**: Used for long-lived Refresh Tokens to prevent XSS.
- **In-Memory Storage**: Short-lived Access Tokens are never persisted to disk.
- **Automatic Cleanup**: Logout clears all tokens and the SWR cache.
