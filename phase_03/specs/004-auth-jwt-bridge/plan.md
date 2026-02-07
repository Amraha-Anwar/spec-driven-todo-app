# Implementation Plan: Better Auth JWT Bridge

**Branch**: `004-auth-jwt-bridge` | **Date**: 2026-01-11 | **Spec**: [specs/004-auth-jwt-bridge/spec.md](./spec.md)
**Input**: Feature specification from `specs/004-auth-jwt-bridge/spec.md`

## Summary

Implement a secure, full-stack authentication bridge between Better Auth (Frontend) and FastAPI (Backend) using stateless JWT verification and a consistent Neon DB schema. Key components include atomic user signup, strict foreign key constraints (Cascade Delete), and protected task management endpoints that enforce user data isolation.

## Technical Context

**Language/Version**: Python 3.11+, TypeScript 5+
**Primary Dependencies**: `better-auth` (Next.js), `jwt-fastapi-bridge` (FastAPI), `sqlmodel`
**Storage**: Neon Serverless PostgreSQL
**Testing**: `pytest` (Backend), `playwright` (E2E)
**Target Platform**: Vercel (Frontend), Railway/Render (Backend)
**Project Type**: Full-stack Web Application (Next.js + FastAPI)
**Performance Goals**: Auth verification < 5ms, API Latency < 100ms
**Constraints**: Strict separation of concerns, Shared Secret (`BETTER_AUTH_SECRET`)
**Scale/Scope**: Multi-user support, 100% test coverage for auth flows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Absolute SDD Adherence**: Spec and Plan created before code.
- [x] **Multi-Agent Orchestration**: Tasks will be assigned to specialized agents.
- [x] **Security through Isolation**: JWT verification mandatory for all DB ops.
- [x] **No Manual Coding**: All implementation via agents.
- [x] **Monorepo Hygiene**: Strict `backend/` vs `frontend/` separation.
- [x] **Aesthetic Excellence**: UI changes out of scope, but logic supports it.
- [x] **Stateless Reliability**: No backend sessions, pure JWT verification.

## Project Structure

### Documentation (this feature)

```text
specs/004-auth-jwt-bridge/
├── plan.md              # This file
├── research.md          # Technical decisions (ID mapping, FK constraints)
├── data-model.md        # Schema definitions (User, Task, etc.)
├── quickstart.md        # Setup and verification steps
├── contracts/           
│   └── openapi.yaml     # API Specification
└── tasks.md             # To be created by /sp.tasks
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   │   ├── auth/        # Auth route handlers (if any backend specific)
│   │   └── tasks.py     # Task endpoints (protected)
│   ├── core/
│   │   └── security.py  # JWT verification logic
│   ├── db/              # Database connection
│   └── models/          # SQLModel classes (User, Task)
└── tests/
    ├── integration/     # API tests
    └── unit/            # Logic tests

frontend/
├── app/
│   └── api/
│       └── auth/        # Better Auth handlers
├── lib/
│   └── auth.ts          # Better Auth configuration
└── components/          # Auth forms (existing)
```

**Structure Decision**: Option 2: Web application (Separate Frontend/Backend).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |