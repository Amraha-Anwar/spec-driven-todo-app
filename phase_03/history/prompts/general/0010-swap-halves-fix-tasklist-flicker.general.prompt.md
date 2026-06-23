---
id: 0010
title: Swap Halves Fix Tasklist Flicker
stage: general
date: 2026-06-23
surface: agent
model: claude-opus-4-8[1m]
feature: none
branch: main
user: Amraha Anwar
command: general
labels: ["frontend", "ui", "chat", "bugfix", "react"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - frontend/components/chat/ChatWidget.tsx
tests:
 - none (visual/UI change; IDE diagnostics clean on ChatWidget.tsx)
---

## Prompt

move the chat interface to left and task list to right.. Also the task list part on the chat interface is glitching, fix that

## Response snapshot

Two fixes in ChatWidget.tsx:

1. Fixed the task-list glitch (root cause): `TaskPanel` was declared as a component *inside* `ChatWidget`, so every parent re-render (every keystroke, loading toggle, etc.) created a brand-new component type. React unmounted/remounted the entire task subtree each render, replaying the framer-motion enter animations — that was the flicker. Converted it from `const TaskPanel = () => (...)` to a plain JSX element `const taskPanel = (...)` and render `{taskPanel}`, so React reconciles it in place instead of remounting.

2. Swapped the halves: chat is now the LEFT half, the live task list is the RIGHT half (border moved to lg:border-r on the chat side; ambient glows mirrored to the right edge).

3. Mobile bug caught while there: the Chat|Tasks tab switch was nested inside the chat half, so switching to "Tasks" hid the tabs with no way back. Lifted the tab bar to the card level (card is now flex-col on mobile, flex-row on lg), made both halves flex-1 min-h-0 so the visible one fills the card, and removed the now-redundant `(mobileView as string)` cast.

All chat/auth/conversation logic untouched.

## Outcome

- ✅ Impact: Chat on the left, tasks on the right; task list no longer flickers; mobile tab switch always reachable.
- 🧪 Tests: IDE diagnostics empty on ChatWidget.tsx.
- 📁 Files: 1 modified.
- 🔁 Next prompts: optional — animate the half-swap, or make task rows toggle complete.
- 🧠 Reflection: Nested component definitions are a classic remount/flicker trap; hoisting to a plain element (or a module-level component) is the fix.

## Evaluation notes (flywheel)

- Failure modes observed: nested-component remount causing animation replay (the reported glitch).
- Graders run and results (PASS/FAIL): PASS (changed-file diagnostics clean).
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): extract taskPanel to a memoized module-level component for extra safety if it grows.
