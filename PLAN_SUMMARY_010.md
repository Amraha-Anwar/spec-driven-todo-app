# Plan Summary: Feature 010 - Sidebar & Modal Refactor

**Status**: ✅ Planning Complete
**Branch**: `010-mobile-responsive-debug`
**Commit**: `0f4d9b9`
**Date**: 2026-02-06

---

## Executive Overview

Comprehensive architectural plan to eliminate component overlaps and create a professional, fluid dashboard layout through:
1. **Z-Index Audit** - Explicit layering hierarchy
2. **Sidebar Refactor** - Responsive positioning (relative desktop, fixed mobile)
3. **Modal Portal** - React Portal pattern to escape overflow containers
4. **Framer Motion** - Smooth transitions with AnimatePresence

---

## Problem Statement

### Current Issues
1. **Modal Gets Cut Off**: Delete confirmation popup constrained by parent overflow-hidden, buttons not visible
2. **Sidebar Overlap**: Sidebar fixed positioning causes it to overlap content on desktop
3. **Z-Index Chaos**: Competing z-indexes cause unexpected layering
4. **Layout Jank**: State changes cause layout shifts instead of smooth transitions

### Root Causes
- Sidebar always `fixed left-0 top-0` regardless of screen size
- Modal not using portal pattern (trapped in parent container)
- No explicit z-index hierarchy
- No AnimatePresence for smooth transitions between states

---

## Solution Architecture

### 1. Z-Index Hierarchy (Complete Layer Map)

```
z-60  Modal Content (Delete Confirmation Dialog)
z-50  Modal Backdrop (dark overlay, click to dismiss)
z-45  Toggle Button (Menu/X icon, always accessible)
z-40  Sidebar (Full 256px / Slim 80px)
z-30  Mobile Backdrop (sidebar overlay, click to close)
z-10  Main Content Area (adjusts margin on desktop)
z-0   Background Gradients (pointer-events-none)
```

**Benefits**:
- Clear separation between layers
- No competing z-indexes
- Modal always appears above sidebar
- Toggle button accessible between sidebar and modal

### 2. Responsive Sidebar Positioning

#### Desktop (≥768px)
```
┌────────────────────────────────────┐
│ Sidebar (relative)  │ Content Area │
│ w-64 (full)         │ margin-left  │
│ w-20 (slim)         │ adjusts      │
│                     │              │
└────────────────────────────────────┘
```

- Sidebar: `relative` positioning (takes up real space)
- Content: `margin-left` animation (256px → 80px → 0)
- Toggle: Full ↔ Slim (no hidden state)
- Benefit: Content never overlapped

#### Mobile (<768px)
```
┌────────────────────────────────────┐
│ Sidebar (fixed)   │ Content Area   │
│ slides in/out     │ full-width     │
│ w-256px (full)    │                │
│                   │ Backdrop: z-30 │
└────────────────────────────────────┘
```

- Sidebar: `fixed` positioning (overlays content)
- Content: full-width (no margin adjustment)
- Toggle: Full ↔ Hidden
- Backdrop: Clickable (z-30) to close sidebar
- Benefit: Space efficiency, proper mobile UX

### 3. Modal Portal Pattern

**Problem**: Modal trapped inside dashboard layout's overflow-hidden container

**Solution**: React Portal pattern with custom hook

```typescript
export function useModalPortal(component: React.ReactNode) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return createPortal(component, document.body);
}
```

**Benefits**:
- Modal renders to document.body (escapes parent overflow)
- Fixed positioning centers at viewport (not parent)
- max-h-[85vh] + overflow-auto prevents cutoff
- Always visible above sidebar (z-60 > z-40)
- Maintains Framer Motion animation support

### 4. Framer Motion Transitions

**AnimatePresence with `mode="wait"`**:
```typescript
<AnimatePresence mode="wait">
  {sidebarMode !== "hidden" && (
    <motion.div
      key={sidebarMode}  // Forces exit → enter
      initial={{ x: -256, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -256, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <Sidebar isSlim={sidebarMode === "slim"} />
    </motion.div>
  )}
</AnimatePresence>
```

**Benefits**:
- Smooth sidebar slide animation
- Exit completes before enter starts (mode="wait")
- 300ms duration for professional feel
- No layout jumps or content shifting
- 60 FPS performance target

---

## Implementation Phases

### Phase 1: Z-Index Audit (1-2 hours)
- [ ] Create `frontend/constants/zindex.ts` with explicit values
- [ ] Audit all components for competing z-indexes
- [ ] Update modal backdrop (z-50)
- [ ] Update modal content (z-60)
- [ ] Update sidebar (z-40)
- [ ] Update toggle button (z-45)
- [ ] Test: Modal appears above sidebar at all screen sizes

### Phase 2: Sidebar Refactor (2-3 hours)
- [ ] Create `useSidebarMode()` hook (state + localStorage)
- [ ] Update `Sidebar` component: add `isSlim` and `isMobile` props
- [ ] Refactor `dashboard/layout.tsx`:
  - [ ] Responsive positioning (relative desktop, fixed mobile)
  - [ ] Add AnimatePresence wrapper
  - [ ] Conditional content margin animation
  - [ ] Mobile backdrop overlay
  - [ ] Toggle button positioning
- [ ] Test: Toggle works smoothly on both screen sizes

### Phase 3: Modal Portal (1 hour)
- [ ] Create `hooks/useModalPortal.ts`
- [ ] Update `TaskDeleteModal` component:
  - [ ] Integrate useModalPortal
  - [ ] Verify z-index (z-50 backdrop, z-60 content)
  - [ ] Ensure max-h-[85vh] + overflow-auto
- [ ] Test: Modal centers at viewport, scrollable if needed

### Phase 4: Framer Motion Transitions (1 hour)
- [ ] Add AnimatePresence to sidebar wrapper
- [ ] Configure exit/enter animations
- [ ] Add width transition (256 ↔ 80px)
- [ ] Add margin transition (256/80/0px)
- [ ] Test: 60 FPS animations, no jank

### Phase 5: Integration Testing (1-2 hours)
- [ ] Test delete modal with new positioning
- [ ] Test sidebar toggle on desktop and mobile
- [ ] Verify no visual overlaps any screen size
- [ ] Test mobile backdrop closes sidebar
- [ ] Verify toggle always accessible
- [ ] Test state persists on page reload
- [ ] Verify all Task CRUD operations work

**Total Estimated Time**: 6-9 hours

---

## Files to Modify/Create

| File | Type | Purpose |
|------|------|---------|
| `frontend/constants/zindex.ts` | CREATE | Centralized z-index values |
| `frontend/hooks/useModalPortal.ts` | CREATE | Portal wrapper hook |
| `frontend/app/dashboard/layout.tsx` | MODIFY | Sidebar state + positioning |
| `frontend/components/layout/sidebar.tsx` | MODIFY | Responsive props + rendering |
| `frontend/components/tasks/task-delete-modal.tsx` | MODIFY | Portal integration |

---

## Success Criteria

- [x] Plan documented with all architectural decisions
- [ ] Modal centered at viewport center (all screen sizes)
- [ ] Modal not constrained by overflow-hidden containers
- [ ] Sidebar doesn't overlap content on desktop
- [ ] Mobile sidebar slides smoothly with backdrop
- [ ] Toggle button always accessible (z-45)
- [ ] Animations smooth (60 FPS, no layout jumps)
- [ ] State persists on page reload
- [ ] All Task CRUD operations work
- [ ] No TypeScript errors
- [ ] Build succeeds with 0 errors

---

## Risk Mitigation

| Risk | Mitigation | Priority |
|------|-----------|----------|
| Modal cutoff on small screens | Portal pattern + max-h-[85vh] + overflow-auto | HIGH |
| Sidebar overlap on desktop | Relative positioning + margin animation | HIGH |
| Z-index conflicts | Centralized constants, explicit hierarchy | HIGH |
| Animation jank | AnimatePresence mode="wait", 300ms duration | MEDIUM |
| Touch UX issues | Large button targets (40px+) | MEDIUM |
| State loss on reload | localStorage persistence | LOW |

---

## Testing Strategy

### Visual Testing
- Desktop 1920px: Sidebar full/slim, content adjusts proportionally
- Tablet 768px: Responsive transition smooth at breakpoint
- Mobile 375px: Sidebar hidden, toggle works, backdrop visible
- Modal: Centered at all screen sizes, no cutoff

### Functional Testing
- Delete modal: Opens, centered, buttons work, deletion succeeds
- Sidebar toggle: Smooth animation, state persists on reload
- Mobile backdrop: Click closes sidebar
- Scroll: Content doesn't hide behind modals

### Performance Testing
- Animations: 60 FPS (Chrome DevTools FPS meter)
- Modal open: < 100ms visual feedback
- Sidebar toggle: < 300ms animation duration
- Build: No TypeScript errors, no warnings

---

## Design Principles Maintained

✅ **Glassmorphic Theme**: #C94261 burgundy, dark backgrounds, backdrop-blur-sm
✅ **Responsive Design**: Mobile ≤768px, desktop ≥768px with smooth transitions
✅ **Performance**: 60 FPS animations, < 100ms feedback, < 300ms transitions
✅ **Accessibility**: Keyboard nav, aria-labels, focus management, large touch targets
✅ **State Persistence**: localStorage survives navigation and page reloads
✅ **No Breaking Changes**: Task CRUD, Auth, API contracts unchanged
✅ **Professional UX**: Smooth animations, no layout jank, clear visual hierarchy

---

## Next Steps

### Immediate
1. Review this plan and architecture.md
2. Run `/sp.tasks` to generate implementation tasks
3. Execute tasks with `/sp.implement`

### Post-Implementation
1. Manual testing on multiple devices
2. Lighthouse performance audit
3. User acceptance testing
4. Merge to main branch
5. Deploy to staging/production

---

## Artifacts

- **plan.md** - Updated with Phase 1.5 architectural refinements
- **architecture.md** - Complete technical specification with code examples
- **0023-plan-sidebar-modal-refactor.plan.prompt.md** - PHR documentation

---

## Conclusion

This comprehensive plan eliminates the root causes of component overlaps and layout issues through:
1. Explicit z-index hierarchy preventing conflicts
2. Responsive sidebar positioning (relative desktop, fixed mobile)
3. React Portal pattern for modals
4. AnimatePresence for smooth transitions

The plan is testable, measurable, and ready for implementation with clear success criteria and risk mitigation strategies.

**Status**: ✅ Ready for Task Generation

