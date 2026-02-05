# Implementation Plan: 009-bugfix-ui-enhancement

**Branch**: `009-bugfix-ui-enhancement` | **Date**: 2026-02-05 | **Spec**: `specs/009-bugfix-ui-enhancement/spec.md`
**Input**: Feature specification from `/specs/009-bugfix-ui-enhancement/spec.md`

## Summary

Fix three production-blocking bugs (500 on tasks, build-breaking imports, generic error messages), implement real settings persistence, and enhance public-facing pages with glassmorphic UI matching reference.png. The plan is ordered by priority: P1 bug fixes first (unblock deployment), P2 settings (improve UX), P3 UI polish (brand quality).

## Technical Context

**Language/Version**: TypeScript (Next.js 16+), Python 3.11 (FastAPI)
**Primary Dependencies**: Better Auth v1.4.18, Axios, SWR, Framer Motion, Lucide React, Sonner, bcryptjs
**Storage**: Neon Serverless PostgreSQL (existing tables: user, task, session, account)
**Testing**: Manual verification (npx next build for compile, browser for functional)
**Target Platform**: Vercel (frontend), HuggingFace Spaces (backend)
**Project Type**: Web application (monorepo with frontend/ and backend/)
**Constraints**: No new npm dependencies for UI, no database schema changes, no breaking auth handshake

## Constitution Check

- [x] I. Absolute SDD Adherence compliance — spec written before plan
- [x] II. Multi-Agent Orchestration alignment — N/A (single agent)
- [x] III. Security through Isolation verification — task API user_id match preserved
- [x] IV. No Manual Coding enforcement — all changes agent-driven
- [x] V. Monorepo Hygiene (frontend/backend separation) — changes scoped to correct directories
- [x] VI. Aesthetic Excellence — using existing pink-red (#e11d48), deep-black (#0a0a0f) palette
- [x] VII. Stateless Reliability verification — session-based auth via Better Auth preserved
- [x] Auth: Better Auth + bcrypt password verification (recently fixed)
- [x] Tech Stack: Next.js 16+, FastAPI, SQLModel, Neon Serverless PostgreSQL

## Project Structure

### Source Code (files to modify)

```text
backend/
└── src/
    └── api/
        └── tasks.py              # Fix current_user dict access (P1)

frontend/
├── app/
│   ├── page.tsx                  # Landing page UI overhaul (P3)
│   ├── features/page.tsx         # Features page copy + styling (P3)
│   └── dashboard/
│       └── settings/page.tsx     # Real settings persistence (P2)
├── components/
│   ├── auth/
│   │   ├── login-form.tsx        # Fix imports (P1)
│   │   └── signup-form.tsx       # Fix imports (P1)
│   └── ui/
│       └── user-menu.tsx         # Fix imports (P1)
├── lib/
│   └── auth-client.ts            # No changes (preserve handshake)
└── tsconfig.json                 # Add paths alias for @/ (P1)
```

---

## Phase 1: P1 Bug Fixes (Deployment Unblockers)

### 1.1 Fix 500 Error on Task CRUD

**Root Cause** (verified by code reading):
- `backend/src/api/deps.py:49-52` returns a plain dict: `{"id": session_record.userId, "session_id": session_record.id}`
- `backend/src/api/tasks.py:17` accesses `current_user.id` (dot notation)
- Python dicts don't support dot notation → `AttributeError` → 500

**Fix**: Change all `current_user.id` to `current_user["id"]` in `tasks.py`.

**File**: `backend/src/api/tasks.py`
**Lines**: 17, 36, 50, 66, 91 (5 occurrences across 5 route handlers)

```python
# Before (all 5 handlers):
if current_user.id != user_id:

# After:
if current_user["id"] != user_id:
```

**Verification**: Task list loads without 500. Create/edit/delete work.

### 1.2 Fix Build-Breaking Imports in login-form.tsx

**Root Cause** (verified):
- `components/auth/login-form.tsx:4` imports `{ showErrorToast, showSuccessToast }` from `../ui/toast`
- `components/ui/toast.tsx` only exports the `Toaster` component — no `showErrorToast`/`showSuccessToast`
- The toast utility is at `lib/toast.ts` which exports `toast.success()`/`.error()`/`.info()`

**Fix**: Replace import and all usages.

**File**: `frontend/components/auth/login-form.tsx`

```typescript
// Before:
import { showErrorToast, showSuccessToast } from "../ui/toast";
// All calls: showErrorToast("..."), showSuccessToast("...")

// After:
import { toast } from "../../lib/toast";
// All calls: toast.error("..."), toast.success("...")
```

**Specific changes**:
- Line 4: Replace import
- Line 23: `showErrorToast(error.message || "Login failed")` → `toast.error(error.message || "Invalid email or password")`
- Line 25: `showSuccessToast("Welcome back!")` → `toast.success("Welcome back!")`
- Line 29: `showErrorToast("An unexpected error occurred")` → `toast.error("An unexpected error occurred")`

### 1.3 Fix Build-Breaking Imports in signup-form.tsx

**Same root cause as 1.2.**

**File**: `frontend/components/auth/signup-form.tsx`

```typescript
// Before:
import { showErrorToast, showSuccessToast } from "../ui/toast";

// After:
import { toast } from "../../lib/toast";
```

**Specific changes**:
- Line 5: Replace import
- Line 26: `showErrorToast(ctx.error.message || "Signup failed")` → `toast.error(ctx.error.message || "Signup failed")`
- Line 30: `showSuccessToast("Welcome!")` → `toast.success("Welcome!")`

### 1.4 Fix Broken Imports in user-menu.tsx

**Root Cause** (verified):
- `components/ui/user-menu.tsx:3` imports `{ logout } from "@/lib/auth-actions"`
- `components/ui/user-menu.tsx:4` imports `{ useAuth } from "@/hooks/use-auth"`
- `@/lib/auth-actions` → `frontend/lib/auth-actions.ts` EXISTS (exports `logout`)
- `@/hooks/use-auth` → maps to `frontend/app/hooks/use-auth.ts` EXISTS (exports `useAuth`)
- BUT `tsconfig.json` has NO `paths` or `baseUrl` config → the `@/` alias doesn't resolve

**Fix**: Add `paths` alias to `tsconfig.json`.

**File**: `frontend/tsconfig.json`

```json
{
  "compilerOptions": {
    // ... existing options ...
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

This resolves:
- `@/lib/auth-actions` → `./lib/auth-actions.ts`
- `@/hooks/use-auth` → `./hooks/use-auth.ts` — BUT `use-auth.ts` is at `app/hooks/use-auth.ts`, not `hooks/use-auth.ts`.

**Additional fix for user-menu.tsx**: Change the import to the correct relative path.

**File**: `frontend/components/ui/user-menu.tsx`

```typescript
// Before:
import { logout } from "@/lib/auth-actions";
import { useAuth } from "@/hooks/use-auth";

// After:
import { logout } from "../../lib/auth-actions";
import { useAuth } from "../../app/hooks/use-auth";
```

**Decision**: Use relative imports instead of adding `@/` alias (simpler, no tsconfig change needed, consistent with how all other components already import). This avoids introducing a path aliasing pattern that's inconsistent with the rest of the codebase.

### 1.5 Improve Auth Error Message Surfacing

**Current State** (verified):
- `app/auth/signin/page.tsx:40` already surfaces `authError.message || 'Invalid email or password'` via `toast.error()` — this is CORRECT
- `app/auth/signup/page.tsx:42` already surfaces `authError.message || 'Failed to create account'` via `toast.error()` — this is CORRECT
- The page-level auth forms (used in production) already handle errors well
- The component-level forms (`components/auth/login-form.tsx`, `signup-form.tsx`) are legacy and use the wrong toast imports

**Plan**: The page-level forms already have correct error handling. Fixing the component-level forms (1.2 and 1.3 above) will align them. No additional error handling changes needed on the page-level forms since they already extract `authError.message` correctly.

**Enhancement for network errors** in page-level forms:

**File**: `frontend/app/auth/signin/page.tsx` (line 49-51)

```typescript
// Before:
} catch (err) {
  toast.error('An unexpected error occurred');

// After:
} catch (err: any) {
  const message = err?.response?.data?.detail
    || (err?.request ? 'Network error. Please check your connection.'
    : 'An unexpected error occurred');
  toast.error(message);
```

Same pattern for `signup/page.tsx` catch block.

### 1.6 Verification Gate

After completing 1.1–1.5:
- Run `npx next build` — must exit 0
- If build fails, fix before proceeding to P2

---

## Phase 2: P2 Settings Persistence

### 2.1 Implement Real Settings Save

**Current State** (verified at `settings/page.tsx:23-31`):
- `handleSave` uses `setTimeout` simulation — no API call
- Better Auth's client provides `authClient.updateUser({ name })` for updating the user record

**Fix**: Replace simulated save with real `authClient.updateUser()`.

**File**: `frontend/app/dashboard/settings/page.tsx`

```typescript
// Before:
const handleSave = async () => {
  setIsSaving(true);
  setTimeout(() => {
    toast.success("Settings saved successfully!");
    setIsSaving(false);
  }, 1000);
};

// After:
const handleSave = async () => {
  setIsSaving(true);
  try {
    await authClient.updateUser({ name });
    // Refresh session to reflect changes in sidebar
    const { data } = await authClient.getSession();
    setSession(data);
    toast.success("Profile updated successfully!");
  } catch (error: any) {
    toast.error(error?.message || "Failed to update profile");
  } finally {
    setIsSaving(false);
  }
};
```

**Key detail**: After `updateUser`, we re-fetch the session so the local `session` state updates. The sidebar (`components/layout/sidebar.tsx`) fetches session independently on mount, so a page refresh will also pick up the new name. For same-page reactivity, the `setSession(data)` call updates the Settings page immediately.

### 2.2 Keep Avatar as "Coming Soon"

The avatar upload requires image storage infrastructure (S3/Cloudinary) which is out of scope. The current `handleAvatarChange` already shows a "coming soon" toast — keep it as-is. No changes needed.

### 2.3 Verification Gate

- Save name on Settings → toast confirms → refresh page → name persists
- Sidebar shows updated name after navigating away and back

---

## Phase 3: P3 UI/UX Enhancement

### 3.1 Design System (No Changes Needed)

**Existing utilities** (verified in `globals.css` and `tailwind.config.ts`):
- Colors: `pink-red` (#e11d48), `deep-black` (#0a0a0f), `purple-600` (Tailwind built-in)
- Utilities: `.glassmorphic`, `.glow-effect`, `.glow-text`, `.radial-gradient-1`, `.radial-gradient-2`
- No new Tailwind config or CSS utilities needed

### 3.2 Landing Page Enhancement

**File**: `frontend/app/page.tsx`

**Changes** (matching reference.png structure):

1. **Navbar**: Already glassmorphic with Login/Signup buttons. Add centered nav links (Features, About, Pricing) matching reference. Ensure "Sign Up" is pill-shaped with accent fill, "Sign In" is text-only.

2. **Hero section**:
   - Rewrite heading: "Organize your life with **cinematic** precision" (accent word = "cinematic" in pink-red)
   - Rewrite subtitle: Professional Plannoir-specific copy about AI-native task management
   - CTA button: "Start Organizing Free" with accent gradient
   - Add subtext: "No credit card required"

3. **Trust section** (new): Add a "TRUSTED BY" section with placeholder brand-style text logos (Plannoir is early-stage, so use generic productivity tool endorsement language).

4. **Features grid**: Keep existing 6 cards. Update descriptions to be Plannoir-specific (not generic). Rewrite copy for each:
   - "Smart Task Management" → professional description
   - "Analytics Dashboard" → professional description
   - etc.

5. **About section** (new `#about` anchor): Add section between features and CTA with Plannoir's mission/value proposition.

6. **Pricing section** (new `#pricing` anchor): Add 2-tier pricing (Free / Pro) with glassmorphic cards, feature lists, CTA buttons.

7. **CTA section**: Keep existing, rewrite copy to be more premium.

8. **Footer**: Keep existing, minimal.

**Styling approach**: All new sections use existing `.glassmorphic`, `.glow-effect`, `border-pink-red/20`, and Framer Motion animations consistent with the current codebase pattern.

### 3.3 Features Page Enhancement

**File**: `frontend/app/features/page.tsx`

**Changes**:
1. Rewrite all 4 feature descriptions with Plannoir-specific professional copy
2. Rewrite 3 premium feature descriptions
3. Add navbar at top (currently no nav on this page — standalone page without shared nav)
4. Ensure consistent glassmorphic styling

### 3.4 Landing Page Nav Links (About/Pricing)

The landing page navbar currently links to `#features`, `#about`, `#pricing` as anchor sections. Steps 3.2.5 and 3.2.6 above add the actual `#about` and `#pricing` sections so these links resolve.

### 3.5 Verification Gate

- Landing page renders with all sections (hero, trust, features, about, pricing, CTA)
- Features page shows updated copy
- Mobile viewport (375px) has no horizontal overflow
- `npx next build` still passes

---

## Implementation Order (Dependency-Aware)

```
Phase 1 (P1 — do first, sequential):
  1.1 Fix tasks.py dict access      → backend change
  1.2 Fix login-form.tsx imports     → frontend change
  1.3 Fix signup-form.tsx imports    → frontend change
  1.4 Fix user-menu.tsx imports      → frontend change
  1.5 Improve auth error messages    → frontend change
  1.6 GATE: npx next build passes   → verification

Phase 2 (P2 — after build passes):
  2.1 Settings real save             → frontend change
  2.3 GATE: settings persistence     → verification

Phase 3 (P3 — after P1+P2 stable):
  3.2 Landing page enhancement       → frontend change
  3.3 Features page enhancement      → frontend change
  3.5 GATE: visual + build check     → verification
```

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `authClient.updateUser()` API differs from expected signature | Medium | P2 blocked | Check Better Auth docs; fallback to direct API call to `/api/auth/update-user` |
| Landing page rewrites break mobile layout | Low | P3 blocked | Test at 375px viewport after each section |
| `current_user["id"]` fix reveals deeper issue (e.g., token not being sent) | Low | P1 blocked | Check axios interceptor sends Bearer token; test with curl |

## Files Modified (Complete List)

| File | Phase | Change |
|------|-------|--------|
| `backend/src/api/tasks.py` | 1.1 | `current_user.id` → `current_user["id"]` (5 occurrences) |
| `frontend/components/auth/login-form.tsx` | 1.2 | Fix toast imports + error message wording |
| `frontend/components/auth/signup-form.tsx` | 1.3 | Fix toast imports |
| `frontend/components/ui/user-menu.tsx` | 1.4 | Fix `@/` imports to relative paths |
| `frontend/app/auth/signin/page.tsx` | 1.5 | Add network error detection in catch block |
| `frontend/app/auth/signup/page.tsx` | 1.5 | Add network error detection in catch block |
| `frontend/app/dashboard/settings/page.tsx` | 2.1 | Replace setTimeout with `authClient.updateUser()` |
| `frontend/app/page.tsx` | 3.2 | Full landing page content + layout rewrite |
| `frontend/app/features/page.tsx` | 3.3 | Professional copy + consistent styling |

## Files NOT Modified (Invariants)

| File | Reason |
|------|--------|
| `frontend/lib/auth-client.ts` | Auth handshake must not break |
| `frontend/lib/auth.ts` | bcrypt verification must not break |
| `frontend/lib/api.ts` | Axios config recently fixed |
| `backend/src/api/deps.py` | Returns dict — the consumer (tasks.py) must adapt |
| `backend/src/main.py` | CORS config recently fixed |
| `frontend/app/globals.css` | Existing utilities sufficient |
| `frontend/tailwind.config.ts` | Existing colors sufficient |
| Database schema | No migrations |
