---
id: 0007
title: Fix chat 401 404 stale conversation
stage: green
date: 2026-06-19
surface: agent
model: claude-opus-4-8[1m]
feature: none
branch: main
user: Amraha Anwar
command: general
labels: ["auth", "chat-widget", "401", "404", "stale-conversation", "bugfix"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - frontend/components/chat/ChatWidget.tsx
 - backend/src/api/chat.py
tests:
 - Live curl: POST /chat with valid token -> 200; with stale conv -> 403; retry null -> 200
 - Live curl: GET /chat/messages with stale conv -> 200 {"messages":[]} (was 500)
 - backend pytest: 263 passed, 14 pre-existing failures (unrelated metadata collision)
---

## Prompt

now after sending message i'm getting Sorry, I encountered an error: Your session has expired. Please sign in again to continue.. Please try again. this message and 404 on backend logs

## Response snapshot

Two distinct problems, both surfaced after the previous auth fix + an earlier DB reset:

1. EMPTY-TOKEN REGRESSION (the 401 / "session expired"):
   My prior `getFreshToken()` used `authClient.getSession({ cached: false })` and returned `data.session.token || ""`. The live `/get-session` network response can OMIT the raw token (it's only in the client store from sign-in), so it returned "" -> both attempts 401 -> "session expired". Proven the backend was fine: a live curl POST with a real DB token returns 200 + AI reply.
   Fix: `getFreshToken()` now tries a live lookup but FALLS BACK to the mounted/sign-in token (via an `extractToken` helper covering token/accessToken), so it never returns empty when a usable token exists.

2. STALE CONVERSATION_ID (the 404/403/500 in logs):
   The widget persists `conversation_<userid>` in localStorage. After the DB was reset earlier, that id was orphaned. POST /chat with a non-existent conversation -> 403 ("Conversation not found"); GET /chat/messages -> 500 (its intended 404 was swallowed by a broad `except Exception`).
   Fixes:
   - Frontend: added `clearStaleConversation()` (clears state + localStorage). History-restore clears on 404/403/500. Send handler: on 403 with a conversationId, clear it and retry once with `conversation_id: null` so the message still goes through on a fresh conversation.
   - Backend (`chat.py` GET messages): missing conversation now returns `{"messages": []}` instead of raising; added `except HTTPException: raise` so intentional HTTP errors aren't masked as 500.

Verified live: stale conv POST 403 -> retry null 200; messages stale conv now 200 empty.

## Outcome

- ✅ Impact: Sending a message works again. Token is resolved robustly (no false "session expired"); a stale saved conversation self-heals into a fresh one instead of 403/404/500.
- 🧪 Tests: Live curl matrix passes. Backend pytest 263 pass / 14 pre-existing unrelated failures (Table 'task' already defined metadata collision, proven pre-existing earlier).
- 📁 Files: frontend/components/chat/ChatWidget.tsx, backend/src/api/chat.py.
- 🔁 Next prompts: Route ChatWidget through shared axios `api` so token+conversation recovery lives in one interceptor.
- 🧠 Reflection: A "fresh" lookup is only better if it actually carries the credential — the network get-session omitted the token. Prefer "best non-empty of {live, mounted}" over "live or nothing."

## Evaluation notes (flywheel)

- Failure modes observed: live get-session omits raw token; broad `except Exception` masking a 404 as 500; orphaned localStorage conversation id after DB reset.
- Graders run and results (PASS/FAIL): Live curl PASS; backend suite PASS (minus pre-existing).
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): migrate widget fetches to shared axios `api` instance.
