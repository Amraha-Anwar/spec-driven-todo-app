# Implementation Plan: Fix Vercel Deployment Type Errors

**Branch**: `009-fix-toast-exports` | **Date**: 2026-02-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-fix-toast-exports/spec.md`

## Summary

Resolve a build-breaking type error caused by two auth form components importing non-existent named exports (`showErrorToast`, `showSuccessToast`) from `components/ui/toast.tsx`. The fix adds two thin wrapper functions to the existing `components/ui/toast.tsx` that delegate to `sonner` directly, matching the signatures the consumers already expect. No UI, auth, or backend logic changes required.

## Technical Context

**Language/Version**: TypeScript 5.3+ / Next.js 16+
**Primary Dependencies**: sonner ^2.0.7 (already installed, no new deps)
**Storage**: N/A (no data changes)
**Testing**: `npx tsc --noEmit` for type checking, `npm run build` for production build verification
**Target Platform**: Vercel (Node.js serverless)
**Project Type**: Web (frontend-only change within `phase_02/frontend/`)
**Performance Goals**: N/A (no runtime change — wrapper functions are trivial delegations)
**Constraints**: <20 lines changed total; zero visual/logic changes
**Scale/Scope**: 1 file modified, 0 files created, 0 files deleted

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Absolute SDD Adherence | PASS | Spec created and approved before planning |
| II. Multi-Agent Orchestration | PASS | Frontend-only fix, handled by frontend agent domain |
| III. Security through Isolation | PASS | No auth logic touched; JWT flow unchanged |
| IV. No Manual Coding | PASS | All changes generated through SDD pipeline |
| V. Monorepo Hygiene | PASS | Change scoped entirely to `/frontend/components/ui/` |
| VI. Aesthetic Excellence | PASS | No visual changes; existing cinematic toast styling preserved |
| VII. Stateless Reliability | PASS | No backend changes; stateless JWT verification untouched |

**Gate Result**: ALL PASS. No violations to justify.

## Root Cause Analysis

The codebase has two toast-related modules:

1. **`components/ui/toast.tsx`** — Exports `Toaster` (the Sonner provider component). Used by `app/layout.tsx` and `app/dashboard/layout.tsx`.

2. **`lib/toast.ts`** — Exports `toast` object with `.success()`, `.error()`, `.info()` methods using cinematic styling. Used by `app/auth/signin/page.tsx`, `app/auth/signup/page.tsx`, `components/tasks/*.tsx`, `app/dashboard/settings/page.tsx`.

3. **`components/auth/login-form.tsx`** and **`components/auth/signup-form.tsx`** — Import `{ showErrorToast, showSuccessToast }` from `../ui/toast`. These named exports **do not exist** in `components/ui/toast.tsx`, causing the TypeScript compilation error.

### Consumer Import Map

| File | Imports | From | Status |
|------|---------|------|--------|
| `app/layout.tsx` | `Toaster` | `components/ui/toast` | OK |
| `app/dashboard/layout.tsx` | `Toaster` | `components/ui/toast` | OK |
| `app/auth/signin/page.tsx` | `toast` | `lib/toast` | OK |
| `app/auth/signup/page.tsx` | `toast` | `lib/toast` | OK |
| `components/tasks/add-task-form-advanced.tsx` | `toast` | `lib/toast` | OK |
| `components/tasks/task-card.tsx` | `toast` | `lib/toast` | OK |
| `components/tasks/task-edit-modal.tsx` | `toast` | `lib/toast` | OK |
| `app/dashboard/settings/page.tsx` | `toast` | `lib/toast` | OK |
| **`components/auth/login-form.tsx`** | **`showErrorToast, showSuccessToast`** | **`../ui/toast`** | **BROKEN** |
| **`components/auth/signup-form.tsx`** | **`showErrorToast, showSuccessToast`** | **`../ui/toast`** | **BROKEN** |

## Design Decision: Fix Strategy

### Option A: Add exports to `components/ui/toast.tsx` (SELECTED)

Add `showErrorToast` and `showSuccessToast` functions to `components/ui/toast.tsx` that call `sonner`'s `toast.error()` and `toast.success()` directly. This satisfies the existing import paths without touching consumer files.

**Pros**:
- Only 1 file modified
- Consumers import from the same module as `Toaster` — logically coherent for a "toast" module
- Future components can import either `Toaster` or `showErrorToast`/`showSuccessToast` from one place

**Cons**:
- Slight duplication with `lib/toast.ts` styling (but the consumers don't use `lib/toast.ts` styling)

### Option B: Change import paths in consumers to use `lib/toast`

Update `login-form.tsx` and `signup-form.tsx` to import `{ toast }` from `../../lib/toast` and change call sites to `toast.error(...)` / `toast.success(...)`.

**Pros**:
- No new exports needed
- Reuses existing `lib/toast.ts` with cinematic styling

**Cons**:
- 2 files modified instead of 1
- Changes call-site patterns (more invasive)
- `login-form.tsx` is missing `"use client"` directive — additional fix needed

### Decision: Option A

Option A is the smallest diff (1 file, ~8 lines added). It matches the existing import expectations exactly. The `sonner` toast functions use default styling which is consistent with the `Toaster` component's `toastOptions` already configured in the same file.

## Project Structure

### Documentation (this feature)

```text
specs/009-fix-toast-exports/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── quickstart.md        # Phase 1 output
```

### Source Code (affected files)

```text
phase_02/frontend/
├── components/
│   ├── ui/
│   │   └── toast.tsx          # MODIFY: Add showErrorToast, showSuccessToast exports
│   └── auth/
│       ├── login-form.tsx     # NO CHANGE (imports already correct after fix)
│       └── signup-form.tsx    # NO CHANGE (imports already correct after fix)
├── lib/
│   └── toast.ts               # NO CHANGE (unrelated consumers use this)
└── app/
    └── layout.tsx             # NO CHANGE (uses Toaster, unaffected)
```

**Structure Decision**: No structural changes. Single file modification within existing `frontend/components/ui/` directory.

## Implementation Steps

### Step 1: Add named exports to `components/ui/toast.tsx`

Add `showErrorToast(message: string)` and `showSuccessToast(message: string)` to the existing file, importing `toast` from `sonner` and delegating to `toast.error()` and `toast.success()`.

**File**: `phase_02/frontend/components/ui/toast.tsx`
**Change**: Add import of `toast` from `sonner` alongside existing `Toaster as Sonner` import, then add two exported functions after the `Toaster` component.

**Lines added**: ~8
**Lines modified**: 1 (import line)
**Lines deleted**: 0

### Step 2: Verify build

Run `npx tsc --noEmit` from `phase_02/frontend/` to confirm zero type errors, then `npm run build` to confirm production build succeeds.

## Verification Plan

1. **Type check**: `cd phase_02/frontend && npx tsc --noEmit` — must exit 0
2. **Production build**: `cd phase_02/frontend && npm run build` — must exit 0
3. **Grep audit**: Verify no remaining references to `showErrorToast` or `showSuccessToast` that import from anywhere other than `../ui/toast` or `components/ui/toast`
4. **No-regression**: Confirm `Toaster` export still works (used by `app/layout.tsx` and `app/dashboard/layout.tsx`)

## Complexity Tracking

No constitution violations. No complexity justification needed.

## Risks

- **Low**: The `sonner` `toast.error()` and `toast.success()` functions called from the new exports use default styling rather than the cinematic styling in `lib/toast.ts`. This is acceptable because the `Toaster` component in the same file already configures global toast options (`toastOptions.style`) that apply to all toasts.
- **Low**: If `login-form.tsx` is rendered as a server component (missing `"use client"`), it will fail at runtime. However, this is a pre-existing issue unrelated to the toast export fix and is out of scope per constraint C-001.
