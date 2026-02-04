# Quickstart: Frontend Auth Flow Verification

## Prerequisites
- Backend server running on `http://localhost:8000` (FastAPI)
- Frontend server running on `http://localhost:3000` (Next.js)
- Better Auth server URL configured correctly

## Verification Steps

### 1. Environment Setup
Ensure your `.env.local` (Frontend) includes:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
BETTER_AUTH_URL=http://localhost:3000 # or your auth server URL
```

### 2. Signup Flow
1. Navigate to `/auth/signup`.
2. Enter a new email, password, and name.
3. Click "Sign Up".
4. **Expect**:
   - Redirect to Dashboard.
   - Toast notification: "Welcome!".
   - `access_token` stored (check logic/logs).
   - Cookies: `better-auth.session_token` (or equivalent) set as HttpOnly.

### 3. Duplicate Email Handling
1. Logout (if logged in).
2. Navigate to `/auth/signup`.
3. Enter the *same* email used in Step 2.
4. Click "Sign Up".
5. **Expect**:
   - Stay on Signup page.
   - Toast notification: "User already exists" (409 Conflict).

### 4. Authenticated Fetch
1. Login with valid credentials.
2. Open Network tab in DevTools.
3. Observe request to `/api/user_id/tasks` (or equivalent).
4. **Expect**:
   - Request Header `Authorization: Bearer <token>` is present.
   - Status: 200 OK.

### 5. Silent Refresh (Simulation)
1. Manually expire the access token (if possible in dev tools) or wait for short expiry.
2. Trigger a fetch (e.g., refresh list).
3. **Expect**:
   - Initial 401 response (caught by interceptor).
   - Automatic call to `/auth/refresh` (or equivalent).
   - Retry of original request.
   - Final success (200 OK).

### 6. Logout
1. Click "Logout".
2. **Expect**:
   - Redirect to Login/Home.
   - Local storage/State cleared.
   - Cookies cleared.
   - Access to protected routes redirects to Login.
