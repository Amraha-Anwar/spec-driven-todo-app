---
id: 0008
title: Redesign Chat Split-Screen UI
stage: general
date: 2026-06-23
surface: agent
model: claude-opus-4-8[1m]
feature: none
branch: main
user: Amraha Anwar
command: general
labels: ["frontend", "ui", "chat", "redesign"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - frontend/components/chat/ChatWidget.tsx
tests:
 - none (visual/UI change; tsc diagnostics clean on file)
---

## Prompt

I want you to make the existing chat interface in a unique style, not this regular chat window, do something like, give it a page like interface, not covered on full screen, but half for the desktop view, and add something attractive on the other half, but on the small screens make it for full screen... DO NOT disturb ANYTHING else, just give chat interface a new fresh unique look with the matching theme

## Response snapshot

Redesigned only the presentation layer of `ChatWidget.tsx` into a page-style, split-screen overlay:

- Desktop (lg+): centered "page" card (max-w-5xl, 640px tall) split 50/50. Left half is a themed showcase — Plannior brand, animated burgundy/purple glows (float + radial-gradient utilities), animated gradient headline, and three clickable quick-start suggestion prompts (localized EN / Roman Urdu). Right half is the chat.
- Tablet (sm–lg): centered compact card (max-w-md), showcase half hidden, inline suggestions shown in the empty state.
- Mobile (<sm): full-screen chat with a dimmed backdrop only on larger screens.

All business logic preserved verbatim: auth gate, token rotation (`getFreshToken`), conversation restore/`clearStaleConversation`, 401/403 retry, language toggle, error handling. Only change to logic: `handleSendMessage` now accepts an optional `overrideText` (and nullable event) so suggestion chips can send a prompt directly; the form's `onSubmit` still passes a FormEvent unchanged.

Theme matched using existing tokens: `burgundy`, `pink-red`, `font-montserrat`, `font-poppins`, and globals.css utilities (`text-gradient-animated`, `radial-gradient-1`, `float-animation`, `float-slow-animation`).

## Outcome

- ✅ Impact: Chat now has a distinctive split-screen "page" look on desktop and stays full-screen/usable on phones; nothing else touched.
- 🧪 Tests: IDE diagnostics clean on ChatWidget.tsx (repo-wide `tsc` blocked by pre-existing tsconfig `ignoreDeprecations` error, unrelated).
- 📁 Files: 1 modified (ChatWidget.tsx).
- 🔁 Next prompts: optional — tune copy, add more suggestions, or animate the showcase further.
- 🧠 Reflection: Kept the diff to the render tree + one backward-compatible handler signature change to honor "DO NOT disturb ANYTHING else".

## Evaluation notes (flywheel)

- Failure modes observed: none.
- Graders run and results (PASS/FAIL): PASS (file-level TS diagnostics empty).
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): add a subtle typing-dots animation for the loading bubble.
