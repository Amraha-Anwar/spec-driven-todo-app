<!--
Sync Impact Report:
- Version: initial → 1.0.0
- Modified principles: N/A (initial creation)
- Added sections: All (initial creation)
- Removed sections: N/A
- Templates requiring updates:
  ✅ .specify/templates/plan-template.md (reviewed - compatible)
  ✅ .specify/templates/spec-template.md (reviewed - compatible)
  ✅ .specify/templates/tasks-template.md (reviewed - compatible)
- Follow-up TODOs: None
-->

# Multi-Phase TODO Application Constitution

## Core Principles

### I. Spec-First Development (NON-NEGOTIABLE)

No code SHALL be written without an approved specification. Every feature, enhancement, or significant change MUST begin with a specification document that defines user scenarios, functional requirements, and success criteria. Implementation begins only after specification approval.

**Rationale**: Prevents scope creep, ensures alignment between stakeholders and implementers, and creates a documented record of intent before committing resources to implementation.

### II. Agent-Driven Execution

Claude Code is the sole code author for this project. All implementation work MUST be performed by the agent following approved specifications. Human developers MAY review, approve specifications, and validate outputs, but MUST NOT directly author implementation code.

**Rationale**: Ensures consistency in code style, adherence to project standards, and maximizes the benefits of AI-assisted development while maintaining human oversight at critical decision points.

### III. Clarity Over Complexity

Simple, readable solutions are ALWAYS preferred over clever or complex alternatives. Code MUST be written for human comprehension first, machine execution second. If a simpler approach exists that meets requirements, it MUST be chosen.

**Rationale**: Reduces maintenance burden, accelerates onboarding, minimizes bugs introduced by misunderstanding, and supports the multi-phase nature of this project where clarity aids future extension.

### IV. Deterministic Behavior

Given identical inputs, the system MUST produce predictable, repeatable outputs. Non-deterministic behavior (such as relying on uncontrolled external state, random number generation without explicit seeding, or timing-dependent logic) is PROHIBITED unless explicitly required by specification and documented.

**Rationale**: Facilitates testing, debugging, and reasoning about system behavior. Predictability is essential for reliable software and enables confident refactoring in future phases.

### V. Extensibility by Design

Code MUST be structured to support future phases without requiring significant refactoring. This means proper separation of concerns, clear module boundaries, and avoiding hard-coded assumptions that would impede later enhancements.

**Rationale**: This is a multi-phase project. Phase I establishes the foundation. Architecture decisions made now will either enable or obstruct future phases. Planning for extension reduces technical debt and rework.

## Development Standards

### Code Quality

- **Language**: Python 3.13 or higher MUST be used.
- **Environment Management**: UV MUST be used for dependency and environment management.
- **Code Style**: All code MUST comply with PEP 8 standards.
- **Function Design**: Functions MUST be small (typically under 20 lines) and adhere to the single-responsibility principle.
- **Naming**: File names, variable names, and function names MUST be clear, descriptive, and follow Python naming conventions (snake_case for functions and variables, PascalCase for classes).
- **Dead Code**: No commented-out code, unused imports, or orphaned functions SHALL remain in the codebase.

**Rationale**: Consistency in code quality ensures maintainability, readability, and reduces cognitive load. Strict adherence to standards prevents the accumulation of technical debt.

## Architecture Rules

### Separation of Concerns

The codebase MUST maintain clear separation between:

1. **Data Models**: Representation of domain entities and their relationships.
2. **Business Logic**: Rules, validations, and operations on data models.
3. **Input/Output Handling**: Interaction with the console, user input parsing, and output formatting.

These concerns MUST reside in separate modules with well-defined interfaces. No module SHALL contain responsibilities from multiple categories.

**Rationale**: Clean separation enables independent testing, supports future UI changes (web, GUI), and allows business logic to evolve without touching I/O code.

### No Tight Coupling

Modules MUST depend on abstractions, not concrete implementations where practical. Direct coupling between unrelated modules is PROHIBITED. Changes in one module MUST NOT require cascading changes across the codebase.

**Rationale**: Loose coupling enables independent module evolution, simplifies testing with mocks/stubs, and supports future phases where new implementations may replace current ones.

### No Hard-Coded Assumptions

Code MUST NOT embed assumptions that would obstruct future extensions. Examples of PROHIBITED hard-coded assumptions include:

- Assuming console-only I/O (future phases may introduce web/GUI)
- Assuming in-memory-only storage (future phases may add persistence)
- Assuming single-user operation (future phases may add multi-user support)

**Rationale**: Hard-coded assumptions create technical debt that compounds across phases. Avoiding them upfront reduces refactoring costs and risks in later phases.

## Tooling Constraints

### Approved Dependencies

- **Standard Library**: The Python standard library is ALWAYS permitted.
- **External Libraries**: External libraries and frameworks are PROHIBITED unless explicitly approved in a specification document.
- **UI Frameworks**: No UI frameworks or libraries (web, GUI) SHALL be introduced in Phase I. Console I/O only.

**Rationale**: Limiting dependencies reduces complexity, minimizes attack surface, and ensures the foundation remains lightweight and portable. Future phases may relax this constraint after foundational stability is proven.

## Quality Gates

All code MUST pass the following quality gates before being considered complete:

### Gate 1: Clean Environment Execution

Code MUST run without errors in a clean Python 3.13+ environment managed by UV. No undeclared dependencies, no reliance on specific machine configuration.

**Test**: Fresh clone, `uv sync`, execute main entry point.

### Gate 2: Graceful Error Handling

Invalid inputs, edge cases, and error conditions MUST NOT crash the program. All foreseeable errors MUST be caught and handled gracefully with clear user-facing messages.

**Test**: Provide invalid inputs, missing data, boundary conditions. System must respond appropriately.

### Gate 3: Human Readability

Code MUST be readable and reviewable by a human developer. This includes:

- Clear variable and function names
- Logical code organization
- Appropriate comments where intent is non-obvious (but prefer self-documenting code)
- Consistent formatting per PEP 8

**Test**: Code review by human reviewer.

## Non-Goals (Phase I)

The following are explicitly OUT OF SCOPE for Phase I:

- **UI Beyond Console**: No web interface, GUI, or mobile interface.
- **Persistence Guarantees**: Data may be stored in memory. Persistence across sessions is NOT required.
- **Authentication**: No user login, authentication, or authorization mechanisms.
- **Multi-User Support**: Single-user operation only.

**Rationale**: These non-goals define the boundaries of Phase I. Future phases will address them. Attempting to solve them prematurely violates the Clarity Over Complexity principle and risks over-engineering.

## Governance

### Amendment Process

This constitution MAY be amended through the following process:

1. Proposed amendment MUST be documented with rationale and impact analysis.
2. Proposed amendment MUST be reviewed and approved by project stakeholders.
3. Upon approval, the constitution MUST be updated with incremented version number per semantic versioning rules.
4. All dependent templates and documentation MUST be reviewed and updated to reflect constitutional changes.

### Versioning Policy

Constitution version follows semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Backward-incompatible changes (e.g., removing or fundamentally redefining a core principle).
- **MINOR**: New principle added or existing principle materially expanded.
- **PATCH**: Clarifications, wording improvements, typo fixes, non-semantic refinements.

### Compliance Review

- All pull requests and code reviews MUST verify compliance with this constitution.
- Complexity introduced that violates the Clarity Over Complexity principle MUST be justified in writing before merging.
- Runtime development guidance (for agents and human developers) MUST reference this constitution as the authoritative source of project rules.

**Version**: 1.0.0 | **Ratified**: 2025-12-27 | **Last Amended**: 2025-12-27
