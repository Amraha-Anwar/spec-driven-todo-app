---
id: "001"
title: "Create Auth JWT Bridge Spec"
stage: spec
date: 2026-01-11
surface: agent
model: gemini-2.0-flash-exp
feature: 004-auth-jwt-bridge
branch: 004-auth-jwt-bridge
user: User
command: /sp.specify
labels: [spec, auth, jwt, neon, better-auth]
links:
  spec: specs/004-auth-jwt-bridge/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-auth-jwt-bridge/spec.md
  - specs/004-auth-jwt-bridge/checklists/requirements.md
tests: []
---

# User Prompt

Configuring Better Auth + JWT Bridge for FastAPI + Neon DB Target audience: Full-stack developers building secure, multi-user task management apps with Better Auth and FastAPI. Focus: Reliable user signup, JWT authentication, and consistent Neon DB persistence. must maintain PHR: Problem: POST /auth/signup/email returns 500; user info is not saved in Neon DB; foreign key relationships and UUIDs are inconsistent. Hypothesis: Misalignment between Better Auth user.id (string) and Neon DB user.id (UUID) causes failures; JWT decoding and table relations are not properly implemented. Requirement: Implement fully spec-driven signup + JWT bridge that ensures: User records are saved in Neon DB correctly. JWT token maps to the user correctly. Foreign key constraints (account.userId, session.userId, task.user_id, verification.user_id) are valid. All endpoints validate user_id against token. Success criteria: POST /auth/signup/email succeeds with 201. User row appears in Neon DB user table. JWT verification works; invalid tokens return 401. Users can only access their own tasks; 403 returned otherwise. Foreign keys and cascade deletes work. No duplicate foreign key constraints in Neon DB. Constraints: Must use configuring-better-auth for signup + DB mapping. Must use jwt-fastapi-bridge for JWT verification and user ID validation. Tables: user, task, account, session, verification. Must handle UUID conversion for Better Auth IDs. Use FastAPI + SQLModel. Not building: Frontend UI changes. Third-party OAuth flows (handled externally by Better Auth). Logging, monitoring, or analytics.

# Assistant Response

Created feature branch `004-auth-jwt-bridge`.
Generated specification at `specs/004-auth-jwt-bridge/spec.md`.
Validated requirements with checklist at `specs/004-auth-jwt-bridge/checklists/requirements.md`.
Ready for planning.
