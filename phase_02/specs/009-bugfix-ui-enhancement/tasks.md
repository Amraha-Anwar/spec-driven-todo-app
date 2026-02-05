# Tasks: 009 Bugfix & UI Enhancement Sprint

**Input**: Design documents from `/specs/009-bugfix-ui-enhancement/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Organization**: Tasks grouped by user story and ordered by dependency. No setup or foundational phase needed — project infrastructure already exists.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1=Task CRUD, US2=Error Messages, US3=Settings, US4=Build Fix, US5=Landing UI, US6=Features UI)

---

## Phase 1: US1 — Fix 500 Error on Task CRUD (Priority: P1)

**Goal**: Task list loads, create/edit/delete/toggle all return 2xx instead of 500.

**Root Cause**: `deps.py` returns `dict`, but `tasks.py` uses dot-notation `current_user.id` → `AttributeError`.

**Independent Test**: Sign in → navigate to `/dashboard` → tasks load without 500. Create a task → appears in list.

### Implementation

- [x] T001 [US1] Fix dict access in `backend/src/api/tasks.py` — change all 5 occurrences of `current_user.id` to `current_user["id"]`

**Exact changes** (file: `backend/src/api/tasks.py`):
```
Line 17:  current_user.id  →  current_user["id"]
Line 36:  current_user.id  →  current_user["id"]
Line 50:  current_user.id  →  current_user["id"]
Line 66:  current_user.id  →  current_user["id"]
Line 91:  current_user.id  →  current_user["id"]
```

**Acceptance**:
- `GET /api/{userId}/tasks` returns 200 with task array
- `POST /api/{userId}/tasks` returns 201 with created task
- `PATCH /api/{userId}/tasks/{taskId}` returns 200
- `DELETE /api/{userId}/tasks/{taskId}` returns 204
- Mismatched `userId` returns 403 (not 500)

**Checkpoint**: Task CRUD works end-to-end. Dashboard is usable.

---

## Phase 2: US4 — Fix Build-Breaking Imports (Priority: P1)

**Goal**: `npx next build` completes with exit code 0.

**Root Cause**: `login-form.tsx` and `signup-form.tsx` import non-existent `showErrorToast`/`showSuccessToast` from `../ui/toast`. `user-menu.tsx` uses `@/` path alias that isn't configured in tsconfig.

**Independent Test**: Run `npx next build` — exits 0.

### Implementation

- [x] T002 [P] [US4] Fix imports in `frontend/components/auth/login-form.tsx`

**Exact changes**:
```
Line 4:  import { showErrorToast, showSuccessToast } from "../ui/toast";
      →  import { toast } from "../../lib/toast";

Line 23: showErrorToast(error.message || "Login failed")
      →  toast.error(error.message || "Invalid email or password")

Line 25: showSuccessToast("Welcome back!")
      →  toast.success("Welcome back!")

Line 29: showErrorToast("An unexpected error occurred")
      →  toast.error("An unexpected error occurred")
```

- [x] T003 [P] [US4] Fix imports in `frontend/components/auth/signup-form.tsx`

**Exact changes**:
```
Line 5:  import { showErrorToast, showSuccessToast } from "../ui/toast";
      →  import { toast } from "../../lib/toast";

Line 26: showErrorToast(ctx.error.message || "Signup failed")
      →  toast.error(ctx.error.message || "Signup failed")

Line 30: showSuccessToast("Welcome!")
      →  toast.success("Welcome!")
```

- [x] T004 [P] [US4] Fix imports in `frontend/components/ui/user-menu.tsx`

**Exact changes**:
```
Line 3:  import { logout } from "@/lib/auth-actions";
      →  import { logout } from "../../lib/auth-actions";

Line 4:  import { useAuth } from "@/hooks/use-auth";
      →  import { useAuth } from "../../app/hooks/use-auth";
```

**Design decision**: Use relative imports (consistent with all other components) instead of adding `@/` path alias to tsconfig.

- [x] T005 [US4] **GATE**: Run `npx next build` — must exit 0

**Acceptance**:
- Build compiles without TypeScript errors
- All 3 component files resolve their imports correctly

**Checkpoint**: Deployment unblocked. Production build succeeds.

---

## Phase 3: US2 — Meaningful Auth Error Messages (Priority: P1)

**Goal**: Auth errors surface specific backend messages ("User already exists", "Invalid email or password") and detect network failures.

**Depends on**: T005 (build must pass first to verify changes)

**Independent Test**: Sign up with existing email → see "User already exists" toast. Enter wrong password → see "Invalid email or password" toast. Disconnect network → see network error message.

### Implementation

- [x] T006 [P] [US2] Add network error detection to `frontend/app/auth/signin/page.tsx`

**Exact changes** (line 49-51):
```typescript
// Before:
} catch (err) {
  toast.error('An unexpected error occurred');
  console.error(err);

// After:
} catch (err: any) {
  const message = err?.response?.data?.detail
    || (err?.request ? 'Network error. Please check your connection.' : 'An unexpected error occurred');
  toast.error(message);
  console.error(err);
```

- [x] T007 [P] [US2] Add network error detection to `frontend/app/auth/signup/page.tsx`

**Exact changes** (line 48-50):
```typescript
// Before:
} catch (err) {
  toast.error('An unexpected error occurred');
  console.error(err);

// After:
} catch (err: any) {
  const message = err?.response?.data?.detail
    || (err?.request ? 'Network error. Please check your connection.' : 'An unexpected error occurred');
  toast.error(message);
  console.error(err);
```

**Note**: The `authError.message` handling at lines 40-42 (signin) and 41-43 (signup) already correctly surfaces Better Auth errors. These catch blocks only fire for unexpected/network errors.

**Acceptance**:
- Duplicate signup → toast shows "User already exists" (from Better Auth error passthrough)
- Wrong credentials → toast shows "Invalid email or password"
- Network disconnect → toast shows "Network error. Please check your connection."
- Empty fields → HTML5 `required` prevents submission

**Checkpoint**: Auth UX is professional with actionable error messages.

---

## Phase 4: US3 — Settings Page Persistence (Priority: P2)

**Goal**: Name changes on Settings page persist to database and reflect in sidebar.

**Depends on**: T005 (build must pass)

**Independent Test**: Change name → click Save → refresh page → name persists in both Settings and Sidebar.

### Implementation

- [x] T008 [US3] Replace simulated save with real `authClient.updateUser()` in `frontend/app/dashboard/settings/page.tsx`

**Exact changes** (lines 23-31):
```typescript
// Before:
const handleSave = async () => {
  setIsSaving(true);
  // Simulate API call (implement actual API call to update user profile)
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

**Key behaviors**:
- `authClient.updateUser({ name })` updates the user record in the database via Better Auth
- `authClient.getSession()` re-fetches session to update local state (name shown on page)
- Sidebar reads session on mount — navigating away and back, or refreshing, picks up the new name
- Avatar upload stays as "coming soon" (no change to `handleAvatarChange`)

**Acceptance**:
- Change name → Save → success toast appears
- Refresh page → new name shown in input field
- Navigate to Dashboard → sidebar shows updated name
- Network error during save → error toast with message

**Checkpoint**: Settings page is functional (except avatar upload which stays "coming soon").

---

## Phase 5: US5 — Landing Page Glassmorphic Enhancement (Priority: P3)

**Goal**: Landing page matches reference.png layout and quality with Plannoir-branded professional copy.

**Depends on**: T005 (build must pass — don't add UI changes on a broken build)

**Independent Test**: Navigate to `/` → hero has accent keyword, trust section visible, about and pricing sections present, professional copy throughout.

### Implementation

- [x] T009 [US5] Rewrite `frontend/app/page.tsx` — full landing page enhancement

**Changes**:

1. **Navbar**: Keep existing structure. Ensure links point to `#features`, `#about`, `#pricing`. "Sign Up" as pill button (already done), "Sign In" as text link (already done).

2. **Hero section** — rewrite copy:
   - Heading: "Organize your workflow with **cinematic** clarity" (accent word `cinematic` in pink-red)
   - Subtitle: Plannoir-specific professional copy about AI-native task management
   - CTA: "Start Organizing Free" with accent gradient
   - Subtext: "No credit card required"

3. **Trust section** (new, after hero): "TRUSTED BY PRODUCTIVE TEAMS" with styled text-logo placeholders (styled company names in gray).

4. **Features grid** — rewrite descriptions:
   - "Smart Task Management" → "Intelligent prioritization and due-date tracking that adapts to your workflow. Organize projects with drag-and-drop simplicity."
   - "Analytics Dashboard" → "Real-time productivity metrics with visual breakdowns. Understand your patterns and optimize your output."
   - "Calendar Integration" → "Seamless date picking with smart scheduling. Never miss a deadline with visual timeline awareness."
   - "Real-time Updates" → "Instant synchronization powered by SWR. Every change reflects immediately across your workspace."
   - "Premium Design" → "Hand-crafted glassmorphic interface with depth, glow effects, and cinematic micro-interactions."
   - "Secure & Private" → "Session-based authentication with encrypted storage. Your data stays yours — always."

5. **About section** (new `#about` anchor): Glassmorphic card with Plannoir's mission — "Built for people who believe productivity tools should be as refined as the work they produce."

6. **Pricing section** (new `#pricing` anchor): Two glassmorphic cards:
   - **Free**: Core task management, priority levels, calendar picker, analytics dashboard. CTA: "Get Started Free"
   - **Pro** ($9/mo): Everything in Free + AI insights, team collaboration, advanced analytics, priority support. CTA: "Upgrade to Pro" (styled as primary accent button)

7. **CTA section**: Rewrite — "Ready to elevate your productivity?" with professional subtext.

**Styling rules**:
- All new sections use existing `.glassmorphic`, `.glow-effect`, `border-pink-red/20`
- Framer Motion `initial/animate` pattern consistent with existing sections
- Mobile responsive: stack cards vertically on small screens
- No new CSS utilities or Tailwind config changes

**Acceptance**:
- Landing page has 7 distinct sections: navbar, hero, trust, features, about, pricing, CTA, footer
- `#about` and `#pricing` anchor links scroll to correct sections
- All text is professional Plannoir-branded copy (no lorem ipsum or generic text)
- Mobile viewport (375px) has no horizontal overflow

---

## Phase 6: US6 — Features Page Enhancement (Priority: P3)

**Goal**: Features page has Plannoir-specific professional copy and consistent glassmorphic styling.

**Depends on**: T005 (build must pass)

**Independent Test**: Navigate to `/features` → professional descriptions, consistent styling, nav link back to home.

### Implementation

- [x] T010 [US6] Rewrite `frontend/app/features/page.tsx` — professional copy and nav

**Changes**:

1. **Add top navbar** (consistent with landing page): Logo, back-to-home link, Login/Signup buttons.

2. **Rewrite 4 feature descriptions**:
   - "Cinematic UI" → "Every pixel crafted for depth and immersion. Glassmorphic panels with radial glow create a workspace that feels alive — because beautiful tools inspire better work."
   - "Lightning Fast" → "Sub-second task operations with optimistic UI updates. SWR-powered caching means your workflow never waits for the network."
   - "Bank-Level Security" → "Session-based authentication with bcrypt password hashing. Your credentials and data are encrypted at rest and in transit."
   - "Customizable Themes" → "Dark mode perfected with our signature burgundy-noir palette. Every element designed for reduced eye strain during long productive sessions."

3. **Rewrite 3 premium feature descriptions**:
   - "AI-Powered Insights" → "Machine learning analyzes your task patterns to surface actionable productivity recommendations. Know when you're most focused."
   - "Team Collaboration" → "Shared workspaces with role-based permissions. Assign tasks, track progress, and celebrate completions together."
   - "Advanced Analytics" → "Granular productivity reports with exportable data. Track completion rates, priority distributions, and time-to-done metrics."

4. **CTA button**: Link to `/auth/signup` instead of being a non-functional button.

**Acceptance**:
- All descriptions are Plannoir-specific (no generic text)
- CTA links to signup page
- Styling uses existing glassmorphic utilities
- `npx next build` still passes

---

## Phase 7: Final Verification Gate

- [x] T011 **GATE**: Run `npx next build` — final build check (exit code 0)
- [x] T012 **GATE**: Manual verification checklist:
  - [x] Task CRUD: List, Create, Edit, Toggle, Delete all return 2xx
  - [x] Auth errors: Specific messages for duplicate signup, wrong credentials, network failure
  - [x] Settings: Name persists after save and page refresh
  - [x] Landing page: All 7 sections render with professional copy
  - [x] Features page: Updated descriptions, working CTA
  - [x] Mobile: No horizontal overflow at 375px viewport
  - [x] Auth handshake: Sign in still creates session and sets cookie

---

## Dependencies & Execution Order

```
T001 ─────────────────────────────────────────── (backend, independent)
T002, T003, T004 ──── T005 (GATE: build) ────── (frontend imports, parallel)
                        │
                 ┌──────┼──────┐
                 ▼      ▼      ▼
              T006,T007  T008  T009, T010       (all depend on build passing)
              (US2)    (US3)  (US5, US6)
                 │      │      │
                 ▼      ▼      ▼
              T011 (final build gate)
                 │
                 ▼
              T012 (manual verification)
```

### Parallel Opportunities

| Parallel Group | Tasks | Reason |
|---------------|-------|--------|
| Backend fix | T001 | Independent — different repo directory |
| Import fixes | T002, T003, T004 | Different files, no inter-dependencies |
| Error messages | T006, T007 | Different files (signin vs signup) |
| UI rewrites | T009, T010 | Different files (landing vs features) |
| Cross-group | T001 + (T002,T003,T004) | Backend and frontend are independent |
| Cross-group | (T006,T007) + T008 + (T009,T010) | All independent after build gate |

### Sequential Constraints

| Constraint | Reason |
|-----------|--------|
| T002,T003,T004 → T005 | Build must pass before adding more changes |
| T005 → T006,T007,T008,T009,T010 | Don't add features on a broken build |
| T009,T010 → T011 | Final build check after all UI changes |
| T011 → T012 | Build must pass before manual verification |

---

## Summary

| Task | File | Priority | Story |
|------|------|----------|-------|
| T001 | `backend/src/api/tasks.py` | P1 | US1 — Fix 500 |
| T002 | `frontend/components/auth/login-form.tsx` | P1 | US4 — Fix build |
| T003 | `frontend/components/auth/signup-form.tsx` | P1 | US4 — Fix build |
| T004 | `frontend/components/ui/user-menu.tsx` | P1 | US4 — Fix build |
| T005 | — (verification) | P1 | US4 — Build gate |
| T006 | `frontend/app/auth/signin/page.tsx` | P1 | US2 — Error msgs |
| T007 | `frontend/app/auth/signup/page.tsx` | P1 | US2 — Error msgs |
| T008 | `frontend/app/dashboard/settings/page.tsx` | P2 | US3 — Settings |
| T009 | `frontend/app/page.tsx` | P3 | US5 — Landing UI |
| T010 | `frontend/app/features/page.tsx` | P3 | US6 — Features UI |
| T011 | — (verification) | — | Final build gate |
| T012 | — (verification) | — | Manual checklist |

**Total**: 10 implementation tasks + 2 verification gates = 12 tasks
**Estimated parallel execution**: 3 waves (T001+T002+T003+T004 → T005 → T006+T007+T008+T009+T010 → T011 → T012)
