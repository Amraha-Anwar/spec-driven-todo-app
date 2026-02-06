# Implementation Tasks: Sidebar & Modal Refactor (Feature 010)

**Feature**: 010-mobile-responsive-debug | **Branch**: `010-mobile-responsive-debug`
**Date**: 2026-02-06 | **Plan**: [plan.md](./plan.md) | **Architecture**: [architecture.md](./architecture.md)

---

## Task Format

Every task strictly follows this format:

```
- [ ] [TaskID] [P?] Description with exact file path
```

- **Checkbox**: `- [ ]` (markdown)
- **Task ID**: T001, T002, ... (sequential)
- **[P]**: Optional, only if parallelizable
- **Description**: Clear action with file path

---

## Phase 1: Z-Index Audit & Constants (1-2 hours)

**Goal**: Establish explicit z-index hierarchy preventing all overlaps
**Test**: Modal appears above sidebar at all sizes (375px, 768px, 1920px)

### Constants & Audit

- [ ] T001 Create `frontend/constants/zindex.ts` with values: BASE=0, CONTENT=10, MOBILE_BACKDROP=30, SIDEBAR=40, TOGGLE=45, MODAL_BACKDROP=50, MODAL_CONTENT=60

- [ ] T002 [P] Audit `frontend/components/tasks/task-delete-modal.tsx` for existing z-index values

- [ ] T003 [P] Audit `frontend/app/dashboard/layout.tsx` for existing z-index values

- [ ] T004 [P] Audit `frontend/components/layout/sidebar.tsx` for existing z-index values

### Z-Index Updates

- [ ] T005 [P] Update `frontend/components/tasks/task-delete-modal.tsx`: Change backdrop to z-50, modal container to z-60, verify `fixed inset-0` positioning

- [ ] T006 [P] Update `frontend/app/dashboard/layout.tsx`: Set sidebar z-40, toggle button z-45, mobile backdrop z-30

- [ ] T007 [P] Update `frontend/components/layout/sidebar.tsx`: Inherit z-40 from parent container

- [ ] T008 [P] Update `frontend/app/globals.css`: Remove competing z-indexes from `.glassmorphic` and `.glow-effect` classes

### Phase 1 Validation

- [ ] T009 Build: `npx next build` in frontend (0 TypeScript errors), verify z-index constants referenced in components

---

## Phase 2: Sidebar Component Refactor (2-3 hours)

**Goal**: Implement Mini (slim) mode for desktop, responsive toggle for mobile
**Test**: Desktop full↔slim smooth, mobile full↔hidden with backdrop, no content overlap

### Sidebar Component

- [ ] T010 [P] Update `frontend/components/layout/sidebar.tsx` line 1-50: Add `isSlim?: boolean` and `isMobile?: boolean` props to interface

- [ ] T011 [P] Update `frontend/components/layout/sidebar.tsx` line 44-58: Replace logo section - show "Plannoir" text when full, show "P" badge (w-8 h-8 gradient) when slim

- [ ] T012 [P] Update `frontend/components/layout/sidebar.tsx` line 65-82: Update user profile - show full details (avatar + name/email) when full, only avatar when slim

- [ ] T013 [P] Update `frontend/components/layout/sidebar.tsx` line 85-115: Update navigation - show labels when full, hide labels when slim (add title attribute for tooltip)

- [ ] T014 [P] Update `frontend/components/layout/sidebar.tsx` line 39-42: Add dynamic width classes: `isSlim ? "w-20" : "w-64"` with smooth transition

- [ ] T015 [P] Update `frontend/components/layout/sidebar.tsx` padding: Reduce from `p-6` to `p-3` when slim, adjust all sections

### Dashboard Layout Refactor

- [ ] T016 Create `frontend/hooks/useSidebarMode.ts`: Export hook with useState (mode: full|slim|hidden), localStorage persistence, mobile detection

- [ ] T017 [P] Update `frontend/app/dashboard/layout.tsx` line 18-33: Add useEffect with `window.innerWidth < 768` media query and resize listener

- [ ] T018 [P] Update `frontend/app/dashboard/layout.tsx` line 47-60: Replace toggleSidebar logic - desktop (full↔slim), mobile (full↔hidden)

- [ ] T019 [P] Update `frontend/app/dashboard/layout.tsx` line 88-102: Wrap sidebar in `<AnimatePresence mode="wait">` with slide animation (300ms, easeInOut)

- [ ] T020 [P] Update `frontend/app/dashboard/layout.tsx` line 106-115: Add mobile backdrop overlay - z-30, click to close sidebar, only when `sidebarMode === "full" && isMobile`

- [ ] T021 [P] Update `frontend/app/dashboard/layout.tsx` line 118-129: Animate content margin-left (256 desktop full / 80 slim / 0 mobile hidden), conditional on isMobile

- [ ] T022 [P] Update `frontend/app/dashboard/layout.tsx` line 124: Add padding-top `pt-16 md:pt-8` to prevent toggle button overlap

### Phase 2 Validation

- [ ] T023 Build: `npx next build` (0 TypeScript errors)

- [ ] T024 Visual test: Desktop 1920px sidebar full/slim toggle smooth; Mobile 375px sidebar full/hidden with backdrop; Responsive at 768px

---

## Phase 3: Modal Portal & Centering (1 hour)

**Goal**: Break modal from overflow-hidden, ensure viewport centering
**Test**: Modal centered at viewport (not parent), visible at all sizes, scrollable if needed

### Portal Hook

- [ ] T025 Create `frontend/hooks/useModalPortal.ts`: Export hook using React.createPortal, mounted state for SSR, target document.body

- [ ] T026 [P] Update `frontend/hooks/index.ts`: Export useModalPortal from new hook file

### Modal Update

- [ ] T027 [P] Update `frontend/components/tasks/task-delete-modal.tsx` line 1-20: Import and call useModalPortal hook, wrap modal JSX

- [ ] T028 [P] Update `frontend/components/tasks/task-delete-modal.tsx` line 36-43: Ensure fixed positioning `fixed inset-0 flex items-center justify-center`, verify z-index z-[60]

- [ ] T029 [P] Update `frontend/components/tasks/task-delete-modal.tsx` line 42: Ensure `max-h-[85vh] overflow-auto` for scrolling, `my-auto` for vertical centering

- [ ] T030 [P] Update `frontend/components/tasks/task-delete-modal.tsx` line 36: Add `pointer-events-none` to container, `pointer-events-auto` to modal content

### Phase 3 Validation

- [ ] T031 Build: `npx next build` (0 TypeScript errors)

- [ ] T032 Visual test: Delete modal centered on all viewports (375px, 768px, 1920px), buttons visible, scrollable, above sidebar

---

## Phase 4: Framer Motion Transitions (1 hour)

**Goal**: Smooth AnimatePresence animations for sidebar state changes
**Test**: Sidebar animations smooth 60 FPS, 300ms duration, no layout jumps

### Animation Configuration

- [ ] T033 [P] Update `frontend/app/dashboard/layout.tsx` line 88-102: AnimatePresence `mode="wait"` already set, add exit/enter animations

- [ ] T034 [P] Update `frontend/app/dashboard/layout.tsx` motion.div: Add `initial={{ x: -256, opacity: 0 }}`, `animate={{ x: 0, opacity: 1 }}`, `exit={{ x: -256, opacity: 0 }}`

- [ ] T035 [P] Update `frontend/app/dashboard/layout.tsx` motion.div: Set `transition={{ duration: 0.3, ease: "easeInOut" }}`

- [ ] T036 [P] Update `frontend/app/dashboard/layout.tsx` content motion.div: Animate margin-left transition (256 ↔ 80 ↔ 0)

- [ ] T037 [P] Update `frontend/app/dashboard/layout.tsx` sidebar motion.div: Animate width transition (256 ↔ 80px)

### Phase 4 Validation

- [ ] T038 Build: `npx next build` (0 TypeScript errors)

- [ ] T039 Performance: Chrome DevTools FPS meter 60 FPS during sidebar toggle transitions

---

## Phase 5: Visual Audit & Integration (1-2 hours)

**Goal**: Remove overflow-hidden cutoffs, final integration testing
**Test**: All components work together, glow effects visible, no truncation

### Overflow Audit

- [ ] T040 [P] Search `frontend/` for `overflow-hidden` pattern and document findings

- [ ] T041 [P] Audit `frontend/app/dashboard/layout.tsx`: Remove unnecessary `overflow-hidden` if present

- [ ] T042 [P] Audit `frontend/app/page.tsx`: Remove unnecessary `overflow-hidden` if present

- [ ] T043 [P] Update `frontend/app/globals.css`: Ensure `.glassmorphic` and `.glow-effect` not constrained by overflow

### Integration Testing

- [ ] T044 [P] Test delete modal: Opens centered, buttons work, deletion succeeds, error handling

- [ ] T045 [P] Test sidebar toggle: Smooth animation desktop/mobile, state persists

- [ ] T046 [P] Test responsive: Behavior correct at 768px breakpoint

- [ ] T047 [P] Test mobile backdrop: Click closes sidebar, no layout shift

- [ ] T048 [P] Test toggle button: Always accessible z-45, not obscured

- [ ] T049 [P] Test state persistence: localStorage works, reload persists sidebar state

### Final Build & Verification

- [ ] T050 Build: `npx next build` (0 TypeScript errors, 11/11 routes)

- [ ] T051 TypeScript: `npx tsc --noEmit` (0 errors)

- [ ] T052 Eslint: `npx eslint frontend/` (0 critical errors)
  - Framer Motion slide-in animation (300ms)
  - Lucide React `Trash2` icon
  - Keyboard support: Escape to cancel, Enter to confirm

- [ ] T004 [US1] Update `frontend/components/dashboard/task-item.tsx` to:
  - Import TaskDeleteModal component
  - Add state: `isDeleteModalOpen`
  - Delete button click → show modal (don't call API directly)
  - OnConfirm → call DELETE /api/{userId}/tasks/{taskId}
  - Optimistic UI: remove task from list immediately
  - On error: task reappears + error toast with specific message

- [ ] T005 [US1] Implement optimistic UI error recovery in task list (likely `frontend/app/dashboard/tasks/page.tsx`):
  - If delete fails (network error or 500), task reappears in list
  - Show error toast with reason
  - Verify list re-fetches or updates locally via SWR

- [ ] T006 [US1] Test delete functionality:
  - Sign in → navigate to dashboard
  - Click delete on any task → modal appears
  - Click Cancel → modal closes, task unchanged
  - Click Delete → task disappears, success toast appears
  - Refresh page → task is gone (confirms API was called)
  - Test network error: offline mode → delete → task reappears with error toast

**Checkpoint**: Task deletion fully functional with confirmation modal and error handling

---

## Phase 4: User Story 2 - Avatar Upload & Sync (Priority: P1)

**Goal**: Avatar upload persists immediately and updates global Avatar component without page refresh

**Independent Test**: Upload image in Settings → see preview → save → avatar appears in sidebar/navbar → navigate away and back → avatar persists. Fully independent.

### Implementation for User Story 2

- [ ] T007 [P] [US2] Update `frontend/app/dashboard/settings/page.tsx` `handleAvatarChange()` function to:
  - After successful upload via `authClient.updateUser({ image })`
  - Call `authClient.getSession()` to refresh session state
  - Update local state: `setSession(data)` where `data` is the response
  - Ensure Avatar component receives updated `authClient.user.image`

- [ ] T008 [P] [US2] Verify Avatar component (`frontend/components/ui/avatar.tsx`) reads from `authClient.user.image`:
  - Check current implementation (may already be reading from session)
  - If hardcoded, update to use `authClient.user.image` or `session?.user?.image`
  - Test: upload image → avatar in settings AND sidebar update immediately

- [ ] T009 [US2] Test avatar persistence:
  - Navigate to Settings
  - Upload image file (file picker or drag-drop)
  - See preview immediately
  - Click Save/Upload
  - Check success toast appears
  - Check Avatar in navbar/sidebar updates
  - Navigate to Dashboard (away from Settings)
  - Navigate back to Settings → avatar still shows
  - Refresh page → avatar persists

- [ ] T010 [US2] Test error scenarios:
  - Attempt upload with non-image file → validation toast
  - Attempt upload with oversized file (>5MB) → size validation toast
  - Network offline during upload → error toast + retry capability
  - Session expires during upload → re-authenticate prompt

**Checkpoint**: Avatar upload and session sync fully functional

---

## Phase 5: User Story 3 - Mobile Navigation with Hamburger Menu (Priority: P2)

**Goal**: Mobile users (≤768px) can navigate via slide-out hamburger menu

**Independent Test**: View site at 375px → hamburger menu visible → click → menu slides in → click link → navigation works and menu closes. Works independently on mobile viewports.

### Implementation for User Story 3

- [ ] T011 [P] [US3] Create `frontend/components/layout/mobile-nav.tsx` (NEW) with:
  - Hamburger icon (Lucide React `Menu`)
  - Slide-out menu panel from left (Framer Motion `x: -100%` → `x: 0`)
  - Menu links: Home, Dashboard, Features, Pricing, Settings
  - Close button (X icon)
  - Click outside (backdrop) → close menu
  - Escape key → close menu
  - Click link → navigate AND close menu automatically

- [ ] T012 [P] [US3] Create `frontend/components/layout/desktop-nav.tsx` (NEW) by extracting existing navbar horizontal nav:
  - Keep existing horizontal navigation
  - Renders only on desktop (>768px via Tailwind's `md:block hidden`)
  - Logo + nav links + Login/Signup buttons

- [ ] T013 [US3] Update `frontend/app/layout.tsx` Navbar component to:
  - Import MobileNav and DesktopNav
  - Add state: `mobileMenuOpen`
  - Conditional render:
    - ≤768px: show MobileNav (hamburger + slide-out), hide DesktopNav
    - >768px: hide MobileNav, show DesktopNav
  - Ensure smooth transition on resize

- [ ] T014 [US3] Test mobile hamburger navigation:
  - Set viewport to 375px (mobile)
  - Hamburger icon visible, desktop nav hidden
  - Click hamburger → menu slides in (< 400ms animation)
  - Menu shows all nav links
  - Click "Features" link → navigate to /features AND menu closes
  - Click hamburger again → menu opens
  - Click outside menu → menu slides out
  - Click menu X button → menu closes
  - Test on real mobile device if possible

- [ ] T015 [US3] Test responsive resize:
  - Start at 375px → hamburger menu visible
  - Resize to 800px (>768px) → hamburger hides, desktop nav shows
  - Resize back to 400px → desktop nav hides, hamburger shows
  - Menu state resets on resize

**Checkpoint**: Mobile hamburger navigation fully functional and responsive

---

## Phase 6: User Story 4 - Dashboard Sidebar Toggle on Mobile (Priority: P2)

**Goal**: Mobile dashboard users can toggle sidebar to expand content area

**Independent Test**: View dashboard at 375px → click sidebar toggle → sidebar hides, content expands → click again → sidebar reappears. Works independently.

### Implementation for User Story 4

- [ ] T016 [P] [US4] Update `frontend/app/dashboard/layout.tsx` to:
  - Add state: `sidebarCollapsed` (reads from localStorage initially)
  - Add toggle button (hamburger or chevron icon) visible only on ≤768px
  - Sidebar component:
    - When collapsed: width 0, opacity 0, transform translate off-screen
    - When expanded: width 100%, opacity 1, normal position
    - Smooth Framer Motion animation (300ms)
  - Main content area:
    - When sidebar collapsed: full width
    - When sidebar expanded: normal width with sidebar
    - No layout shift (CLS = 0)

- [ ] T017 [US4] Implement sidebar state persistence in localStorage:
  - Key: `dashboardSidebarCollapsed`
  - On toggle: update state + update localStorage
  - On mount: read from localStorage to restore previous state
  - State persists across navigation within dashboard

- [ ] T018 [US4] Test sidebar toggle on mobile:
  - View dashboard at ≤768px
  - Sidebar visible by default
  - Click toggle button → sidebar slides out (< 300ms)
  - Main content expands to full width
  - No horizontal overflow or CLS
  - Click toggle again → sidebar slides back in
  - Navigate to Analytics → sidebar state persists
  - Refresh page → sidebar state restored from localStorage
  - Resize to >768px → toggle button hides, sidebar always visible

**Checkpoint**: Sidebar toggle fully functional with persistent state

---

## Phase 7: User Story 5 - Glassmorphic Glow Intensity Adjustment (Priority: P3)

**Goal**: Reduce glow intensity across UI while maintaining glassmorphic depth

**Independent Test**: Compare before/after glow intensity → adjust CSS → verify readability and glasmorphic feel preserved.

### Implementation for User Story 5

- [ ] T019 [P] [US5] Global search in `frontend/` for all shadow-glow and glow-effect classes:
  - Find all instances in globals.css, components CSS, Tailwind config
  - Target patterns: `shadow-[...-]glow`, `.glow-effect`, `.glow-text`
  - Document current values (box-shadow blur radius, opacity)

- [ ] T020 [US5] Replace glow CSS in `frontend/globals.css`:
  - Reduce box-shadow blur radius by 40-50%:
    - Example: `blur(20px)` → `blur(10px)` or `blur(12px)`
  - Reduce glow color opacity:
    - Example: `rgba(..., 0.3)` → `rgba(..., 0.15)` or `rgba(..., 0.1)`
  - Keep depth via backdrop-blur and border styling
  - Preserve #26131B background, #C94261 primary accent colors

- [ ] T021 [P] [US5] Replace shadow-glow classes with subtle border + blur:
  - Find all `shadow-[...-]glow` classes in components
  - Replace with: `border border-white/10 backdrop-blur-md`
  - Or use CSS: `border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);`
  - Apply to: cards, buttons, glassmorphic sections
  - Examples: feature cards, pricing cards, task cards, modals

- [ ] T022 [US5] Verify glow intensity reduction doesn't impact readability:
  - Check text contrast on all pages (WCAG AA minimum)
  - Verify buttons still have clear hover states
  - Ensure glassmorphic depth is preserved (no flat appearance)
  - Visual audit: compare landing page, features page, dashboard against reference.png

- [ ] T023 [US5] Test glow adjustment on different pages:
  - Landing page: hero, feature cards, pricing cards
  - Dashboard: task cards, settings form
  - All pages: buttons, modals, hover states
  - Verify: 40-50% intensity reduction achieved, premium feel maintained

**Checkpoint**: Glow intensity reduced, glassmorphic aesthetic preserved

---

## Phase 8: User Story 6 - Advanced Landing Page Animations (Priority: P3)

**Goal**: Landing page sections animate in on scroll with premium feel

**Independent Test**: Load landing page → scroll through sections → each animates in on scroll → no jank at 60 FPS.

### Implementation for User Story 6

- [ ] T024 [P] [US6] Update `frontend/app/page.tsx` to add scroll-triggered animations:
  - Wrap each section (hero, features, about, pricing) with Framer Motion
  - Use `useInView` hook with `threshold: 0.2` to detect viewport entry
  - Implement animations:
    - **Hero**: fade-in + scale (initial: opacity 0, scale 0.9 → animate: opacity 1, scale 1)
    - **Features**: staggered fade-up (initial: opacity 0, y: 20 → animate: opacity 1, y: 0)
    - **About**: parallax or fade-in with slight rotation
    - **Pricing**: bounce-in or scale with flip effect
  - Animation duration: 600-800ms
  - Stagger delay for multiple cards: 100ms between each
  - `prefers-reduced-motion`: skip animations for accessibility

- [ ] T025 [P] [US6] Add "How it Works" section with animated vertical timeline:
  - NEW section between features and about
  - 3-4 steps: "Create", "Organize", "Execute", "Track"
  - Vertical animated line connecting steps (draws on scroll)
  - Step icons animated in sequence as line passes
  - Use Framer Motion `pathLength` or CSS animation for line

- [ ] T026 [P] [US6] Add Testimonials/Social Proof glassmorphic marquee:
  - NEW section after pricing
  - Horizontal scrolling marquee of testimonial cards
  - Cards: avatar + name + role + quote
  - Animation: continuous smooth scroll (no pause)
  - Glassmorphic styling: subtle border + backdrop-blur
  - Responsive: stack vertically on mobile

- [ ] T027 [US6] Add Premium Pricing toggle (Monthly/Yearly):
  - Add toggle button in pricing section: "Monthly" ↔ "Yearly"
  - On toggle: pricing cards show monthly prices → yearly prices (discount visible)
  - 3D hover effects on cards:
    - `rotateX(-5deg)` on hover with slight shadow lift
    - Color shift on hover (accent highlight)
  - Smooth price transition animation (200ms)

- [ ] T028 [US6] Update `frontend/app/features/page.tsx` with consistent scroll animations:
  - Apply same animation pattern as landing page
  - Ensure consistent timing and easing
  - Verify no performance regression

- [ ] T029 [US6] Test landing page animations:
  - Load at 375px (mobile) and 1920px (desktop)
  - Scroll through all sections, verify each animates on entry
  - Verify animation timing: all complete within 800ms, no jank
  - Performance check: Lighthouse score > 85, FPS meter shows 60 FPS
  - Test on slow 3G connection (DevTools throttling) → animations graceful
  - Test on device with `prefers-reduced-motion: reduce` → animations disabled

**Checkpoint**: Landing page has advanced scroll animations with premium feel

---

## Phase 9: Final Verification & Polish

**Purpose**: Cross-cutting concerns and final QA

- [ ] T030 Run `npx next build` — must exit code 0 with zero TypeScript errors

- [ ] T031 [P] Run Lighthouse audit on landing page:
  - Performance score > 85
  - Accessibility score > 90
  - Best Practices score > 90
  - No CLS (Cumulative Layout Shift) > 0.1

- [ ] T032 [P] Test all animations at 60 FPS:
  - Delete modal open/close
  - Mobile menu slide-in/out
  - Sidebar toggle
  - Landing page scroll animations
  - Use Chrome DevTools Perf tab to verify

- [ ] T033 [P] Test on real mobile device (if available):
  - iPhone or Android
  - All gestures work (tap, swipe)
  - Hamburger menu functional
  - Sidebar toggle responsive
  - No horizontal scrolling overflow

- [ ] T034 Test all user stories independently:
  - T1 (Delete): Create task → delete → confirm → success
  - T2 (Avatar): Upload image → update global component → persists
  - T3 (Mobile Nav): 375px → hamburger → navigation works
  - T4 (Sidebar): 375px → toggle → content expands
  - T5 (Glow): Compare visual intensity → reduced 40-50%
  - T6 (Animations): Scroll landing page → sections animate

- [ ] T035 Verify no breaking changes:
  - Existing task CRUD (list, create, edit, toggle) still works
  - Settings page functionality preserved
  - Auth handshake unchanged
  - Database untouched

**Checkpoint**: All user stories functional, build passing, performance verified

---

## Task Dependency Graph

```
Phase 2: T001 (Build baseline)
  ├─ Phase 3 (P1 — in parallel):
  │  ├─ T002, T003, T004, T005, T006 (Delete)
  │  └─ T007, T008, T009, T010 (Avatar)
  │
  ├─ Phase 4 (P2 — after Phase 3):
  │  ├─ T011, T012, T013, T014, T015 (Mobile Nav)
  │  └─ T016, T017, T018 (Sidebar Toggle)
  │
  └─ Phase 5 (P3 — after Phase 4):
     ├─ T019, T020, T021, T022, T023 (Glow)
     └─ T024, T025, T026, T027, T028, T029 (Animations)

Phase 6: T030, T031, T032, T033, T034, T035 (Verification)
```

---

## Parallel Execution Opportunities

### Within Phase 3 (P1 Blockers)
- **Parallel Group A**: T002, T003, T004, T005, T006 (Delete tasks — all independent)
- **Parallel Group B**: T007, T008, T009, T010 (Avatar tasks — all independent)
- **Execution**: Run both groups in parallel; delete and avatar are independent features

### Within Phase 4 (P2 Mobile)
- **Parallel Group A**: T011, T012, T013, T014, T015 (Mobile Nav — all independent)
- **Parallel Group B**: T016, T017, T018 (Sidebar Toggle — all independent)
- **Execution**: Run both groups in parallel after Phase 3 complete

### Within Phase 5 (P3 Polish)
- **Parallel Group A**: T019, T020, T021, T022, T023 (Glow adjustments — CSS is centralized)
- **Parallel Group B**: T024, T025, T026, T027, T028, T029 (Landing animations — independent sections)
- **Execution**: Run both groups in parallel after Phase 4 complete

### Cross-Phase Parallelism
- Phase 3 and Phase 4 have NO dependencies on each other (T1-T10 and T11-T18 are independent)
- Can do: Phase 3 + Phase 4 in parallel ONLY after Phase 2 (T001) completes
- NOT recommended: Phase 5 before Phase 4 (P3 less critical, P2 blocks P1 MVP)

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| **Total Implementation Tasks** | 35 (T001–T035) |
| **Phase 1 (Setup)** | 0 (UI layer, no setup needed) |
| **Phase 2 (Foundational)** | 1 task (build baseline) |
| **Phase 3 (US1 - Delete)** | 5 tasks |
| **Phase 3 (US2 - Avatar)** | 4 tasks |
| **Phase 4 (US3 - Mobile Nav)** | 5 tasks |
| **Phase 4 (US4 - Sidebar)** | 3 tasks |
| **Phase 5 (US5 - Glow)** | 5 tasks |
| **Phase 5 (US6 - Animations)** | 6 tasks |
| **Phase 6 (Final Verification)** | 6 tasks |
| **Parallelizable Tasks** | ~22 (marked with [P]) |
| **Sequential (Blocking)** | ~13 |

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)
**Phase 3 only** (T001–T010): Delete + Avatar = Core functionality fixes
- Delivers immediate value (working delete, avatar sync)
- Unblocks core product features
- Can be deployed independently
- ~1 day of focused work

### Phase 1 Complete (MVP + P2)
**Phases 2–4** (T001–T018): Add mobile responsiveness
- Delivers full mobile-first experience
- All critical user stories complete
- Can be deployed as full release
- ~2–3 days of focused work

### Phase 2 Complete (Full Release)
**All phases** (T001–T035): Add premium polish + animations
- Marketing-ready landing page
- Premium animations and visual refinement
- Full feature completeness
- ~4–5 days of focused work

---

## Definition of Done (All Tasks)

Each task MUST satisfy:
- [ ] Code change implemented and reviewed
- [ ] Acceptance criteria from spec met
- [ ] No TypeScript errors (build passes `npx next build`)
- [ ] No regressions in existing functionality
- [ ] Manual testing completed per Independent Test criteria
- [ ] Performance verified (animations at 60 FPS, < 400ms interactions)
- [ ] Mobile responsive verified (375px–1920px)
- [ ] Error cases tested and handled

