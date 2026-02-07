# Research: UI Fidelity and Auth Routing Fixes

## Overview
Research into fixing critical UI and routing issues in the Plannoir frontend application, focusing on Tailwind CSS compilation, layout structure, and authentication routing.

## Tailwind CSS Compilation Issues

### Problem Analysis
- Current Tailwind CSS configuration may not be properly watching all component files
- Missing content paths in tailwind.config.ts causing "naked" HTML issue
- Classes like bg-deep-black and text-pink-red not being compiled

### Solution Approach
- Verify content paths in tailwind.config.ts include all necessary directories
- Update configuration to watch src/app/**/* and src/components/**/*
- Ensure color definitions are properly extended in theme configuration

## Layout Architecture

### Current Issue
- Metadata conflicts between server and client components
- "use client" directive causing issues with metadata export
- Need to separate server-side layout from client-side interactivity

### Proposed Solution: Layout Split
- RootLayout (Server Component): Handles metadata, head tags, and static layout
- ClientLayout (Client Component): Wraps interactive elements, Navbar, animations
- This resolves the metadata/use client conflict while maintaining framer-motion functionality

## Authentication Routing

### Problem Analysis
- Sign In/Sign Up routes resulting in 404 errors
- Missing dedicated route handlers for authentication flows
- Current modal-based approach may not be compatible with all navigation patterns

### Solution Approach
- Create dedicated route structure: /auth/signin and /auth/signup
- Implement proper Next.js App Router pages for authentication
- Maintain modal option as alternative for certain contexts

## PHR Recovery Process

### Current State
- Missing Prompt History Records for Phase 2 (002-frontend-auth) implementation
- Need to retroactively generate PHR entries to ensure complete audit trail
- History logs may be incomplete

### Recovery Strategy
- Generate PHR entries for all completed tasks in Phase 2
- Document the implementation decisions and outcomes
- Ensure history/ folder reflects completion of all phases

## Metadata Strategy

### Server vs Client Components
- SEO metadata (title, description) belongs in Server Components
- Interactive elements (Navbar with framer-motion) belong in Client Components
- Proper separation ensures optimal performance and functionality

## Technical Implementation Details

### Path Aliases
- Use absolute imports (@/app/globals.css) to prevent module resolution errors
- Configure tsconfig.json properly for path aliasing
- Ensure all CSS imports use consistent absolute paths

### Content Path Configuration
- Update tailwind.config.ts to include:
  - "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  - "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  - Any other relevant directories

### Route Structure
- Implement proper directory structure for authentication routes
- Ensure all navigation links point to correct destinations
- Verify routing works for both direct access and programmatic navigation