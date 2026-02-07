# Implementation Plan: Fix UI Fidelity and Auth Routing for Plannoir

**Branch**: `003-ui-fix-auth-routing` | **Date**: 2026-01-07 | **Spec**: [specs/003-ui-fix-auth-routing/spec.md](file:///mnt/d/phase-2/specs/003-ui-fix-auth-routing/spec.md)
**Input**: Feature specification from `/specs/003-ui-fix-auth-routing/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Address critical UI and routing issues in the Plannoir frontend application. This involves fixing Tailwind CSS compilation problems to restore the "Fliki-style" aesthetic with proper dark theme (#0a0a0a background, #e11d48 pink-red accents), resolving authentication routing errors that cause 404 pages, and implementing a proper layout structure that separates server and client components to resolve metadata conflicts.

## Technical Context

**Language/Version**: TypeScript, Next.js 16+
**Primary Dependencies**: Next.js App Router, React, Tailwind CSS, Framer Motion, Better Auth
**Storage**: Browser local storage for auth state (via Better Auth)
**Testing**: Jest, React Testing Library
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)
**Project Type**: web - frontend application
**Performance Goals**: <3s initial page load, <100ms interactive elements response
**Constraints**: Strict adherence to color palette #0a0a0a (Deep Black) and #e11d48 (Pink-Red), proper metadata handling in Server Components, all code in /frontend directory
**Scale/Scope**: Single-user task management interface

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] I. Absolute SDD Adherence compliance
- [x] II. Multi-Agent Orchestration alignment
- [x] III. Security through Isolation verification
- [x] IV. No Manual Coding enforcement
- [x] V. Monorepo Hygiene (frontend/backend separation)
- [x] VI. Aesthetic Excellence (#0a0a0a, #e11d48, and glow effects)
- [x] VII. Stateless Reliability verification
- [x] Auth: Better Auth + JWT Bridge with shared secret
- [x] Tech Stack: Next.js 16+, TypeScript, Tailwind CSS, Better Auth, Shadcn/UI, Lucide React, Framer Motion

## Project Structure

### Documentation (this feature)

```text
specs/003-ui-fix-auth-routing/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root server layout
│   │   ├── ClientLayout.tsx        # Client-side layout wrapper
│   │   ├── page.tsx                # Landing page
│   │   ├── auth/
│   │   │   ├── signin/
│   │   │   │   └── page.tsx        # Sign in page
│   │   │   └── signup/
│   │   │       └── page.tsx        # Sign up page
│   │   ├── features/
│   │   │   └── page.tsx            # Features page
│   │   ├── use-cases/
│   │   │   └── page.tsx            # Use cases page
│   │   └── dashboard/
│   │       ├── layout.tsx          # Dashboard layout
│   │       └── page.tsx            # Dashboard page
│   ├── components/
│   │   ├── ui/                     # Shadcn/UI components
│   │   ├── auth/                   # Authentication components
│   │   ├── navigation/             # Navigation components
│   │   ├── landing/                # Landing page components
│   │   └── dashboard/              # Dashboard components
│   ├── lib/
│   │   ├── auth.ts                 # Auth utilities
│   │   ├── api.ts                  # API client with JWT handling
│   │   └── utils.ts                # General utilities
│   ├── hooks/
│   │   └── useAuth.ts              # Authentication hook
│   └── styles/
│       └── globals.css             # Tailwind and custom styles
├── public/
│   └── images/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

**Structure Decision**: Web application structure with clear separation of public and protected routes using Next.js App Router. The project maintains separation from backend code. Authentication routing is properly configured with dedicated sign-in and sign-up pages to resolve 404 errors. Layout components are split between server and client to resolve metadata conflicts while maintaining framer-motion interactivity.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

## PHR Recovery

### Current State
- Missing Prompt History Records for Phase 2 (002-frontend-auth) implementation
- Need to retroactively generate PHR entries to ensure complete audit trail
- History logs may be incomplete

### Recovery Strategy
- Generate PHR entries for all completed tasks in Phase 2
- Document the implementation decisions and outcomes
- Ensure history/ folder reflects completion of all phases
- Follow the PHR creation process: detect stage → generate title → resolve route → create file with all placeholders filled

## Tailwind Restoration

### Current Issue
- Tailwind CSS configuration may not be properly watching all component files
- Missing content paths in tailwind.config.ts causing "naked" HTML issue
- Classes like bg-deep-black and text-pink-red not being compiled
- Color definitions may not be properly extended in theme configuration

### Solution Approach
- Verify content paths in tailwind.config.ts include all necessary directories
- Update configuration to watch src/app/**/* and src/components/**/*
- Ensure color definitions are properly extended in theme configuration
- Update tailwind.config.ts to include:
  - "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  - "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  - Any other relevant directories

## Layout Decoupling

### Current Issue
- Metadata conflicts between server and client components
- "use client" directive causing issues with metadata export
- Need to separate server-side layout from client-side interactivity
- Current approach may not comply with Next.js App Router requirements

### Solution Approach
- RootLayout (Server Component): Handles metadata, head tags, and static layout
- ClientLayout (Client Component): Wraps interactive elements, Navbar, animations
- This resolves the metadata/use client conflict while maintaining framer-motion functionality
- Proper separation ensures optimal performance and functionality
- SEO metadata (title, description) belongs in Server Components
- Interactive elements (Navbar with framer-motion) belong in Client Components

## Route Mapping

### Current Issue
- Sign In/Sign Up routes resulting in 404 errors
- Missing dedicated route handlers for authentication flows
- Current modal-based approach may not be compatible with all navigation patterns
- Navigation links may point to incorrect destinations

### Solution Approach
- Create dedicated route structure: /auth/signin and /auth/signup
- Implement proper Next.js App Router pages for authentication
- Maintain modal option as alternative for certain contexts
- Ensure all navigation links point to correct destinations
- Verify routing works for both direct access and programmatic navigation
- Implement proper directory structure for authentication routes

## Quickstart

### Development Setup
1. Ensure Node.js 18+ and npm are installed
2. Navigate to the frontend directory: `cd frontend`
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`
5. Verify Tailwind CSS is compiling properly by checking for bg-deep-black and text-pink-red classes
6. Test authentication routes at /auth/signin and /auth/signup

### Key Commands
- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint to check for code issues
- `npm run tailwind:watch` - Watch Tailwind CSS changes (if needed separately)

### Testing the Fixes
1. Visit the homepage and verify the pitch-black background (#0a0a0a) appears
2. Check that radial glow effects and glassmorphism navbar are visible
3. Navigate to /auth/signin and /auth/signup to verify routes work without 404 errors
4. Test that metadata is properly exported from Server Components
5. Verify framer-motion animations work in Client Components

## Contracts

### API Contracts
- Authentication endpoints: `/api/auth/signin` and `/api/auth/signup`
- JWT token handling through Better Auth integration
- Session management using browser storage
- API response structure follows the defined interfaces in data-model.md

### UI Component Contracts
- RootLayout component exports metadata properly as Server Component
- ClientLayout wraps interactive elements with "use client" directive
- Navigation components properly route to /auth/signin and /auth/signup
- Tailwind CSS classes bg-deep-black and text-pink-red are properly compiled
- Responsive design maintains flex/grid layouts across screen sizes

### Integration Contracts
- Next.js App Router properly handles route resolution
- Better Auth integration maintains session state across components
- Framer Motion animations work seamlessly with Server/Client component split
- Tailwind CSS configuration watches all necessary file paths
- Path aliasing uses absolute imports (@/...) for consistent module resolution