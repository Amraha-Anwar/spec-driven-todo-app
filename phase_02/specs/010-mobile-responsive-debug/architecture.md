# Architecture: Sidebar & Modal Refactor (Feature 010)

**Feature**: 010-mobile-responsive-debug
**Branch**: `010-mobile-responsive-debug`
**Updated**: 2026-02-06
**Status**: Planning Phase

---

## Executive Summary

Refactor the dashboard layout to eliminate component overlaps and create a professional, fluid sidebar behavior using:
1. **Z-Index Audit** - Explicit layering (Sidebar: z-40, Modal: z-60)
2. **Sidebar Refactor** - Responsive positioning (relative on desktop, fixed on mobile)
3. **Modal Portal** - Break out of overflow-hidden containers
4. **Framer Motion** - Smooth AnimatePresence transitions

---

## 1. Z-Index Hierarchy

### Complete Layer Map

```
z-60  ┌─────────────────────────────────────┐
      │ Modal Content (Delete Confirmation) │
      │ - Centered via flex                 │
      │ - Scrollable if needed              │
      └─────────────────────────────────────┘

z-50  ┌─────────────────────────────────────┐
      │ Modal Backdrop (Dark overlay)       │
      │ - Fixed, inset-0                    │
      │ - Clicking closes modal             │
      └─────────────────────────────────────┘

z-45  ┌─────────────────────────────────────┐
      │ Toggle Button (Menu/X icon)         │
      │ - Fixed positioning                 │
      │ - Always accessible                 │
      └─────────────────────────────────────┘

z-40  ┌─────────────────────────────────────┐
      │ Sidebar (Full/Slim/Hidden)          │
      │ - relative on desktop               │
      │ - fixed on mobile                   │
      │ - AnimatePresence for transitions   │
      └─────────────────────────────────────┘

z-30  ┌─────────────────────────────────────┐
      │ Mobile Backdrop (Sidebar overlay)   │
      │ - Fixed, inset-0                    │
      │ - Click to close sidebar            │
      └─────────────────────────────────────┘

z-10  ┌─────────────────────────────────────┐
      │ Main Content Area                   │
      │ - Adjusts margin-left on desktop    │
      │ - Full-width on mobile              │
      └─────────────────────────────────────┘

z-0   ┌─────────────────────────────────────┐
      │ Background Gradients (pointer-events-none)
      │ - Pink/purple glassmorphic effects  │
      └─────────────────────────────────────┘
```

### Rules

1. **Sidebar** never competes with modal z-indexes
2. **Toggle button** sits between sidebar and modal backdrop
3. **Mobile backdrop** only exists when sidebar is open (mobile)
4. **Content area** uses default z-10, never overlaps modal
5. **All fixed elements** use explicit z-index, never rely on stacking context

---

## 2. Sidebar Architecture

### 2.1 Component Structure

```typescript
// dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarMode, setSidebarMode] = useState<"full" | "slim" | "hidden">("full");
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle logic: mobile (full↔hidden), desktop (full↔slim)
  const toggleSidebar = () => {
    let newMode: "full" | "slim" | "hidden";
    if (isMobile) {
      newMode = sidebarMode === "full" ? "hidden" : "full";
    } else {
      newMode = sidebarMode === "full" ? "slim" : "full";
    }
    setSidebarMode(newMode);
    localStorage.setItem("dashboardSidebarMode", JSON.stringify(newMode));
  };

  return (
    <div className="min-h-screen">
      {/* Toggle Button - always accessible */}
      <motion.button
        onClick={toggleSidebar}
        className="fixed z-45 ..."
      />

      {/* Sidebar - conditional positioning */}
      <AnimatePresence mode="wait">
        {sidebarMode !== "hidden" && (
          <motion.div
            key={sidebarMode}
            className={isMobile ? "fixed z-40" : "relative z-40"}
            animate={{ width: sidebarMode === "slim" ? 80 : 256 }}
          >
            <Sidebar isSlim={sidebarMode === "slim"} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Backdrop - only mobile, only when full */}
      {isMobile && sidebarMode === "full" && (
        <motion.div
          className="fixed inset-0 bg-black/60 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Content Area - adjusts margin only on desktop */}
      <motion.div
        animate={{
          marginLeft: isMobile ? 0 : (sidebarMode === "hidden" ? 0 : (sidebarMode === "slim" ? 80 : 256))
        }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}
```

### 2.2 Key Decisions

| Decision | Desktop Behavior | Mobile Behavior | Rationale |
|----------|-----------------|-----------------|-----------|
| **Sidebar Positioning** | `relative` | `fixed` | Desktop pushes content; mobile overlays |
| **Toggle Behavior** | full ↔ slim | full ↔ hidden | Space efficiency vs screen real estate |
| **Backdrop** | None | Shows when full | Mobile needs visual separation |
| **Content Margin** | Animated 256/80/0 | Always 0 | Only desktop needs adjustment |
| **Sidebar Width** | 256px (full) / 80px (slim) | 256px (full) / hidden | Slim mode desktop-only |

### 2.3 Sidebar Component Updates

```typescript
// components/layout/sidebar.tsx
interface SidebarProps {
  isSlim?: boolean;
  isMobile?: boolean;
}

export function Sidebar({ isSlim = false, isMobile = false }: SidebarProps) {
  return (
    <motion.div
      className={`
        h-screen glassmorphic-3d border-r border-white/10 flex flex-col z-40
        ${isMobile && isSlim ? "hidden" : ""}
        ${!isMobile && isSlim ? "w-20" : "w-64"}
      `}
    >
      {/* Logo - adaptive */}
      {!isSlim ? <h1>Plannoir</h1> : <div className="w-8 h-8">P</div>}

      {/* Navigation - conditional labels */}
      {navigation.map(item => (
        <Link key={item.name} title={isSlim ? item.name : undefined}>
          <item.icon />
          {!isSlim && <span>{item.name}</span>}
        </Link>
      ))}
    </motion.div>
  );
}
```

---

## 3. Modal Portal Pattern

### 3.1 useModalPortal Hook

```typescript
// hooks/useModalPortal.ts
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function useModalPortal(component: React.ReactNode, container?: HTMLElement) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const target = container || document.body;
  return createPortal(component, target);
}
```

### 3.2 Modal Component Update

```typescript
// components/tasks/task-delete-modal.tsx
export function TaskDeleteModal({
  isOpen,
  taskTitle,
  onConfirm,
  onCancel,
}: TaskDeleteModalProps) {
  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onCancel}
          />

          {/* Modal Container - Fixed positioning ensures centering */}
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              className="w-full max-w-md max-h-[85vh] overflow-auto glassmorphic-3d"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {/* Modal content */}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  // Portal breaks modal out of overflow-hidden containers
  return useModalPortal(modalContent);
}
```

### 3.3 Benefits

✅ Modal never constrained by parent overflow
✅ Centered at viewport center, not parent center
✅ Scrollable if content exceeds viewport
✅ Always visible above sidebar and other content
✅ Maintains Framer Motion animation support

---

## 4. Framer Motion Transitions

### 4.1 AnimatePresence for Sidebar

```typescript
<AnimatePresence mode="wait">
  {sidebarMode !== "hidden" && (
    <motion.div
      key={sidebarMode}  // Forces exit/enter when mode changes
      initial={{ x: -256, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -256, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative z-40"
    >
      <Sidebar isSlim={sidebarMode === "slim"} />
    </motion.div>
  )}
</AnimatePresence>
```

**Why `mode="wait"`**: Ensures exit animation completes before enter animation starts, preventing visual glitches.

### 4.2 Width Animation

```typescript
<motion.div
  animate={{ width: sidebarMode === "slim" ? 80 : 256 }}
  transition={{ duration: 0.3, ease: "easeInOut" }}
>
```

### 4.3 Content Margin Animation

```typescript
<motion.div
  animate={{
    marginLeft: isMobile ? 0 : (sidebarMode === "hidden" ? 0 : (sidebarMode === "slim" ? 80 : 256))
  }}
  transition={{ duration: 0.3, ease: "easeInOut" }}
>
```

---

## 5. Implementation Checklist

### Phase 1: Z-Index Audit
- [ ] Document all z-index values in constants file
- [ ] Audit existing components for competing z-indexes
- [ ] Update all modal-related z-indexes (50, 60)
- [ ] Update sidebar z-index (40, fixed positioning)
- [ ] Update toggle button z-index (45)
- [ ] Test modal appears above sidebar on all screen sizes

### Phase 2: Sidebar Refactor
- [ ] Create `useSidebarMode` hook with localStorage persistence
- [ ] Update Sidebar component to accept `isSlim` prop
- [ ] Refactor dashboard/layout.tsx with conditional positioning
- [ ] Test desktop: full → slim → full transition
- [ ] Test mobile: full → hidden → full transition
- [ ] Test responsive behavior at 768px breakpoint
- [ ] Verify content doesn't overlap sidebar on any screen size

### Phase 3: Modal Portal
- [ ] Create `useModalPortal` hook
- [ ] Update TaskDeleteModal to use portal
- [ ] Test modal doesn't get cut off at viewport edges
- [ ] Test modal is scrollable if content exceeds viewport
- [ ] Verify modal appears above sidebar (z-60 > z-40)

### Phase 4: Framer Motion Transitions
- [ ] Add AnimatePresence wrapper around sidebar
- [ ] Configure exit/enter animations for mode changes
- [ ] Test smooth transitions on all mode changes
- [ ] Verify no layout jumps or content shifting
- [ ] Performance test: 60 FPS animations

### Phase 5: Integration Testing
- [ ] Delete modal functionality works with new positioning
- [ ] Sidebar toggle works on desktop and mobile
- [ ] No visual overlaps at any viewport size
- [ ] Mobile backdrop clicks close sidebar
- [ ] Toggle button always accessible
- [ ] State persists on page reload

---

## 6. Code References

### Files to Modify

1. **frontend/app/dashboard/layout.tsx**
   - Add `useSidebarMode` hook logic
   - Implement conditional positioning
   - Add AnimatePresence wrapper
   - Update z-index values

2. **frontend/components/layout/sidebar.tsx**
   - Add `isSlim` and `isMobile` props
   - Conditional rendering for logo, labels
   - Update width/padding based on mode

3. **frontend/components/tasks/task-delete-modal.tsx**
   - Integrate `useModalPortal` hook
   - Verify z-index values (50, 60)
   - Test centering on all viewports

4. **frontend/hooks/useModalPortal.ts** (NEW)
   - Create portal hook for modal rendering

5. **frontend/constants/zindex.ts** (NEW - Optional)
   - Centralize z-index values for easy reference

---

## 7. Testing Strategy

### Visual Testing
- [ ] Desktop (1920px): Sidebar full/slim, content adjusts
- [ ] Tablet (768px): Responsive transition smooth
- [ ] Mobile (375px): Sidebar hidden, toggle works
- [ ] Modal: Centered on all screen sizes

### Functional Testing
- [ ] Delete task: Modal appears, buttons work, deletion succeeds
- [ ] Sidebar toggle: Smooth animation, state persists
- [ ] Mobile backdrop: Click closes sidebar
- [ ] Scroll: Content doesn't hide behind modals

### Performance Testing
- [ ] Animations: 60 FPS (no jank)
- [ ] Modal open: < 100ms visual feedback
- [ ] Sidebar toggle: < 300ms animation
- [ ] Build: No new warnings, TypeScript 0 errors

---

## 8. Risk Mitigation

| Risk | Mitigation | Owner |
|------|-----------|-------|
| Modal cutoff on small screens | Portal pattern + max-h-[85vh] | Frontend |
| Sidebar overlap on desktop | `relative` positioning + margin animation | Frontend |
| Z-index conflicts | Centralized constants, clear hierarchy | Frontend |
| Animation performance | 300ms duration, `easeInOut`, no simultaneous animations | Framer Motion |
| Mobile touch UX | Large touch targets (40px+ buttons) | UX |

---

## 9. Success Criteria

✅ Modal centered at viewport center at all screen sizes
✅ Sidebar doesn't overlap content on desktop
✅ Mobile sidebar slides smoothly with backdrop
✅ Toggle button always accessible (z-45)
✅ Animations smooth (60 FPS, no layout jumps)
✅ State persists on reload (localStorage)
✅ All existing Task CRUD operations work
✅ No TypeScript errors, build succeeds

