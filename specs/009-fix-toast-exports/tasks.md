# Tasks: Fix Vercel Deployment Type Errors

**Input**: Design documents from `/specs/009-fix-toast-exports/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, quickstart.md

**Tests**: Build verification via `npx tsc --noEmit` and `npm run build`. No unit tests required — this is a type-level fix.

**Organization**: Single phase with 2 atomic tasks. No foundational setup needed — this is a targeted fix to an existing codebase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1 = Build Fix, US2 = Signup Toast)

---

## Phase 1: Build & Type Correction

**Purpose**: Resolve the missing export mismatch that breaks the Vercel production build.

**Goal**: Zero type errors on `npm run build`.

### Task T001 — Add toast export functions to `components/ui/toast.tsx`

- [x] T001 [US1] Add `showErrorToast` and `showSuccessToast` exports to `phase_02/frontend/components/ui/toast.tsx`

**What to do**:
1. Open `phase_02/frontend/components/ui/toast.tsx`
2. Add `toast` to the existing `sonner` import: change `import { Toaster as Sonner } from "sonner"` to `import { Toaster as Sonner, toast } from "sonner"`
3. After the `Toaster` component, add two exported functions:
   - `export function showSuccessToast(message: string) { toast.success(message); }`
   - `export function showErrorToast(message: string) { toast.error(message); }`
4. Do NOT modify the existing `Toaster` component or its styling

**File**: `phase_02/frontend/components/ui/toast.tsx`
**Lines added**: ~8
**Lines modified**: 1 (import line)
**Lines deleted**: 0

**Acceptance criteria**:
- File contains `export function showErrorToast(message: string)`
- File contains `export function showSuccessToast(message: string)`
- Existing `export function Toaster()` remains unchanged
- `"use client"` directive is preserved at top of file
- No new dependencies added (uses existing `sonner`)

**Satisfies**: FR-001, FR-002, FR-003, FR-005, FR-006, FR-007, FR-008, C-001, C-002

---

### Task T002 — Verify build and audit imports

- [x] T002 [US1+US2] Verify production build passes and audit all toast imports in `phase_02/frontend/`

**What to do**:
1. Run `npx tsc --noEmit` from `phase_02/frontend/` — must exit 0
2. Run `npm run build` from `phase_02/frontend/` — must exit 0
3. Run workspace-wide grep for `showErrorToast` and `showSuccessToast` to confirm all imports resolve:
   - `login-form.tsx` imports from `../ui/toast` — should now resolve
   - `signup-form.tsx` imports from `../ui/toast` — should now resolve
   - No other files import these names
4. Verify `Toaster` imports still resolve:
   - `app/layout.tsx` imports `Toaster` from `../components/ui/toast` — should still work
   - `app/dashboard/layout.tsx` imports `Toaster` from `../../components/ui/toast` — should still work

**Depends on**: T001

**Acceptance criteria**:
- `npx tsc --noEmit` exits with code 0 (zero type errors)
- `npm run build` exits with code 0 (production build succeeds)
- Grep confirms exactly 2 files import `showErrorToast`/`showSuccessToast`: `login-form.tsx` and `signup-form.tsx`
- Grep confirms exactly 2 files import `Toaster`: `app/layout.tsx` and `app/dashboard/layout.tsx`
- No consumer files were modified (imports already point to the correct module)
- Total lines changed across all files is fewer than 20

**Satisfies**: FR-004, SC-001, SC-004, SC-005

---

## Dependencies & Execution Order

### Phase Dependencies

- **T001**: No dependencies — can start immediately
- **T002**: Depends on T001 — verification must run after the fix is applied

### Execution Flow

```
T001 (add exports) → T002 (verify build)
```

No parallel opportunities — T002 validates T001.

---

## Implementation Strategy

### Single Pass

1. Apply T001: Edit `toast.tsx` (~8 lines added)
2. Apply T002: Run build verification
3. If T002 passes: Feature complete, ready for commit
4. If T002 fails: Debug and iterate on T001

### Total Change Budget

- **1 file modified**: `phase_02/frontend/components/ui/toast.tsx`
- **0 files created or deleted**
- **~8 lines added, 1 line modified, 0 lines deleted**
- **0 consumer files changed** (imports already correct after T001)

---

## Notes

- Per plan.md Option A, only `toast.tsx` is modified. The consumer files (`login-form.tsx`, `signup-form.tsx`) already import from the correct path — they just need the exports to exist.
- The `Toaster` component's `toastOptions.style` provides global styling for all toasts, so the new wrapper functions inherit the cinematic dark theme automatically.
- `login-form.tsx` is missing `"use client"` — this is a pre-existing issue out of scope per constraint C-001.
