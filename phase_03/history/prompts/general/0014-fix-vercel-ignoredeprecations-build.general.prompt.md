---
id: 0014
title: Fix Vercel ignoreDeprecations build error
stage: general
date: 2026-06-23
surface: agent
model: claude-opus-4-8[1m]
feature: none
branch: main
user: Amraha Anwar
command: general
labels: ["vercel", "typescript", "build-fix", "tsconfig"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - phase_03/frontend/tsconfig.json
tests:
 - npx tsc --noEmit (exit 0)
---

## Prompt

solve these vercel build error "19:34:19.576 
  npx update-browserslist-db@latest
19:34:19.576 
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
19:34:31.203 
✓ Compiled successfully in 22.9s
19:34:31.208 
  Running TypeScript ...
19:34:40.169 
Failed to compile.
19:34:40.170 
19:34:40.170 
Type error: Invalid value for '--ignoreDeprecations'.
19:34:40.170 
19:34:40.218 
Next.js build worker exited with code: 1 and signal: null
19:34:40.289 
Error: Command "npm run build" exited with 1
"

## Response snapshot

Root cause: `phase_03/frontend/tsconfig.json` set `"ignoreDeprecations": "6.0"`, a value only recognized by TypeScript 6.0+. The project ships TypeScript 5.9.3 (`"typescript": "^5.3.3"`), and TS 5.x only accepts `"5.0"`, so the compiler rejected the option during Vercel's "Running TypeScript" step.

Fix: changed the value to `"ignoreDeprecations": "5.0"`. Verified locally with `npx tsc --noEmit` → exit 0. Commit the tsconfig change and redeploy.

## Outcome

- ✅ Impact: Vercel build passes the TypeScript stage again.
- 🧪 Tests: `npx tsc --noEmit` exits 0.
- 📁 Files: phase_03/frontend/tsconfig.json (one-line value change).
- 🔁 Next prompts: Commit and redeploy on Vercel.
- 🧠 Reflection: tsconfig option values are version-gated; align them with the installed TS major version.

## Evaluation notes (flywheel)

- Failure modes observed: tsconfig option value mismatched installed TypeScript major version.
- Graders run and results (PASS/FAIL): PASS (tsc --noEmit exit 0).
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Pin TypeScript to an exact version to avoid drift between local and Vercel.
