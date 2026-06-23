---
id: 0013
title: Fix Optimistic Message Vanish
stage: green
date: 2026-06-23
surface: agent
model: claude-opus-4-8[1m]
feature: none
branch: main
user: Amraha Anwar
command: general
labels: ["frontend", "bugfix", "chat", "react", "useEffect"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - frontend/components/chat/ChatWidget.tsx
tests:
 - none (UI race fix; IDE diagnostics clean on ChatWidget.tsx)
---

## Prompt

one last fix... when I'm sending a message to agent, it disappears while the reply is loading, then when the agent's reply come my sent message also come with that, that's not right.. fix this

## Response snapshot

Root cause: a useEffect race. The chat-history restore effect depended on `[session?.user]` — an OBJECT reference. `handleSendMessage` calls `getFreshToken()`, which calls `setSession(data)` with a brand-new session object on every send (to pick up token rotation). That new object made `session?.user` a new reference, so the restore effect re-ran mid-send, fetched DB history (which did NOT yet contain the in-flight message), and called `setMessages(...)` — overwriting the optimistic user bubble. It only reappeared once the reply landed and a later render re-fetched history that by then included it.

Fix: changed the effect dependency from the `session.user` object to the stable primitive `session?.user?.id`, so restore runs only when the actual user changes (mount / real switch), not on every token refresh during a send. Added a comment documenting the trap.

## Outcome

- ✅ Impact: The sent message now stays visible the instant it's sent and through the loading state; no vanish/duplicate-on-reply.
- 🧪 Tests: IDE diagnostics empty on ChatWidget.tsx.
- 📁 Files: 1 modified (one-line dependency change + comment).
- 🔁 Next prompts: optional — give optimistic messages stable ids to dedupe against re-hydrated history if backend echoes them.
- 🧠 Reflection: Depending on object references in useEffect deps is a classic re-run trap; primitives (ids) are the safe key.

## Evaluation notes (flywheel)

- Failure modes observed: effect re-run from object-identity churn caused optimistic state to be clobbered by a stale fetch.
- Graders run and results (PASS/FAIL): PASS (changed-file diagnostics clean).
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): add a test that asserts the optimistic message survives a setSession() call during an in-flight send.
