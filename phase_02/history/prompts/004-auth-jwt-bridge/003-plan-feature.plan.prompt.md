---
id: "003"
title: "Plan Auth JWT Bridge"
stage: plan
date: 2026-01-11
surface: agent
model: gemini-2.0-flash-exp
feature: 004-auth-jwt-bridge
branch: 004-auth-jwt-bridge
user: User
command: /sp.plan
labels: [plan, architecture, auth, jwt, neon]
links:
  spec: specs/004-auth-jwt-bridge/spec.md
  plan: specs/004-auth-jwt-bridge/plan.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-auth-jwt-bridge/plan.md
  - specs/004-auth-jwt-bridge/research.md
  - specs/004-auth-jwt-bridge/data-model.md
  - specs/004-auth-jwt-bridge/contracts/openapi.yaml
  - specs/004-auth-jwt-bridge/quickstart.md
tests: []
---

# User Prompt

/sp.plan

Create: architecture sketch, endpoint flow, database schema mapping, JWT verification flow.
Decisions needing documentation: 
- How to map Better Auth user.id (string) → Neon UUID (options: convert string to UUID or store as text)
- How to handle duplicate signup attempts (ignore, update, error)
- Foreign key constraints enforcement (on delete cascade vs restrict)

Testing strategy: 
- Signup success → Neon DB check
- JWT verification → valid/expired/invalid tokens
- Task CRUD → only user-owned tasks accessible
- Foreign key integrity → create/delete user cascades to account/session/task/verification

Technical details:
- Follow Spec-Kit Plus principles: task-driven development
- Must use skills:
  - `configuring-better-auth` for signup + DB persistence
  - `jwt-fastapi-bridge` for token verification + user validation
- Organize by phases: Env Validation → Signup → JWT Bridge → DB Mapping → Task Access Control

# Assistant Response

Executed implementation planning workflow.

**Research & Decisions (`research.md`):**
- **User IDs**: Use `TEXT` in Neon DB to match Better Auth strings.
- **Duplicates**: Return HTTP 409 Conflict.
- **Foreign Keys**: Use `ON DELETE CASCADE` at DB level.
- **JWT**: Use `Authorization: Bearer <token>`.

**Artifacts Generated:**
- **Plan**: `specs/004-auth-jwt-bridge/plan.md`
- **Data Model**: `specs/004-auth-jwt-bridge/data-model.md` (User, Task, Account, Session, Verification)
- **Contracts**: `specs/004-auth-jwt-bridge/contracts/openapi.yaml` (Signup & Task Endpoints)
- **Quickstart**: `specs/004-auth-jwt-bridge/quickstart.md`

**Agent Context:** Updated `GEMINI.md` with new stack details.

Ready for task breakdown: `/sp.tasks`
