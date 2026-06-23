---
id: 0009
title: Chat Sidebar Trigger Split Tasks
stage: general
date: 2026-06-23
surface: agent
model: claude-opus-4-8[1m]
feature: none
branch: main
user: Amraha Anwar
command: general
labels: ["frontend", "ui", "chat", "sidebar", "tasks"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - frontend/components/chat/ChatWidget.tsx
 - frontend/components/layout/sidebar.tsx
 - frontend/app/layout.tsx
tests:
 - none (visual/UI change; IDE diagnostics clean on all 3 changed files)
---

## Prompt

chatwindow open circle , replace that with something else, I don't want that floating button their.. move it to the sidebar  or something else, and don't make the chat window page of full screen, cut it down in half on right side or left side of the screen and on the other side add another feature, like a list of added tasks or soemthing else.. And match the chat interface theme with the theme of the rest of the site

## Response snapshot

Replaced the floating circle launcher and reworked the chat into a split-screen workspace.

1. Trigger moved to the sidebar: removed the floating button entirely. ChatWidget now opens via a global `plannior:open-chat` window event. Added a gradient "Chat Assistant" button (Sparkles icon) to both the desktop sidebar (after nav links, collapses to icon-only in slim mode) and the mobile drawer. Exported `OPEN_CHAT_EVENT` from ChatWidget and imported it in sidebar; signed-out clicks route to /auth/signin.

2. Split-screen (not full-screen): the open chat is a centered max-w-5xl card filling ~88vh. Left half = live task list driven by the existing `useTasks()` hook (pending tasks with priority chips + a completed/strikethrough section, empty + loading states); right half = the chat. After every assistant reply `mutateTasks()` refreshes the list so AI-added/completed tasks appear immediately.

3. Mobile: full-screen with a Chat | Tasks tab switch (the task half is hidden on phones and shown via the tab).

4. Theme matched to the rest of the site: swapped the muted `burgundy` palette for the site's rose tokens (#9f1239 → #e11d48 gradients, #f43f5e accents, rose-tinted borders/glows), Poppins, glassmorphic #080305 surfaces, and the top hairline accent used on the auth/tasks cards.

5. Deduped the mount: removed the second `<ChatWidget />` from the root `app/layout.tsx` (it stays in the dashboard layout where the sidebar trigger lives) so only one overlay/event-listener exists on the dashboard.

`handleSendMessage` keeps its backward-compatible `(e | null, overrideText?)` signature for suggestion chips. All auth/token-rotation/conversation-restore/401-403 retry logic preserved verbatim.

## Outcome

- ✅ Impact: No floating button; chat launches from the sidebar; opens as a half-screen split with a live task list beside it; theme now matches the site.
- 🧪 Tests: IDE diagnostics empty on ChatWidget.tsx and app/layout.tsx. sidebar.tsx shows only two pre-existing unused-symbol hints (`Image`, `isMobile`) confirmed present in HEAD — left untouched per smallest-diff rule.
- 📁 Files: 3 modified.
- 🔁 Next prompts: optional — make task rows clickable to toggle complete, or persist last-open language.
- 🧠 Reflection: Used the existing `useTasks` SWR hook so the side panel is a real feature and stays in sync via `mutate`, avoiding a parallel data path.

## Evaluation notes (flywheel)

- Failure modes observed: a stale "Cannot find name 'ChatWidget'" diagnostic on layout.tsx that the file content disproved (line was already `{children}`).
- Graders run and results (PASS/FAIL): PASS (changed-file diagnostics clean).
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): allow toggling a task complete directly from the side panel.
