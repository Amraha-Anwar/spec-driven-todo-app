# Implementation Plan: Plannoir Premium Frontend & Authentication Bridge

**Branch**: `002-frontend-auth` | **Date**: 2026-01-07 | **Spec**: [specs/002-frontend-auth/spec.md](file:///mnt/d/phase-2/specs/002-frontend-auth/spec.md)
**Input**: Feature specification from `/specs/002-frontend-auth/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a premium frontend for Plannoir using Next.js 16 App Router with high-fidelity "Fliki-style" UI. The implementation will include public landing page sections (Hero, Features, Use Cases) and a protected dashboard for authenticated users. Better Auth will be integrated with JWT plugin for secure communication with the backend API, and the design will follow the specified color palette (#0a0a0a, #e11d48) with glassmorphism and radial glow effects.

## Technical Context

**Language/Version**: TypeScript, Next.js 16
**Primary Dependencies**: Next.js App Router, React, Tailwind CSS, Better Auth, Shadcn/UI, Lucide React, Framer Motion
**Storage**: Browser local storage for auth state (via Better Auth)
**Testing**: Jest, React Testing Library
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)
**Project Type**: web - frontend application
**Performance Goals**: <3s initial page load, <100ms interactive elements response
**Constraints**: Strict adherence to color palette #0a0a0a (Deep Black) and #e11d48 (Pink-Red), JWT-based authentication, all code in /frontend directory
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
specs/002-frontend-auth/
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
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing page (public)
│   │   ├── dashboard/
│   │   │   ├── page.tsx       # Protected dashboard
│   │   │   └── layout.tsx     # Dashboard layout
│   │   ├── features/
│   │   │   └── page.tsx       # Features page (public)
│   │   └── use-cases/
│   │       └── page.tsx       # Use cases page (public)
│   ├── components/
│   │   ├── ui/                # Shadcn/UI components
│   │   ├── auth/              # Authentication components
│   │   ├── navigation/        # Navigation components
│   │   ├── landing/           # Landing page components
│   │   └── dashboard/         # Dashboard components
│   ├── lib/
│   │   ├── auth.ts            # Auth utilities
│   │   ├── api.ts             # API client with JWT handling
│   │   └── utils.ts           # General utilities
│   ├── hooks/
│   │   └── useAuth.ts         # Authentication hook
│   └── styles/
│       └── globals.css        # Tailwind and custom styles
├── public/
│   └── images/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

**Structure Decision**: Web application structure with clear separation of public and protected routes using Next.js App Router. The project will be created in a frontend/ directory to maintain separation from backend code. Authentication guard components will protect dashboard routes while allowing public access to landing, features, and use cases pages.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |