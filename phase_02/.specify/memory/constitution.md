<!--
Sync Impact Report
Version change: 1.0.0 -> 1.0.1
Modified principles:
- Spec-Driven Development (SDD) -> Absolute SDD Adherence
- User Isolation (Stateless Security) -> Security through Isolation
- Cinematic UI System -> Aesthetic Excellence
- Added: Stateless Reliability principle
Added sections:
- Technology Stack (updated with Next.js 16+, Typescript, Python FastAPI, UV, SQLModel, Neon Serverless PostgreSQL, Better auth, shadcnui, lucide-react)
- Authentication Standard (Better Auth with JWT plugin)
- API Architecture (RESTful endpoints with /api/{user_id}/tasks pattern)
- Folder Structure (/frontend and /backend directories)
- Shared Secret (BETTER_AUTH_SECRET environment variable)
- Constraints (No Manual Coding, Database Restriction, Auth Implementation)
- Success Criteria (User Privacy, Visual Fidelity, Stateless Auth, Functional Completeness)
Templates requiring updates:
- ✅ .specify/templates/plan-template.md: Updated Constitution Check gate references.
- ✅ .specify/templates/spec-template.md: Aligned with SDD and Success Criteria requirements.
- ✅ .specify/templates/tasks-template.md: Reflected task orchestration and user isolation constraints.
- ✅ .specify/templates/phr-template.prompt.md: Updated to reflect new principles
Follow-up TODOs: None.
-->

# Plannoir - Premium AI-Native Todo Full-Stack Web Application Constitution

## Core Principles

### I. Absolute SDD Adherence
Every change MUST follow the Specify → Plan → Implement lifecycle to eliminate vibe-coding. No implementation work may begin without a completed and reviewed spec, plan, and task list. This ensures technical decisions are documented and aligned before execution.

### II. Multi-Agent Orchestration
Utilize specialized agents for development tasks:
- `agent-architect`: System-wide coordination.
- `api-backend-architect`: FastAPI and SQLModel implementation.
- `project-architect`: Feature definition and spec management.
- `frontend-cinematic-engineer`: Next.js and Tailwind UI development.
Each agent operates within its defined domain to maintain specialized expertise and high-performance output.

### III. Security through Isolation
Mandatory user isolation via shared-secret JWT verification between Better Auth and FastAPI. Stateless JWT verification is mandatory for every database operation. Every backend request MUST extract the `user_id` from the high-integrity JWT and use it as a mandatory filter in all SQLModel queries. Cross-tenant data leaks are a critical failure condition.

### IV. No Manual Coding
Claude Code MUST generate all implementation based on approved tasks. Manual interventions or untracked changes are strictly forbidden. All logic must be traceable to a prompt history record and a corresponding task.

### V. Monorepo Hygiene
Maintain strict separation between `/frontend` (Next.js 16) and `/backend` (FastAPI). Shared logic must be explicitly moved to a shared directory if required, but logical boundaries must remain firm to prevent spaghetti architecture.

### VI. Aesthetic Excellence
High-fidelity, premium "classy" UI matching the glowy dark theme of the provided reference image. The UI MUST strictly adhere to the premium dark theme specifications:
- **BG**: #26131B, **Primary**: #C94261, **Surface**: #2F1A22.
- **Effects**: Radial gradients with bottom focus, glassmorphism cards, and glowing interactive elements.
- **Goal**: Provide a "cinematic" and immersive user experience matching `reference-img/reference.png`.

### VII. Stateless Reliability
Backend MUST verify authentication independently without shared database sessions. Stateful session storage is prohibited; all authentication must be handled through stateless JWT verification using the shared secret.

## Security & Auth Requirements

### Auth Protocol (Better Auth + JWS)
- Authentication is handled by Better Auth on the frontend with the JWT plugin enabled.
- Secure handoff to the FastAPI backend is achieved using manual JWT verification on the backend using the shared `BETTER_AUTH_SECRET`.
- Frontend MUST NOT access the database directly; all persistence goes through the FastAPI layer.

### Auth Architecture Requirements
- **Database**: Standardize on Neon Serverless PostgreSQL. No SQLite fallbacks allowed.
- **Architecture**: Strict separation of 'auth.ts' (Server Instance) and 'auth-client.ts' (React Client).
- **JWT Bridge**: The JWT plugin must be active on the frontend to support the FastAPI 'Authorization' header verification.
- **Route Handling**: The 'api/auth/[...all]' route must use the proper handler pattern.
- **Reliability**: All 'auth' exports must be constant objects to prevent 'auth is not a function' TypeErrors.

### Endpoint Consistency
- API endpoints MUST match the specified pattern exactly: `/api/{user_id}/tasks`.
- Global middleware MUST handle all exceptions; `try-catch` blocks in route handlers are forbidden to ensure consistent error responses.

## Technical Stack

- **Frontend**: Next.js 16+, Typescript, Tailwind CSS, shadcnui, lucide-react.
- **Backend**: Python FastAPI, SQLModel.
- **Database**: Neon Serverless PostgreSQL.
- **Identity**: Better Auth with JWT Bridge.

## Authentication Standard

- Better Auth with the JWT plugin enabled on frontend.
- Manual JWT verification on backend using the shared secret.
- Unified `BETTER_AUTH_SECRET` environment variable across both services for token signature verification.

## API Architecture

- RESTful endpoints following the `/api/{user_id}/tasks` pattern.
- All backend endpoints must require a valid JWT token and return 401 Unauthorized otherwise.

## Folder Structure

- Strict physical separation between `/backend` and `/frontend` directories.
- Clear boundaries between frontend and backend code to maintain separation of concerns.

## Shared Secret

- Unified `BETTER_AUTH_SECRET` environment variable across both frontend and backend services.
- Used for JWT token signature verification between Better Auth and FastAPI.

## Constraints

- No Manual Coding: All code generation must be executed via agentic sub-agents based on approved specs and plans.
- Database Restriction: Primary storage must be Neon PostgreSQL; local SQLite fallbacks are strictly prohibited.
- Auth Implementation: All backend endpoints must require a valid JWT token and return 401 Unauthorized otherwise.

## Success Criteria

- User Privacy: Each user can only see, create, and modify their own tasks based on their authenticated ID.
- Visual Fidelity: The frontend interface successfully replicates the premium glowy aesthetic and color palette of the reference image.
- Stateless Auth: Backend successfully decodes and verifies JWTs using only the shared secret.
- Functional Completeness: All 5 core todo features (List, Create, Detail, Update, Delete/Toggle) fully operational.

## Governance

1. This Constitution is the supreme governing document for the Plannoir project.
2. Every implementation Pull Request MUST be audited against these principles.
3. Amendments requires a major version bump and a migration plan for existing code.
4. Non-compliant code will be rejected at the gate and must be refactored to align with the core principles.

**Version**: 1.0.1 | **Ratified**: 2025-12-31 | **Last Amended**: 2026-01-07
