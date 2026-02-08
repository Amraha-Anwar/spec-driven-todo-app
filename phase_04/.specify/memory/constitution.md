<!-- Sync Impact Report
Version: 1.0.0 (Initial) | Ratified: 2026-02-08
New Principles: 4 core + 2 additional sections
- I. Infrastructure as Code (IaC)
- II. Statelessness & External Persistence
- III. Security-First Secrets Management
- IV. Observability & Health Checks
- Additional: Technology Stack Constraints
- Additional: Development Workflow

Templates requiring updates:
  ✅ Constitution created (this file)
  ⚠ plan-template.md - ensure IaC/observability sections present
  ⚠ spec-template.md - ensure deployment/infrastructure scope included
  ⚠ tasks-template.md - ensure testing discipline for K8s manifests
-->

# Cloud-Native Todo Chatbot Constitution (Phase IV)

## Core Principles

### I. Infrastructure as Code (IaC)

All infrastructure and Kubernetes resources MUST be defined declaratively using Helm charts. Manual kubectl commands and ad-hoc YAML are prohibited. Every resource that will be deployed MUST:
- Be defined in a Helm chart template
- Have clear variables/values exposed for configuration
- Be version-controlled in the repository
- Include comments explaining non-obvious resource settings
- Support both local (Minikube) and cloud deployments through values overrides

**Rationale:** IaC ensures reproducibility, auditability, and prevents drift. Helm enables parameterization for different environments.

### II. Statelessness & External Persistence

The application layer MUST remain entirely stateless. Persistent data (tasks, user state) MUST be delegated exclusively to external services (Neon PostgreSQL database). This ensures:
- Pods can be freely scaled, terminated, and replaced without data loss
- No pod-local state, temporary files, or in-memory caches that persist beyond pod lifecycle
- All application-level state is transient (request context only)
- Database operations are idempotent and handle connection failures gracefully

**Rationale:** Stateless services are cloud-native, fault-tolerant, and enable horizontal scaling. External persistence provides durability and independence from pod lifecycle.

### III. Security-First Secrets Management

All sensitive data (Neon database connection URLs, OpenRouter API keys, etc.) MUST be:
- Stored in Kubernetes Secrets, never hardcoded or in `.env` files committed to git
- Mounted as volumes or injected as environment variables into pods
- Rotated regularly; application MUST handle secret updates without restart when possible
- Audited: all secret access logged through Kubernetes audit logs

**Rationale:** Kubernetes Secrets provide encryption-at-rest and role-based access control. Centralized secret management prevents credential leakage and simplifies rotation.

### IV. Observability & Health Checks (NON-NEGOTIABLE)

Every deployed pod MUST implement:
- **Liveness Probes:** Detect hung processes; restart if probe fails (TCP or HTTP endpoint)
- **Readiness Probes:** Signal when pod is ready to receive traffic; remove from load balancer if failing
- **Health Check Endpoints:** Expose `/health` (readiness) and `/metrics` (Prometheus) on the application
- **Structured Logging:** All logs include request ID, service name, timestamp, level, and structured metadata (JSON preferred)
- **Tracing:** OpenTelemetry instrumentation for request flow visibility (optional for Phase IV but preferred)

**Rationale:** Health checks prevent traffic routing to broken pods. Structured logging enables debugging in distributed systems. Observability is non-negotiable for production readiness.

## Technology Stack Constraints

- **Containerization:** Docker Desktop 4.53+ with multi-stage builds (required to minimize image size)
- **Orchestration:** Minikube for local development; Helm v3+ for manifest management
- **CLI Operations:** kubectl-ai (or kagent) for Kubernetes automation; Gordon for Docker operations
- **Environment:** WSL 2 for Windows developers (mandatory for consistent environment)
- **Database:** Neon PostgreSQL (external, unmanaged)
- **API Access:** OpenRouter for LLM calls

No manual YAML writing permitted. All manifests generated via Helm or specification-driven tooling.

## Development Workflow

### Testing & Validation Discipline

- **Unit Tests:** Test application logic in isolation (no database required for unit tests)
- **Integration Tests:** Test database interactions, API contracts, and Helm chart rendering
- **Helm Chart Validation:** All charts MUST validate with `helm lint` before commit
- **Manifest Validation:** Generated YAML MUST pass `kubectl apply --dry-run=client` before deployment
- **Security Scanning:** Secrets must not appear in any artifact; use tools like `git-secrets` and Trivy for image scanning

### Deployment Gates

1. All tests pass (unit + integration)
2. Helm chart lints without warnings
3. Secrets are exfiltrated (no plaintext in manifests)
4. Code review approval required
5. Image built with multi-stage Dockerfile; size validated (<100MB recommended)

### Review & Amendment Process

- Constitution amendments MUST be explicit and versioned
- Version bumps follow semver:
  - **MAJOR:** Principle removal or backward-incompatible redefinition
  - **MINOR:** New principle/section or material expansion of guidance
  - **PATCH:** Clarifications, typos, non-semantic refinements
- All amendments recorded in commit message with rationale

## Governance

The Constitution supersedes all ad-hoc practices and guides all development decisions. Compliance is verified during code review: every PR MUST reference which principles justify the proposed changes. If a change conflicts with a principle, the PR cannot merge until either (a) the principle is amended (with justification) or (b) the change is revised.

Key governance rules:
- **Complexity justification:** Non-trivial architectural choices must cite their principle(s) and document tradeoffs
- **Consistency propagation:** Any amendment to this constitution triggers reviews of dependent templates (spec, plan, tasks) and guidance files (README, CLAUDE.md)
- **Principle clarity:** All principles are written as declarative statements, not suggestions; use "MUST" for non-negotiable rules, "SHOULD" for strong guidance with documented exceptions

**Version**: 1.0.0 | **Ratified**: 2026-02-08 | **Last Amended**: 2026-02-08
