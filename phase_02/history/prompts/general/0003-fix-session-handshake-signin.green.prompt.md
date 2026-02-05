---
id: 0003
title: Fix Session Handshake Sign-in
stage: green
date: 2026-02-05
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: 010-add-cors-deployment-config
user: developer
command: implement plan
labels: ["auth", "session", "bcrypt", "better-auth", "cors"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/lib/auth-client.ts
  - frontend/lib/auth.ts
  - frontend/lib/api.ts
  - frontend/package.json
tests:
  - manual: sign in with existing user (bcrypt hash) creates session and cookie
  - manual: sign up new user creates bcrypt hash and session
  - manual: browser DevTools shows better-auth.session_token cookie
  - manual: task CRUD from dashboard works with session token
  - manual: page refresh on /dashboard maintains session
---

## Prompt

Implement the following plan:

# Fix Session Handshake: Sign-in Returns 200 but No Redirect/Session

## Root Cause

There are **two separate issues** causing the handshake failure:

### Issue 1: `authClient` baseURL points to the wrong server
- `frontend/lib/auth-client.ts:4` — `baseURL` is set to `NEXT_PUBLIC_API_URL` (the FastAPI backend)
- When `authClient.signIn.email()` fires, it sends the request to FastAPI at `/api/auth/sign-in/email`
- FastAPI returns raw JSON `{user, session}` but **sets no cookies** and **persists no session to DB**
- Better Auth client expects its server to respond with `Set-Cookie` headers — only the Better Auth server (Next.js `/api/auth/[...all]`) does this
- Result: 200 OK response, but `authClient.getSession()` returns null because no cookie was set

### Issue 2: Password hash format mismatch (bcrypt vs scrypt)
- FastAPI (`backend/src/core/security.py:14-19`) hashes passwords with **bcrypt** (`$2b$...`)
- Better Auth (`node_modules/better-auth/dist/crypto/password.mjs:23-27`) hashes passwords with **scrypt** (`salt:key` hex format)
- If we just fix the baseURL, existing users would fail to sign in because Better Auth can't verify bcrypt hashes with its default scrypt verifier

### Issue 3 (minor): Double `/api` in axios fallback URL
- `frontend/lib/api.ts:5` has fallback `"https://amraha-anwar-plannior-backend.hf.space/api"`
- Task API calls already include `/api/` prefix in their paths, producing `https://.../api/api/...`

## Plan (4 changes, 1 dependency)

### Step 1: Fix `authClient` baseURL
### Step 2: Add bcrypt password verification to Better Auth config
### Step 3: Fix axios fallback URL
### Step 4: Ensure Vercel environment variables are correct

## Response snapshot

Implemented all 3 code changes from the plan:

1. **`frontend/lib/auth-client.ts`**: Changed `baseURL` from `NEXT_PUBLIC_API_URL` (FastAPI) to `NEXT_PUBLIC_BETTER_AUTH_URL || ""` (same-origin Next.js Better Auth server). This ensures `authClient.signIn.email()` hits the Next.js `/api/auth/[...all]` route which sets cookies and persists sessions.

2. **`frontend/lib/auth.ts`**: Added `bcryptjs` import and custom `password.hash`/`password.verify` to the Better Auth `emailAndPassword` config. `hash` uses `bcrypt.hash(password, 10)` for new passwords; `verify` uses `bcrypt.compare(password, hash)` to validate existing bcrypt hashes from FastAPI.

3. **`frontend/lib/api.ts`**: Removed trailing `/api` from the fallback URL to prevent double-pathing (`/api/api/...`).

4. **`frontend/package.json`**: Added `bcryptjs` and `@types/bcryptjs` dependencies via npm install.

Build compiled successfully. Pre-existing type errors in `login-form.tsx` (missing toast exports) and `user-menu.tsx` (missing modules) are unrelated.

## Outcome

- Impact: Fixes the complete sign-in session handshake — auth requests now route to the correct server (Next.js Better Auth), passwords are verified with bcrypt (matching FastAPI's format), and API URLs no longer double-path.
- Tests: Manual verification required (sign in, sign up, cookie check, CRUD, session persistence)
- Files: 4 files modified (auth-client.ts, auth.ts, api.ts, package.json)
- Next prompts: Deploy to Vercel and set NEXT_PUBLIC_BETTER_AUTH_URL env var; fix pre-existing toast/user-menu type errors
- Reflection: Root cause was authClient pointing to FastAPI instead of Next.js — a common misconfiguration when the auth server and API server are separate services

## Evaluation notes (flywheel)

- Failure modes observed: None during implementation; pre-existing build errors in unrelated files
- Graders run and results (PASS/FAIL): Build compilation PASS, TypeScript pre-existing FAIL (unrelated)
- Prompt variant (if applicable): plan-to-implementation
- Next experiment (smallest change to try): Fix pre-existing toast export errors in login-form.tsx
