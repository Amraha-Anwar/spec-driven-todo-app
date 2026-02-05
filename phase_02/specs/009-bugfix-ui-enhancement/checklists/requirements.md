# Requirements Checklist: 009-bugfix-ui-enhancement

## Bug Fixes (P1)

- [x] **FR-001**: Fix 500 error on task operations (dict access pattern in `tasks.py`)
- [x] **FR-002**: Fix build-breaking imports in `login-form.tsx` and `signup-form.tsx`
- [x] **FR-003**: Fix broken imports in `user-menu.tsx`
- [x] **FR-004**: Surface specific backend error messages in auth toasts
- [x] **FR-005**: Add network error fallback message

## Settings Persistence (P2)

- [x] **FR-006**: Call `authClient.updateUser({ name })` on Settings save
- [x] **FR-007**: Refresh session data after save so sidebar reflects changes
- [x] **FR-008**: Show specific toast on save success/failure

## UI Enhancement (P3)

- [x] **FR-009**: Landing page matches reference.png layout
- [x] **FR-010**: Landing page uses professional Plannoir copy
- [x] **FR-011**: Features page uses Plannoir-specific descriptions
- [x] **FR-012**: Landing page includes #about and #pricing sections
- [x] **FR-013**: All UI uses existing Tailwind utilities only
- [x] **FR-014**: All UI changes are mobile-responsive

## Success Criteria

- [x] **SC-001**: `npx next build` exit code 0
- [x] **SC-002**: Task CRUD returns 2xx (no 500s)
- [x] **SC-003**: Auth errors are specific and actionable
- [x] **SC-004**: Settings name persists across refresh
- [x] **SC-005**: Landing matches reference.png structure
- [x] **SC-006**: Professional Plannoir copy on all pages
- [x] **SC-007**: No horizontal overflow at 375px viewport
