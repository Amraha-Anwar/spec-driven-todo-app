# Feature Specification: Mobile Responsive & Interaction Debug

**Feature Branch**: `010-mobile-responsive-debug`
**Created**: 2026-02-06
**Status**: Draft
**Input**: User description: "Debug Tasks: Check the DeleteTask component for missing onClick handlers or event propagation issues. Avatar Sync: Implement a session refresh or state update in the Settings page so that authClient.user.image updates the global Avatar component immediately upon successful upload. Responsive Framework: Use Tailwind's hidden/block classes and Framer Motion to build a slide-out mobile menu and a collapsible sidebar for the dashboard. UI Refinement: Adjust the box-shadow and blur values in the global CSS/Tailwind config to tone down the glow while keeping the glassmorphic feel. Advanced Landing Section: Structure the new landing page sections using Aceternity or Framer Motion for a scrolling experience rather than a static page."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fix Task Delete Functionality (Priority: P1)

A user clicks the delete button on a task in their dashboard and expects the task to be removed from the list with immediate visual feedback. The button must be fully responsive with proper event handling, showing a confirmation dialog before deletion, and updating the UI optimistically.

**Why this priority**: Task deletion is core product functionality. A broken delete button blocks users from managing their task list, making the app feel incomplete and untrustworthy.

**Independent Test**: Click delete button on any task → see confirmation dialog → confirm → task disappears from list and UI updates immediately. Can be tested without any other feature.

**Acceptance Scenarios**:

1. **Given** a signed-in user with tasks on `/dashboard`, **When** they click the delete button on a task, **Then** a confirmation modal appears with "Cancel" and "Delete" options.
2. **Given** a confirmation modal is open, **When** they click "Delete", **Then** the task disappears from the list immediately (optimistic UI) and a success toast appears.
3. **Given** a confirmation modal is open, **When** they click "Cancel" or dismiss the modal, **Then** the task remains in the list unchanged.
4. **Given** the UI shows a task as deleted, **When** the API call completes, **Then** the UI remains consistent (no flash or revert).
5. **Given** a delete request fails (network error or 500), **When** the failure resolves, **Then** the task reappears in the list and an error toast shows the reason.

---

### User Story 2 - Avatar Upload & Sync (Priority: P1)

A user uploads a profile image in the Settings page and sees it immediately reflected in both the Settings avatar preview and the global Avatar component in the sidebar/navbar without requiring a page refresh.

**Why this priority**: Settings image persistence is a core part of user profile management. If the avatar doesn't sync, the app feels broken and users lose trust in data synchronization.

**Independent Test**: Upload an image in Settings → see it in the avatar preview → navigate away and back → avatar persists. Sidebar avatar also updates. Fully independent and delivers clear user value.

**Acceptance Scenarios**:

1. **Given** the Settings page with an avatar upload input, **When** a user selects an image file, **Then** a preview shows immediately.
2. **Given** a preview is displayed, **When** the user clicks "Save" or confirms the upload, **Then** the image is sent to the backend via Better Auth's `updateUser()`.
3. **Given** the upload succeeds, **When** the response returns, **Then** the local session state updates with the new image URL (authClient.user.image).
4. **Given** session state is updated, **When** the Avatar component re-renders, **Then** it displays the new image without a page refresh.
5. **Given** the user navigates to another page and back, **When** they return to Settings, **Then** the avatar still shows the newly uploaded image (persistence verified).
6. **Given** an upload fails (network error, validation), **When** the error resolves, **Then** an error toast appears and the previous avatar is shown.

---

### User Story 3 - Mobile Navigation with Hamburger Menu (Priority: P2)

A mobile user (375px–768px viewport) can access the navigation through an animated hamburger menu that slides in from the left. The menu includes all navigation links and is dismissible by clicking outside or a close button.

**Why this priority**: Mobile responsiveness is critical for user retention. Without a working mobile nav, mobile users cannot navigate the app effectively, significantly limiting accessibility.

**Independent Test**: View site on mobile (375px) → click hamburger menu → menu slides in with links → click a link or outside → menu closes and navigation works. Can be tested independently on mobile devices.

**Acceptance Scenarios**:

1. **Given** a user on mobile (viewport width ≤ 768px), **When** the page loads, **Then** a hamburger icon appears in the navbar (desktop nav is hidden).
2. **Given** the hamburger icon is visible, **When** the user clicks it, **Then** a slide-out menu appears from the left with smooth Framer Motion animation.
3. **Given** the menu is open, **When** the user clicks a nav link, **Then** the link navigates correctly and the menu closes automatically.
4. **Given** the menu is open, **When** the user clicks outside the menu (backdrop), **Then** the menu closes with a smooth animation.
5. **Given** the menu is open, **When** the user clicks a close button (X), **Then** the menu closes with animation.
6. **Given** a user resizes the window from mobile to desktop, **When** the viewport exceeds 768px, **Then** the hamburger icon hides and the standard horizontal nav shows.

---

### User Story 4 - Dashboard Sidebar Toggle on Mobile (Priority: P2)

On mobile (≤ 768px), the dashboard sidebar should be collapsible/hideable with a toggle button. The main content should expand when the sidebar is hidden to maximize screen real estate.

**Why this priority**: Mobile dashboard usability depends on efficient use of screen space. A fixed sidebar on mobile wastes space; a collapsible sidebar is essential for good UX.

**Independent Test**: View dashboard on mobile → click sidebar toggle → sidebar hides and content expands → click again → sidebar reappears. Works independently and improves mobile UX.

**Acceptance Scenarios**:

1. **Given** a user on the mobile dashboard (≤ 768px), **When** the page loads, **Then** the sidebar is visible by default.
2. **Given** the sidebar is visible, **When** the user clicks the toggle button, **Then** the sidebar slides out smoothly (Framer Motion) and the main content expands to full width.
3. **Given** the sidebar is hidden, **When** the main content area renders, **Then** it uses the full available width without overflow or layout shift.
4. **Given** the sidebar is hidden, **When** the user clicks the toggle button again, **Then** the sidebar slides back in and the layout adjusts.
5. **Given** a user navigates to a different dashboard page (e.g., Analytics), **When** they return to Tasks, **Then** the sidebar state persists (remembers if it was hidden or visible).
6. **Given** a user resizes from mobile to desktop (≥ 769px), **When** the viewport expands, **Then** the sidebar becomes fixed/always-visible and the toggle button hides.

---

### User Story 5 - Glassmorphic Glow Intensity Adjustment (Priority: P3)

The application's glassmorphic UI elements (cards, buttons, glowing accents) should have subtle, refined glow effects that reduce visual fatigue. The overall aesthetic remains premium but with reduced intensity compared to the current over-saturated appearance.

**Why this priority**: Visual polish improves user perception and brand credibility. While not a functional blocker, it significantly impacts the "premium" feeling of the product.

**Independent Test**: Compare current glow intensity against reference image → adjust shadow and blur values in global CSS → verify no loss of glassmorphic depth → compare user feedback on visual comfort.

**Acceptance Scenarios**:

1. **Given** a user viewing the landing page, **When** they look at feature cards and buttons, **Then** the glow effect is visible but subtle (no harsh, oversaturated colors).
2. **Given** the glow is adjusted, **When** the user focuses on text and UI elements, **Then** the reduced intensity does not reduce readability or visual hierarchy.
3. **Given** a task card on the dashboard, **When** the user hovers over it, **Then** the hover glow effect is smooth and refined (not jarring).
4. **Given** glassmorphic card components across the app, **When** compared to the reference design, **Then** the blur, shadow, and opacity values match or improve upon the reference aesthetic.
5. **Given** a user viewing the app for extended periods, **When** they assess visual comfort, **Then** the reduced glow intensity reduces perceived eye strain (qualitative feedback).

---

### User Story 6 - Advanced Landing Page Animations (Priority: P3)

The landing page hero, feature cards, about, and pricing sections should animate in as the user scrolls, creating a dynamic "scrolling experience" using Aceternity or Framer Motion. Animations should be smooth, performant, and not distract from content.

**Why this priority**: Advanced animations enhance perceived quality and engagement. These are premium UX enhancements that elevate the landing experience but don't block core functionality.

**Independent Test**: Load landing page → scroll through all sections (hero, features, about, pricing) → observe animations trigger on scroll → verify no performance degradation or jank.

**Acceptance Scenarios**:

1. **Given** a user loads the landing page, **When** the hero section is in view, **Then** it animates in smoothly (fade-in, scale, slide effect) on load.
2. **Given** a user scrolls down, **When** each feature card enters the viewport, **Then** it animates in (staggered, fade-up, rotate effect) with a delay based on position.
3. **Given** a user scrolls to the about section, **When** it enters the viewport, **Then** content animates in (parallax or reveal effect) creating depth.
4. **Given** a user scrolls to the pricing section, **When** pricing cards enter the viewport, **Then** they animate in (bounce, scale, flip effect) drawing attention.
5. **Given** animations are running, **When** the user scrolls rapidly or resizes the window, **Then** animations remain smooth with no jank or frame drops (60 FPS target).
6. **Given** a user on a slower device or low-power mode, **When** animations run, **Then** performance remains acceptable (animations may be subtle but not skipped).

---

### Edge Cases

- **Delete with optimistic UI failure**: Task disappears optimistically, but API fails — task reappears with error message.
- **Avatar upload with concurrent session expiry**: User uploads avatar but session expires during upload — clear error message and re-authenticate prompt.
- **Mobile nav open on scroll**: User opens hamburger menu and scrolls content behind it — menu remains fixed in viewport.
- **Sidebar toggle with deep-linked dashboard**: User lands on `/dashboard/analytics` with sidebar hidden (from previous session) — sidebar state persists until explicitly toggled.
- **Glow adjustment with CSS variables**: If glow intensity is a CSS custom property, changing it should affect all components consistently.
- **Landing animation on slow network**: Page loads but animations trigger before all images are loaded — animations still run but gracefully handle missing assets.
- **Browser zoom/scaling**: Animations and glow effects should scale proportionally when user zooms in/out.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a delete confirmation modal when the user clicks any task delete button, with "Cancel" and "Delete" options (preventing accidental deletions).
- **FR-002**: System MUST handle task deletion with optimistic UI updates — the task disappears immediately, and if the API call fails, it reappears with an error message.
- **FR-003**: System MUST support avatar image upload via the Settings page and persist the image to the user's profile via Better Auth's `updateUser()` API.
- **FR-004**: System MUST refresh session state after a successful avatar upload so that the global Avatar component (sidebar/navbar) updates immediately without a page refresh.
- **FR-005**: System MUST render a hamburger menu icon on mobile viewports (≤ 768px) with a slide-out navigation panel triggered by a click event.
- **FR-006**: System MUST implement smooth slide-in/slide-out animations for the mobile hamburger menu using Framer Motion (no jarring transitions).
- **FR-007**: System MUST close the mobile menu when the user clicks a navigation link, clicks outside the menu (backdrop), or clicks a close button.
- **FR-008**: System MUST provide a sidebar toggle button on the mobile dashboard that hides/shows the sidebar and expands the main content area when hidden.
- **FR-009**: System MUST persist the sidebar toggle state in local storage or session storage so the state is remembered across navigation.
- **FR-010**: System MUST adjust CSS box-shadow and blur values in the global CSS/Tailwind config to reduce glow intensity while maintaining the glassmorphic aesthetic.
- **FR-011**: System MUST implement scroll-triggered animations for landing page sections (hero, features, about, pricing) using Aceternity or Framer Motion.
- **FR-012**: System MUST ensure all animations (delete confirm, mobile menu, sidebar toggle, scroll effects) perform smoothly at 60 FPS without causing layout shifts or jank.

### Key Entities

- **Task**: id, title, description, is_completed, priority, due_date, user_id, created_at, updated_at. Delete action tied to delete button component.
- **User Profile**: id, name, email, image, session state. Avatar component reads `authClient.user.image` for display.
- **Navigation State**: mobile menu open/closed, sidebar collapsed/expanded. Can be stored in component state or local storage.
- **Animation State**: scroll position (for scroll-triggered animations), sidebar toggle state, menu open/closed state.

---

## Constraints & Invariants

1. **Mobile-first responsive design**: All changes must work on 375px viewport and scale to 1920px without breaking layout.
2. **No new npm dependencies**: Use existing libraries (Framer Motion, Tailwind, Lucide React) — no new animation libraries unless absolutely necessary.
3. **Performance baseline**: All animations must maintain 60 FPS. No artificial delays or heavy computations that block the main thread.
4. **Authentication unchanged**: The auth handshake and session management remain untouched. Only the Settings page consumes `authClient.updateUser()` and `authClient.getSession()`.
5. **Database schema unchanged**: No new tables or migrations. All changes are UI-layer only.
6. **Glassmorphic aesthetic preserved**: Glow adjustment should tone down intensity, not eliminate glassmorphic effects entirely.
7. **Accessibility**: All interactive elements must be keyboard-navigable (Tab, Enter, Escape). Menu close on Escape key.
8. **No breaking changes to existing routes or APIs**: All existing functionality must continue to work. These are enhancements, not refactors.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Delete button fully functional — delete action completes within 2 seconds with visual feedback (toast + UI update).
- **SC-002**: Avatar image persists across page refresh and is reflected in sidebar/navbar immediately after upload (no manual refresh required).
- **SC-003**: Mobile hamburger menu visible and functional on viewports ≤ 768px; desktop nav visible on > 768px.
- **SC-004**: Sidebar toggle on mobile dashboard persists state across navigation within the dashboard (state survives route changes).
- **SC-005**: Glow intensity reduced by 40–50% compared to current version while maintaining recognizable glassmorphic depth (measured via visual audit).
- **SC-006**: Landing page scroll animations trigger smoothly without frame drops (60 FPS minimum observed during scroll).
- **SC-007**: All animations and interactions complete within the following times:
  - Delete confirmation modal appears in < 100ms
  - Mobile menu slide-in/out completes in < 400ms
  - Sidebar toggle animation completes in < 300ms
  - Scroll-triggered animations start within 100ms of entering viewport
- **SC-008**: Build passes `npx next build` with zero new TypeScript errors related to these changes.
- **SC-009**: All existing task CRUD operations (list, create, edit, toggle, delete) continue to work without regression.
- **SC-010**: Mobile usability: Users can complete core tasks (view tasks, delete task, edit name in settings, upload avatar) on 375px viewport without horizontal scrolling.

---

## Assumptions

- **Mobile viewport defined as ≤ 768px** based on Tailwind's breakpoints (assumption: "mobile" = tablet-and-below threshold).
- **Glow adjustment targets global CSS utilities** — modifications are centralized in `globals.css` or `tailwind.config.ts` for consistency.
- **Avatar upload uses Better Auth's built-in image field** — the backend already supports `updateUser({ image })` pattern (verified in 009 spec).
- **Sidebar state stored in local storage** — simplest approach for persistence without backend changes.
- **Scroll animations use Intersection Observer API** — standard browser capability, no third-party dependency beyond Framer Motion.
- **Delete confirmation is a modal, not a context menu** — clearer UX for confirming destructive actions.
- **No new color system needed** — glow adjustment only modifies `box-shadow`, `blur`, and `opacity` of existing utilities.
- **Accessibility baseline**: Keyboard navigation (Tab, Escape) is required; screen reader improvements are nice-to-have.

