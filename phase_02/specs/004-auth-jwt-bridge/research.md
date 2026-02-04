# Research & Decisions: Better Auth JWT Bridge

**Feature Branch**: `004-auth-jwt-bridge`
**Date**: 2026-01-11

## Decisions

### 1. Better Auth User ID Mapping
**Decision**: Use `TEXT` (or `VARCHAR`) for `user.id` and related foreign keys in Neon DB.
**Rationale**: Better Auth uses string IDs by default. Converting these to UUIDs introduces complexity and potential failure points if the ID format changes (e.g., to CUID or NanoID). Using strings ensures 100% compatibility and simplifies the bridge logic.
**Alternatives Considered**:
- *Convert to UUID*: Rejected due to risk of format mismatch and "ghost user" issues if conversion fails.
- *Dual ID Column*: Rejected as it violates "Smallest viable change" principle and complicates queries.

### 2. Duplicate Signup Handling
**Decision**: Return HTTP 409 Conflict when a user with the same email already exists.
**Rationale**: Standard REST pattern for resource conflicts. Prevents information leakage (generic message) while handling the state correctly.
**Alternatives Considered**:
- *Update existing*: Rejected as insecure (could allow account takeover if email verification isn't strict).
- *Silent success*: Rejected as it confuses users who think they created a new account.

### 3. Foreign Key Integrity
**Decision**: Implement `ON DELETE CASCADE` at the database level for all user-related tables (`task`, `session`, `account`, `verification`).
**Rationale**: Ensures data integrity and prevents orphaned records automatically without relying on application-level logic, which can be buggy or skipped during manual DB operations.
**Alternatives Considered**:
- *Application-level deletion*: Rejected due to risk of partial failures leaving orphaned data.
- *Soft deletes*: Rejected as out of scope and adding unnecessary complexity for this feature.

### 4. JWT Transmission
**Decision**: Use standard `Authorization: Bearer <token>` header.
**Rationale**: Industry standard, supported out-of-box by `jwt-fastapi-bridge` and frontend libraries.
**Alternatives Considered**:
- *Cookies*: Rejected due to CSRF complexity and "Stateless Reliability" constitution principle.

## Technical Stack Confirmation

- **Signup**: `configuring-better-auth` (Better Auth + Neon DB adapter)
- **Verification**: `jwt-fastapi-bridge` (FastAPI dependency)
- **Database**: Neon Serverless PostgreSQL (via SQLModel)
- **ID Type**: String (mapped to `TEXT` in SQLModel)
