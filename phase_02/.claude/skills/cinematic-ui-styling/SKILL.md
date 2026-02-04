---
name: cinematic-ui-styling
description: Implements a premium dark cinematic aesthetic with specific brand colors (#26131B, #C94261), glassmorphism, and radial gradients in Next.js/Tailwind CSS projects. Use this skill when requested to apply or implement cinematic visual styles, premium dark themes, or specific glass-based UI components.
---

# Cinematic UI Styling

This skill enables the implementation of a "premium dark cinematic" aesthetic consistently across Next.js components and Tailwind configurations.

## Summary
The purpose of this skill is to provide a unified visual language characterized by deep wine-dark backgrounds, vibrant primary accents, and layered transparency.

## Technical Prerequisites
- **Next.js 16+** (App Router functionality)
- **Typescript**
- **Tailwind CSS 3.4+** (Modern utility classes)
- **Lucide React** (Consistent iconography)
- **Framer Motion** (Optional, for smooth transitions)

## Implementation Instructions

### 1. Tailwind Configuration
Update your `tailwind.config.ts` to core brand colors and gradients into the theme.

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        background: '#26131B', // Deep cinematic wine
        primary: '#C94261',    // Vibrant accent
        secondary: '#3D1E2A',  // Mid-tone for layering
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      }
    }
  }
};
export default config;
```

### 2. Radial Glow Gradients (Vignette)
A **vignette** is a photographic technique where the edges of the image are darkened to draw the viewer's eye to the center. Use this to create focus and depth.

```tsx
// Create a background vignette layer
export const CinematicBackground = () => (
  <div className="fixed inset-0 z-0 bg-background overflow-hidden">
    {/* The radial vignette */}
    <div className="absolute inset-0 bg-radial-glow from-transparent via-background/40 to-background pointer-events-none" />

    {/* Subtle primary glow source */}
    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
  </div>
);
```

### 3. Glassmorphism Cards
**Glassmorphism** is a design style that uses background blur and semi-transparent layers to mimic the appearance of frosted glass.

```tsx
// Card component with glass effect
export const CinematicCard = ({ children }: { children: React.ReactNode }) => (
  <div className="relative group">
    {/* Subtle outer glow on hover */}
    <div className="absolute -inset-0.5 bg-primary/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />

    <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
      {children}
    </div>
  </div>
);
```

## Troubleshooting

- **Z-Index Overlaps**: If buttons are unclickable, ensure your `radial-glow` or vignette layer has the `pointer-events-none` class.
- **Color Mismatch**: If the primary color (#C94261) looks different on different screens, check if you have global CSS filters (like grayscale or sepia) applied to the `html` or `body`.
- **Blur Performance**: Applying `backdrop-blur` to too many elements can impact scrolling performance on mobile. Use it selectively for primary UI surfaces.
- **Text Contrast**: Text on glass layers should use at least `text-white/80` to maintain readability against the dark background.
