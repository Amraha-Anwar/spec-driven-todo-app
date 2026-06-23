---
id: 0006
title: Fix chat signin redirect glitch
stage: green
date: 2026-06-19
surface: agent
model: claude-opus-4-8[1m]
feature: none
branch: main
user: Amraha Anwar
command: general
labels: ["auth", "better-auth", "chat-widget", "401", "frontend", "bugfix"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - frontend/components/chat/ChatWidget.tsx
tests:
 - Backend get_current_user verified to ACCEPT a real DB session token (returns user)
 - DB session inspection: 4 alive sessions, 32-char tokens matching session table
---

## Prompt

whenever I'm sending message it's redirecting me to signin page and then letting me sign in without even entering password and email.. fix this glitch

## Response snapshot

Diagnosis: The redirect was a SYMPTOM of a 401 on the chat POST, not a real sign-out.

Chain of events:
1. ChatWidget captured the Better Auth session ONCE at mount (`setSession(data)`) and sent the frozen `session.session?.token` (falling back to "") on every chat request via raw fetch.
2. Better Auth rotates session tokens, so the mounted token goes stale. The backend (`deps.py`) looks the bearer token up in the `session` table and returns 401 when it no longer matches.
3. On 401 the widget did `router.push("/auth/signin")`.
4. The signin page's `useEffect` calls `getSession()`, sees the still-valid cookie session, and immediately `router.push('/dashboard')` — so the user "signs in without credentials." That's the glitch.

Verified the backend is NOT at fault: calling `get_current_user` with a real DB session token returned the user successfully. The project's own `lib/api.ts` already uses the correct pattern (fresh `getSession({ cached: false })` + retry once on 401); the ChatWidget bypassed it.

Fix (ChatWidget.tsx only):
- Added `getFreshToken()` that calls `authClient.getSession({ cached: false })` for a live token and re-syncs local session after rotation.
- Send handler now: fetch fresh token -> POST; on 401 fetch a brand-new token and retry once; only if still 401 show a graceful "session expired" message instead of the disorienting redirect-bounce.
- History-restore fetch also uses the fresh token (skips silently if none).
- Kept `router` (still used by the unauthenticated chat button — a legitimate redirect when there is no session at all).

## Outcome

- ✅ Impact: Sending a chat message no longer bounces through signin. A rotated token is transparently refreshed + retried; a real expiry shows a clear message in-widget.
- 🧪 Tests: Backend auth proven to accept valid tokens (live DB). Frontend `tsc` blocked by a PRE-EXISTING tsconfig error (`--ignoreDeprecations`), confirmed identical on stashed original — unrelated to this change.
- 📁 Files: frontend/components/chat/ChatWidget.tsx.
- 🔁 Next prompts: Consider routing the widget through the shared axios `api` instance so token-refresh/retry lives in one place.
- 🧠 Reflection: A redirect to signin that "auto-logs-in" is the fingerprint of a 401 against a still-valid cookie session — fix the token freshness, not the redirect.

## Evaluation notes (flywheel)

- Failure modes observed: stale mounted token; raw fetch bypassing the shared 401-retry interceptor; signin-page auto-bounce masking the real 401.
- Graders run and results (PASS/FAIL): Backend auth PASS. Frontend typecheck blocked by pre-existing tsconfig (not introduced here).
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): migrate ChatWidget fetch calls onto the shared `api` axios instance.
