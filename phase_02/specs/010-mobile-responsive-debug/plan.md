# Implementation Plan: Mobile Responsive & Interaction Debug

**Branch**: `010-mobile-responsive-debug` | **Date**: 2026-02-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-mobile-responsive-debug/spec.md`

---

## Summary

Enhance the Plannoir application with full mobile responsiveness, fix critical interactions (task delete, avatar sync), refine the glassmorphic UI aesthetic, and implement advanced scroll-triggered animations on the landing page. This feature is split into 6 user stories (P1, P2, P3 priorities) that enable mobile-first usage, improve data persistence, and elevate the premium UX quality. All changes preserve the authentication handshake, database schema, and existing API contracts.

---

## Technical Context

**Language/Version**: TypeScript (Next.js 16+), Python 3.11 (FastAPI)
**Primary Dependencies**: Better Auth v1.4.18, Framer Motion, Tailwind CSS, Lucide React, SWR, Axios, Sonner (toast)
**Storage**: Neon Serverless PostgreSQL (existing schema — no migrations)
**Testing**: Manual verification (browser testing, mobile device/viewport testing, Lighthouse performance)
**Target Platform**: Web (Next.js on Vercel frontend, FastAPI on HuggingFace Spaces backend)
**Project Type**: Web application (monorepo: `/frontend` and `/backend`)
**Performance Goals**: All animations 60 FPS; delete/toggle < 100ms visual feedback; mobile nav < 400ms slide animation
**Constraints**:
  - No new npm dependencies beyond existing stack
  - Mobile viewport baseline ≤ 768px (Tailwind breakpoint)
  - Glow adjustment must preserve glassmorphic depth
  - Auth handshake unchanged
  - No database schema changes
**Scale/Scope**: 6 interconnected features affecting 10+ frontend components and 1 CSS utility file

---

## Constitution Check

**GATE**: Must pass before Phase 1 design. Re-check after Phase 1 design.

- [x] **I. Absolute SDD Adherence compliance** — Spec → Plan → Implement lifecycle followed; no vibe-coding
- [x] **II. Multi-Agent Orchestration alignment** — Task decomposition suitable for `frontend-cinematic-engineer` specialization
- [x] **III. Security through Isolation verification** — User isolation via JWT preserved; avatar upload uses authClient (no direct DB access)
- [x] **IV. No Manual Coding enforcement** — All changes are UI-layer only; no manual database or auth modifications required
- [x] **V. Monorepo Hygiene (frontend/backend separation)** — All changes in `/frontend` only; no backend changes
- [x] **VI. Aesthetic Excellence** — Glow adjustment maintains #26131B BG, #C94261 primary, glassmorphic effects per constitution
- [x] **VII. Stateless Reliability verification** — Settings avatar update uses Better Auth's stateless `updateUser()`; no session store changes
- [x] **Auth**: Better Auth + JWT Bridge preserved; `authClient.updateUser()` and `authClient.getSession()` used as-is
- [x] **Tech Stack**: Next.js 16+, Framer Motion (existing), Tailwind CSS (existing), FastAPI (no changes), Neon PostgreSQL (no changes)

**Compliance**: ✅ All principles aligned. No deviations or justifications needed.

---

## Project Structure

### Documentation (this feature)

```text
specs/010-mobile-responsive-debug/
├── spec.md              # Feature specification ✅
├── plan.md              # This file (architectural decisions) ✅
├── research.md          # Phase 0 output (below, will be filled during execution)
├── data-model.md        # Phase 1 output (below, will be filled during execution)
├── quickstart.md        # Phase 1 output (below, will be filled during execution)
├── contracts/           # Phase 1 output (API contracts, if applicable)
└── checklists/
    └── requirements.md  # Spec quality validation ✅
```

### Source Code (repository monorepo)

```text
frontend/
├── components/
│   ├── ui/
│   │   ├── user-menu.tsx          # (no changes — already in 009)
│   │   └── avatar.tsx             # Update to read authClient.user.image
│   └── tasks/
│       ├── task-card.tsx          # Delete button → add confirmation modal
│       └── task-delete-modal.tsx   # NEW: Confirmation dialog component
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx             # NEW: Mobile sidebar toggle logic
│   │   └── settings/
│   │       └── page.tsx           # Update avatar upload to refresh session
│   ├── layout.tsx                 # NEW: Mobile hamburger menu in navbar
│   ├── page.tsx                   # Update: Scroll-triggered animations
│   └── features/page.tsx          # Update: Scroll-triggered animations
├── lib/
│   └── toast.ts                   # (no changes — existing)
└── globals.css                     # UPDATE: Adjust glow box-shadow/blur values

backend/
└── (NO CHANGES — UI layer only)

tailwind.config.ts                 # REVIEW: Glow utilities (may adjust or use globals.css)
```

**Structure Decision**: All changes are UI-layer frontend modifications. No backend changes required. Tailwind config review only; CSS adjustments primarily in `globals.css` for centralized glow intensity control.

---

## Phase 0: Research & Clarifications

### Key Unknowns Resolved

| Unknown | Decision | Rationale |
|---------|----------|-----------|
| **Mobile breakpoint definition** | ≤ 768px (Tailwind sm/md boundary) | Standard convention; matches dashboard layout shift point |
| **Delete confirmation UI** | Modal dialog (not context menu) | Clearer for destructive actions; better mobile accessibility |
| **Avatar persistence mechanism** | Session refresh + local state update | Immediately reflects in Avatar component without page reload |
| **Sidebar state persistence** | Local storage (client-side only) | Simplest approach; no backend changes; survives reload + navigation |
| **Glow adjustment approach** | Centralized CSS utility modification | Ensures consistent application across all glassmorphic elements |
| **Animation library** | Framer Motion (existing, no new deps) | Already in stack; powerful scroll-trigger support via `useInView` |
| **Scroll animation trigger** | Intersection Observer via Framer Motion | Native browser API; excellent performance; no third-party animation library |

**Outcome**: No NEEDS CLARIFICATION markers remain. All decisions documented with rationale.

---

## Phase 1: Design & Architecture

### 1.1 Data Model & State Management

#### Component State (ephemeral — no persistence)

| State | Component | Storage | Scope |
|-------|-----------|---------|-------|
| `mobileMenuOpen` | `Navbar` | Component state | Current session |
| `sidebarCollapsed` | `DashboardLayout` | Local storage + component state | Persists across navigation |
| `deleteModalOpen` | `TaskDeleteModal` | Component state | Modal display |
| `deletingTaskId` | `TaskDeleteModal` | Component state | Tracks which task is being deleted |
| `isUploading` | `SettingsPage` | Component state | Avatar upload progress |
| `previewUrl` | `SettingsPage` | Component state | Image preview before upload |

#### External State (via Better Auth)

| State | Source | Accessed | Update Trigger |
|-------|--------|----------|-----------------|
| `authClient.user.image` | Better Auth session | Avatar component | `authClient.updateUser({ image })` + `authClient.getSession()` |
| `authClient.user.name` | Better Auth session | Sidebar (existing in 009) | Settings page save (existing in 009) |

**Key Design Decision**: All state is managed locally in components. Session state (avatar, name) is refreshed via Better Auth client methods. No Redux/Context needed; local state + SWR pattern sufficient.

### 1.2 Component Architecture

#### New Components

1. **`components/tasks/task-delete-modal.tsx`** (NEW)
   - Modal confirmation dialog for task deletion
   - Accepts: `taskId`, `taskTitle`, `onConfirm`, `onCancel`
   - Handles: Delete API call + optimistic UI + error handling
   - Dependencies: Framer Motion (animation), Lucide React (icons), Sonner (toast)

2. **`components/layout/mobile-nav.tsx`** (NEW — extracted from existing Navbar)
   - Hamburger menu button + slide-out menu panel
   - Renders on mobile (≤ 768px), hidden on desktop
   - Animations: Framer Motion slide-in/out
   - Dependencies: Framer Motion, Lucide React

3. **`components/layout/desktop-nav.tsx`** (NEW — extracted from existing Navbar)
   - Horizontal navigation bar
   - Renders on desktop (> 768px), hidden on mobile
   - No animation changes needed

#### Modified Components

| Component | Change | Reason |
|-----------|--------|--------|
| `Navbar` (layout.tsx) | Split into mobile/desktop nav; render conditional on breakpoint | Mobile-responsive design |
| `TaskCard` | Add delete button → trigger modal instead of direct delete | Prevent accidental deletion |
| `SettingsPage` | Avatar upload → refresh session after success | Sync Avatar component immediately |
| `Avatar` | Read from `authClient.user.image` instead of static prop | Reactive to session updates |
| `DashboardLayout` | Add sidebar toggle button; manage `sidebarCollapsed` state | Mobile space efficiency |
| `LandingPage` (page.tsx) | Wrap sections with scroll-triggered Framer Motion | Dynamic animations |
| `FeaturesPage` | Wrap sections with scroll-triggered Framer Motion | Consistent with landing |

#### Utility Components (existing)

- **`globals.css`**: Modify `.glassmorphic`, `.glow-effect` shadow/blur values (glow intensity reduction)
- **`tailwind.config.ts`**: Review `pink-red`, `deep-black` color utilities (no new colors)

### 1.3 API Contracts

#### No NEW APIs required

All changes use existing endpoints:
- `POST /api/{userId}/tasks/{taskId}` — Delete task (already exists)
- `PATCH /api/{userId}/tasks/{taskId}` — Update task (already exists)
- `POST /api/auth/update-user` — Better Auth `updateUser()` (already exists)

#### Data Flows

**Task Deletion Flow**:
```
User clicks delete button
  → Modal opens
  → User confirms
  → Optimistic UI removes task from list
  → API call DELETE /api/{userId}/tasks/{taskId}
  → On 204: success toast
  → On error: task reappears + error toast
```

**Avatar Upload Flow**:
```
User selects image in Settings
  → Preview displayed
  → User clicks Save/Upload
  → Optimistic preview shown
  → API call POST /api/auth/update-user (Better Auth)
  → On success: authClient.getSession() refreshes state
  → Avatar component re-renders with new image
  → No page reload needed
```

**Mobile Menu Flow**:
```
User clicks hamburger icon
  → Mobile menu slides in from left
  → Menu overlays content
  → User clicks link or backdrop
  → Menu slides out
  → Navigation continues
```

**Scroll Animation Flow**:
```
Page loads
  → Each section wrapped with Framer Motion useInView
  → As user scrolls, section enters viewport
  → Animation triggers (fade, slide, scale)
  → Animation completes
  → Content remains visible
```

### 1.4 Performance Targets

| Interaction | Target | Method of Measurement |
|-------------|--------|------------------------|
| Delete modal open | < 100ms visual feedback | Browser DevTools Perf tab |
| Mobile menu slide-in | < 400ms animation | Framer Motion transition duration |
| Sidebar toggle | < 300ms animation | Framer Motion transition duration |
| Scroll animation trigger | < 100ms after entering viewport | React DevTools Profiler |
| Overall animation FPS | 60 FPS (no jank) | Chrome DevTools FPS meter |
| Avatar image appears | < 500ms after upload | Manual + DevTools Network tab |

---

## Phase 1.5: Architectural Refinements (Updated Strategy)

### Z-Index Audit & Explicit Layering

**Goal**: Eliminate component overlap and create clear z-index hierarchy.

| Layer | Component | Z-Index | Context | Purpose |
|-------|-----------|---------|---------|---------|
| Base | Background gradients | N/A | Fixed, pointer-events-none | Visual backdrop |
| 10 | Main content | z-10 | Relative | Normal content flow |
| 20 | Tooltips, dropdowns | z-20 | Absolute/Fixed | Minor overlays |
| 30 | Mobile backdrop | z-30 | Fixed | Sidebar overlay backdrop |
| 40 | Sidebar (full/slim) | z-40 | Relative (desktop) / Fixed (mobile) | Navigation sidebar |
| 45 | Toggle button | z-45 | Fixed | Sidebar toggle control |
| 50 | Modal backdrop | z-50 | Fixed | Overlay darkening |
| 60 | Modal content | z-60 | Fixed | Delete confirmation dialog |

**Implementation**:
- Sidebar: `z-40` when `relative` (desktop), `z-40` when `fixed` (mobile)
- Toggle button: `z-45` always (above sidebar, below modal)
- Modal backdrop: `z-50`
- Modal content: `z-60` with proper centering
- Content area: Default `z-10` context, no competing z-indexes

### Portal Pattern for Modals

**Goal**: Break modals out of parent overflow-hidden containers.

**Strategy**:
1. Create `hooks/useModalPortal.ts` - wraps React.createPortal with DOM target detection
2. Detect if modal parent has `overflow: hidden` - if true, mount to document.body via portal
3. Modal component accepts optional `container` prop for portal target
4. Falls back to inline rendering if portal unavailable (error handling)

**Benefits**:
- Modal never constrained by parent overflow rules
- Prevents modal cutoff at viewport edges
- Maintains modal accessibility (focus management)
- Works with existing Framer Motion animations

### Sidebar Component Refactor

**Current Issues**:
- Sidebar always `fixed left-0 top-0` conflicts with desktop relative positioning
- Width transitions don't push content (margin doesn't apply to fixed elements)
- Mobile/desktop behavior not clearly separated

**New Architecture**:
```
Desktop (≥768px):
  ├─ Sidebar: relative, w-64 (full) or w-20 (slim)
  ├─ Content: adjusts margin-left via motion.div
  └─ Toggle button: fixed top-left for accessibility

Mobile (<768px):
  ├─ Sidebar: fixed left-0 top-0, slides in/out
  ├─ Backdrop: z-30, click to close
  ├─ Content: full-width (no margin adjustment)
  └─ Toggle button: fixed top-right
```

**Implementation Details**:
- Create `useSidebarMode()` hook: manages state, mobile detection, localStorage
- Sidebar component: accepts `isSlim` and `isMobile` props
- Dashboard layout: renders sidebar as `relative` on desktop, `fixed` on mobile
- Motion.div wrapper applies conditional animation + positioning

### Framer Motion Transitions (AnimatePresence)

**Current Problem**: Direct state changes cause layout shifts.

**Solution**:
1. Wrap sidebar in `<AnimatePresence mode="wait">`
2. Use `key={sidebarMode}` to trigger exit/enter animations
3. Define:
   - Exit: `x: -256, opacity: 0` (slide left, fade)
   - Enter: `x: 0, opacity: 1` (slide in, fade)
   - Duration: 300ms, ease: "easeInOut"
4. Modal: use AnimatePresence for smooth show/hide

**Benefits**:
- Smooth visual feedback
- No jarring layout jumps
- Professional feel
- Consistent animation across interactions

---

## Phase 2: Implementation Strategy

### 2.1 Phased Rollout (Dependency Order)

```
Phase 2a (P1 — Blockers — 3 tasks)
  ├─ T001: Fix task delete → modal confirmation component
  ├─ T002: Avatar sync → session refresh logic
  └─ T003: Build verification → npx next build passes

Phase 2b (P2 — Important — 2 tasks)
  ├─ T004: Mobile hamburger nav (≤ 768px)
  ├─ T005: Sidebar toggle (dashboard mobile)
  └─ T006: Build verification

Phase 2c (P3 — Polish — 2 tasks)
  ├─ T007: Glow intensity reduction (CSS)
  ├─ T008: Landing/Features scroll animations (Framer Motion)
  └─ T009: Final build + performance verification
```

### 2.2 Implementation Details per Phase

#### Phase 2a: P1 Blockers (Delete + Avatar)

**T001: Task Delete Modal & Confirmation**
- Create `components/tasks/task-delete-modal.tsx` with Framer Motion animations
- Update `components/tasks/task-card.tsx` to show modal instead of direct delete
- Implement optimistic UI: task disappears immediately, reappears on error
- Error handling: show error toast with specific message
- Keyboard support: Escape to cancel, Enter to confirm

**T002: Avatar Upload & Session Sync**
- Update `app/dashboard/settings/page.tsx` `handleAvatarChange()`
- After successful upload: call `authClient.getSession()` to refresh
- Update local `session` state with new `user.image`
- Avatar component subscribes to `authClient.user.image` via session context or prop
- Test: upload image → refresh page → image persists

**T003: Build Verification**
- Run `npx next build` — must exit 0
- No TypeScript errors or warnings related to new components
- All imports resolve correctly

#### Phase 2b: P2 Mobile Responsiveness

**T004: Mobile Hamburger Navigation**
- Extract navbar logic into `mobile-nav.tsx` and `desktop-nav.tsx`
- Hamburger button visible only on ≤ 768px
- Slide-in menu uses Framer Motion `initial={{ x: '-100%' }}` → `animate={{ x: 0 }}`
- Menu includes all nav links (Home, Dashboard, Features, Pricing)
- Click outside or close button → slide out
- Escape key closes menu
- No menu flickering on desktop

**T005: Dashboard Sidebar Toggle (Mobile)**
- Add toggle button to `DashboardLayout` (visible on ≤ 768px)
- Sidebar slides left or collapses to icon
- Main content expands when sidebar hidden
- State persists in local storage: `dashboardSidebarCollapsed`
- On resize > 768px → button hides, sidebar always visible
- No layout shift or CLS (Cumulative Layout Shift)

**T006: Build Verification**
- Run `npx next build` → exit 0
- No new TypeScript errors
- Verify all existing dashboard functionality still works

#### Phase 2c: P3 Polish

**T007: Glow Intensity Reduction (CSS)**
- Identify all `.glassmorphic`, `.glow-effect` utilities in `globals.css` and `tailwind.config.ts`
- Reduce `box-shadow` blur radius by 40–50% (e.g., `blur(20px)` → `blur(12px)`)
- Reduce glow opacity slightly (e.g., `rgba(..., 0.3)` → `rgba(..., 0.15)`)
- Keep depth and glassmorphic feel intact
- Visual audit: compare before/after against reference.png
- Ensure no readability loss

**T008: Scroll-Triggered Landing/Features Animations**
- Wrap `LandingPage` sections (hero, features, about, pricing) with Framer Motion
- Use `useInView` hook to detect when section enters viewport
- Trigger `animate` state on entry (fade, slide-up, scale, rotate effects)
- Stagger animations for multiple cards
- Disable on `prefers-reduced-motion` for accessibility
- Test on slow devices (Lighthouse throttling)

**T009: Final Performance Verification**
- Run `npx next build` → exit 0
- Lighthouse audit on landing page (target: 85+ performance score)
- Test all animations for jank (Chrome DevTools Perf tab)
- Verify 60 FPS on:
  - Delete modal open/close
  - Mobile menu slide-in/out
  - Sidebar toggle
  - Landing page scroll animations
- Test on real mobile device (iPhone + Android) if possible

### 2.3 File-by-File Changes Summary

| File | Phase | Changes |
|------|-------|---------|
| `components/tasks/task-card.tsx` | 2a | Delete button opens modal instead of direct delete |
| `components/tasks/task-delete-modal.tsx` | 2a | NEW: Modal component with confirmation |
| `app/dashboard/settings/page.tsx` | 2a | Avatar upload → call `authClient.getSession()` + update state |
| `components/ui/avatar.tsx` | 2a | Update to read from `authClient.user.image` (if not already) |
| `components/layout/navbar.tsx` | 2b | Split into mobile/desktop nav; conditional render |
| `components/layout/mobile-nav.tsx` | 2b | NEW: Hamburger menu + slide-out nav |
| `components/layout/desktop-nav.tsx` | 2b | NEW: Horizontal nav (desktop only) |
| `app/dashboard/layout.tsx` | 2b | Add sidebar toggle button + state management |
| `globals.css` | 2c | Reduce glow intensity: adjust `box-shadow` blur/opacity |
| `app/page.tsx` | 2c | Wrap sections with scroll-triggered Framer Motion |
| `app/features/page.tsx` | 2c | Wrap sections with scroll-triggered Framer Motion |

### 2.4 Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Delete modal blocks rapid deletes (UX friction) | Low | Medium | Add "batch delete" or keyboard shortcut (future feature) |
| Sidebar toggle state persists across unrelated pages | Medium | Low | Scope state to dashboard only; clear on logout |
| Scroll animations cause jank on slow devices | Medium | Medium | Use `prefers-reduced-motion`; test on throttled connection |
| Avatar image upload times out | Low | High | Implement timeout + retry logic; show loading spinner |
| Mobile menu doesn't close on redirect | Medium | Low | Auto-close menu on navigation (use router hook) |
| Glow reduction looks washed out | Low | Medium | Conduct visual audit; iterate if needed |

---

## Files NOT Modified (Invariants)

| File | Reason |
|------|--------|
| `backend/` (entire directory) | No backend changes; UI layer only |
| `frontend/lib/auth-client.ts` | Auth handshake untouched |
| `frontend/lib/api.ts` | Axios config unchanged |
| `frontend/app/globals.css` (core colors) | Keep #26131B, #C94261 colors intact |
| Database schema | No migrations; no new tables |
| Task CRUD routes | No API changes; modal is UI-only |

---

## Dependencies & Libraries (No New Installs)

- **Framer Motion** (existing) — used for delete modal, mobile menu, sidebar toggle, scroll animations
- **Lucide React** (existing) — icons for menu, delete, close buttons
- **Sonner** (existing) — toast notifications for delete success/error
- **Tailwind CSS** (existing) — responsive classes (`hidden md:block`, etc.)
- **Next.js** (existing) — `next/navigation` for router, `useEffect` hooks
- **Better Auth Client** (existing) — `updateUser()` and `getSession()` methods

**No new npm packages required** ✅

---

## Definition of Done

- [x] Spec written and reviewed (this Phase 1 plan)
- [ ] Phase 2 tasks created via `/sp.tasks`
- [ ] All tasks implemented and tested per acceptance criteria
- [ ] `npx next build` passes with zero errors
- [ ] Manual testing on mobile (≤ 768px) and desktop
- [ ] Performance audit: 60 FPS for all animations
- [ ] Lighthouse score > 85 on landing page
- [ ] PR created and approved
- [ ] Merged to `main` and deployed

---

## Next Steps

1. ✅ **Phase 1 complete**: Plan written with architecture decisions documented
2. **Phase 2 (next)**: Execute `/sp.tasks` to decompose into actionable tasks
3. **Phase 3**: Implement tasks via agent-driven workflow
4. **Phase 4**: Final verification and deployment

