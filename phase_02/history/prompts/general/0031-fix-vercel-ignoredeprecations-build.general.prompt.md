---
id: 0031
title: Fix Vercel ignoreDeprecations build error
stage: general
date: 2026-06-23
surface: agent
model: claude-opus-4-8
feature: none
branch: main
user: Amraha Anwar
command: none
labels: ["vercel", "typescript", "build-fix", "tsconfig"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - phase_02/frontend/tsconfig.json
tests:
 - npx tsc --noEmit (phase_02/frontend) → exit 0
---

## Prompt

fix these vercel deplyment errors Browserslist: browsers data (caniuse-lite) is 6 months old. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
✓ Compiled successfully in 18.7s
  Running TypeScript ...
Failed to compile.
Type error: Invalid value for '--ignoreDeprecations'.
Next.js build worker exited with code: 1 and signal: null
Error: Command "npm run build" exited with 1

## Response snapshot

Root cause: `phase_02/frontend/tsconfig.json` set `"ignoreDeprecations": "6.0"`, a value only recognized by TypeScript 6.0+. The project ships TypeScript 5.x (`"typescript": "^5.3.3"`), and TS 5.x only accepts `"5.0"`, so the compiler rejected the option during Vercel's "Running TypeScript" step. (phase_03 had already been fixed identically in a prior commit.)

Fix: changed the value to `"ignoreDeprecations": "5.0"`. Verified locally with `npx tsc --noEmit` → exit 0.

The Browserslist "caniuse-lite is 6 months old" message is a non-fatal warning, not the cause of the failed build, so no change was required for it; optionally run `npx update-browserslist-db@latest` to silence it.

## Outcome

- ✅ Impact: Unblocks Vercel build for phase_02 frontend (TypeScript compile no longer fails on invalid compiler option).
- 🧪 Tests: `npx tsc --noEmit` in phase_02/frontend → exit 0.
- 📁 Files: phase_02/frontend/tsconfig.json (1 line changed).
- 🔁 Next prompts: Commit and redeploy; optionally update browserslist DB.
- 🧠 Reflection: Same regression already fixed in phase_03; phase_02 was missed. Worth aligning tsconfig values across phases.

## Evaluation notes (flywheel)

- Failure modes observed: `ignoreDeprecations` value tied to TS major version; "6.0" requires TS 6.x.
- Graders run and results (PASS/FAIL): PASS (tsc --noEmit exit 0).
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none
