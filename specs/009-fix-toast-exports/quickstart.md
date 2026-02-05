# Quickstart: Fix Vercel Deployment Type Errors

**Feature**: 009-fix-toast-exports
**Date**: 2026-02-04

## What This Fix Does

Adds two missing named exports (`showErrorToast`, `showSuccessToast`) to `phase_02/frontend/components/ui/toast.tsx` so that the login and signup form components can import them without causing TypeScript build errors.

## Single File Change

**File**: `phase_02/frontend/components/ui/toast.tsx`

**Before** (current — broken):
```tsx
"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: "rgba(20, 20, 30, 0.9)",
          border: "1px solid rgba(225, 29, 72, 0.3)",
          color: "#fff",
          backdropFilter: "blur(20px)",
        },
      }}
    />
  );
}
```

**After** (fixed):
```tsx
"use client";

import { Toaster as Sonner, toast } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: "rgba(20, 20, 30, 0.9)",
          border: "1px solid rgba(225, 29, 72, 0.3)",
          color: "#fff",
          backdropFilter: "blur(20px)",
        },
      }}
    />
  );
}

export function showSuccessToast(message: string) {
  toast.success(message);
}

export function showErrorToast(message: string) {
  toast.error(message);
}
```

## Verification

```bash
cd phase_02/frontend
npx tsc --noEmit    # Must exit 0
npm run build        # Must exit 0
```

## What Stays Unchanged

- All UI layouts, CSS, and visual components
- Authentication logic (Better Auth + JWT bridge)
- Backend API connectivity
- UUID and user_id handling
- The existing `Toaster` component export
- The `lib/toast.ts` utility (used by other components)
