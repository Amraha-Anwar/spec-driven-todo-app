# Research: Fix Vercel Deployment Type Errors

**Feature**: 009-fix-toast-exports
**Date**: 2026-02-04

## Research Task 1: Identify exact export mismatch

**Question**: What do `components/ui/toast.tsx` and `lib/toast.ts` export, and what do the broken consumers expect?

**Findings**:

| Module | Exports | Type |
|--------|---------|------|
| `components/ui/toast.tsx` | `Toaster` | React component (Sonner wrapper) |
| `lib/toast.ts` | `toast` (object with `.success`, `.error`, `.info` methods) | Utility object |

| Consumer | Expected Imports | From |
|----------|-----------------|------|
| `login-form.tsx` | `showErrorToast`, `showSuccessToast` | `../ui/toast` |
| `signup-form.tsx` | `showErrorToast`, `showSuccessToast` | `../ui/toast` |

**Decision**: The names `showErrorToast` and `showSuccessToast` never existed in either module. They were likely intended during development but the corresponding exports were never created.

**Rationale**: Both consumers consistently import from `../ui/toast` (not `../../lib/toast`), indicating the developer intended these functions to live alongside the `Toaster` component.

**Alternatives considered**:
- Changing consumer imports to point to `lib/toast.ts`: Rejected — more files modified, changes call patterns
- Creating a new shared module: Rejected — unnecessary complexity for 2 functions

## Research Task 2: Sonner API compatibility

**Question**: Does `sonner` expose `toast.error()` and `toast.success()` that can be wrapped?

**Findings**: Yes. `sonner` ^2.0.7 exports `toast` as a function with methods:
- `toast.success(message, options?)` — Shows a success-styled toast
- `toast.error(message, options?)` — Shows an error-styled toast
- `toast.info(message, options?)` — Shows an info-styled toast

The `Toaster` component's `toastOptions.style` already configures global styles for all toasts. Any call to `toast.error()` or `toast.success()` will inherit these global styles.

**Decision**: Wrap `toast.error` and `toast.success` as `showErrorToast` and `showSuccessToast` in `components/ui/toast.tsx`.

**Rationale**: Minimal code, no new dependencies, leverages existing global styling from the `Toaster` component.

## Research Task 3: Build pipeline verification

**Question**: What build commands validate the fix?

**Findings**:
- `npx tsc --noEmit` — TypeScript type-checking without emitting files
- `npm run build` — Full Next.js production build (maps to `next build`)
- Both commands must exit with code 0 for Vercel deployment to succeed

**Decision**: Use both commands sequentially as the verification plan.
