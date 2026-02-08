# Feature Specification: Cloud-Native Deployment for the Plannoir Chatbot

**Feature Branch**: `016-k8s-helm-deployment`
**Created**: 2026-02-08
**Status**: Draft
**Input**: Containerization of Phase III stack and deployment via Helm on Minikube

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Containerize Frontend and Backend (Priority: P1)

As a DevOps engineer, I want to containerize both the Next.js frontend and FastAPI backend using Docker multi-stage builds so that I can deploy them as container images to Kubernetes without pushing to an external registry.

**Why this priority**: This is the foundational requirement; without containerized images, Kubernetes deployment is impossible. This is the MVP's critical path.

**Independent Test**: Can be fully tested by running `docker build` for each service, verifying images exist locally, and confirming multi-stage build optimization reduces image size below 150MB each.

**Acceptance Scenarios**:

1. **Given** a Next.js application with dependencies, **When** I run `docker build -f Dockerfile .` in the frontend directory, **Then** a Docker image is created with optimized layers (builder stage separate from final runtime)
2. **Given** a FastAPI application with requirements.txt, **When** I build the backend image, **Then** the final image contains only runtime dependencies (no dev tools) and is smaller than 100MB

---

### User Story 2 - Deploy Services via Helm on Minikube (Priority: P1)

As a developer evaluating local Kubernetes scalability, I want to define frontend and backend deployments using Helm charts so that I can deploy and manage the full stack on Minikube with configuration control and easy scaling.

**Why this priority**: Once containers exist, deploying them to Kubernetes is the next critical step. Helm provides IaC compliance (per Constitution) and enables repeatable deployments without manual kubectl commands.

**Independent Test**: Can be fully tested by running `helm install` for the umbrella chart, verifying pods reach "Running" state, and confirming services are created without manual YAML editing.

**Acceptance Scenarios**:

1. **Given** a Helm umbrella chart with frontend and backend sub-charts, **When** I run `helm install my-app .` on Minikube, **Then** 2 pods (frontend, backend) are created and transition to "Running" state
2. **Given** deployed services, **When** I run `kubectl get services`, **Then** I see Service objects exposing both frontend (NodePort) and backend (ClusterIP) with correct port mappings

---

### User Story 3 - Access Application via Kubernetes Networking (Priority: P1)

As a developer, I want to access the frontend application through Minikube networking (tunnel or NodePort) so that I can test the full application stack running on Kubernetes.

**Why this priority**: Without accessible endpoints, the deployment cannot be validated end-to-end. Access is the final piece of the MVP.

**Independent Test**: Can be fully tested by running `minikube tunnel` or using NodePort, then verifying the frontend loads and backend API calls succeed.

**Acceptance Scenarios**:

1. **Given** a frontend pod running on Minikube, **When** I run `minikube service frontend` or use the tunnel, **Then** the frontend is accessible via `localhost` or Minikube IP without additional configuration
2. **Given** frontend and backend pods, **When** I interact with the frontend UI, **Then** API calls to the backend succeed and responses are returned

### User Story 4 - Inject Secrets Without Hardcoding (Priority: P1)

As a DevOps engineer, I want to inject the Neon PostgreSQL connection URL and OpenRouter API key via Kubernetes Secrets so that credentials are not hardcoded in Helm values or container images.

**Why this priority**: Security-first principle (Constitution) makes this non-negotiable. Secrets must be managed securely from day one.

**Independent Test**: Can be fully tested by creating K8s Secrets, mounting them in pod specs, and verifying applications read from mounted environment variables without touching source code.

**Acceptance Scenarios**:

1. **Given** a Kubernetes cluster, **When** I create Secrets containing the Neon URL and OpenRouter key, **Then** Helm values reference the Secret names (not the actual values)
2. **Given** deployed pods, **When** I exec into a pod and check environment variables, **Then** I see the secrets injected without plaintext appearing in Helm charts or logs

### Edge Cases

- What happens when Minikube Docker daemon is not running? (Build should fail gracefully with clear error)
- How does the application handle database connection failures during pod startup? (Readiness probes should detect and prevent traffic routing)
- What happens if a Neon connection URL secret is missing? (Pod should fail to start; Kubernetes should log the error)
- How does the frontend handle backend API timeouts in the Minikube environment? (Should have retry logic and user-friendly error messages)
- What happens when a pod is evicted or restarted? (Stateless design ensures new pod can start without data loss)

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

**Containerization**

- **FR-001**: Frontend (Next.js) MUST be containerized using a multi-stage Dockerfile with separate builder and runtime stages
- **FR-002**: Backend (FastAPI) MUST be containerized using a multi-stage Dockerfile with final image size under 100MB
- **FR-003**: Both Dockerfiles MUST support local Minikube Docker daemon without pushing to external registries

**Kubernetes Deployment**

- **FR-004**: Helm chart (umbrella or sub-charts) MUST define Deployment objects for frontend and backend with configurable replicas
- **FR-005**: Frontend Deployment MUST specify a Service with type NodePort (or be accessible via Minikube tunnel)
- **FR-006**: Backend Deployment MUST specify a Service with type ClusterIP for internal pod communication
- **FR-007**: All pod Deployments MUST include liveness and readiness probes aligned with Constitution (Principle IV)

**Secrets Management**

- **FR-008**: Helm chart values MUST NOT contain plaintext Neon connection URL or OpenRouter API key
- **FR-009**: Deployment MUST inject Neon URL and OpenRouter key via Kubernetes Secrets mounted as environment variables
- **FR-010**: Secret creation process MUST be documented without storing plaintext in git

**Database Connectivity**

- **FR-011**: Backend MUST connect to the existing Neon Serverless PostgreSQL using injected connection string
- **FR-012**: Connection pool or pooling strategy MUST be configured to handle pod restarts and connection reuse

**Networking**

- **FR-013**: Frontend pods MUST be able to reach backend pods via Kubernetes DNS (service-name.namespace.svc.cluster.local)
- **FR-014**: Frontend pod environment MUST be configured with backend API endpoint for cross-pod communication
- **FR-015**: Application MUST be accessible from developer machine via Minikube tunnel or NodePort without additional port forwarding

### Key Entities *(include if feature involves data)*

- **Helm Chart**: An IaC artifact defining Kubernetes resources (Deployments, Services, ConfigMaps, Secrets) for the full application stack
- **Docker Image**: Containerized application (frontend or backend) with dependencies baked in, referenced in pod Deployment specs
- **Kubernetes Service**: Exposes frontend (NodePort) and backend (ClusterIP) for inter-pod and external communication
- **Kubernetes Secret**: Holds sensitive data (Neon URL, OpenRouter key) injected into pods via environment variables or volume mounts
- **Neon Database Connection**: External PostgreSQL service accessed by backend via injected connection string; unmanaged by this feature

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Frontend and backend Docker images build successfully without registry pushes; multi-stage optimization reduces combined size to under 250MB
- **SC-002**: `helm install` completes without errors; all pods transition to "Running" state within 2 minutes on Minikube
- **SC-003**: Frontend is accessible via `localhost` or Minikube IP; backend API responds to requests within 500ms (p95 latency)
- **SC-004**: Cross-pod communication works: frontend API calls to backend succeed 100% of the time during normal operation
- **SC-005**: Secrets are correctly injected; no plaintext credentials appear in Helm values, Docker images, or pod environment variable list when viewed via kubectl
- **SC-006**: Application successfully connects to Neon PostgreSQL and performs database operations (read/write/delete) without error
- **SC-007**: Pod restarts and scaling (increasing/decreasing replicas) do not cause data loss due to statelessness design

## Assumptions

- Neon PostgreSQL connection URL and OpenRouter API key are available and valid before deployment
- Minikube is installed and running with Docker Desktop; developers have kubectl configured
- Phase III application code (Next.js frontend and FastAPI backend) already exists and is working locally
- Developers are familiar with basic Kubernetes concepts (pods, services, deployments) or will reference inline documentation
- No production CI/CD pipelines are required; this is local development/testing only

## Dependencies & Out-of-Scope

**Out of Scope (Phase V)**:
- Production CI/CD pipelines and automated deployments
- Managed Cloud Kubernetes (GKE, AKS, DOKS)
- Kafka or Dapr integration
- Multi-cluster management or federation
- Ingress controller configuration (basic NodePort/tunnel sufficient for local testing)

**Dependencies**:
- Phase III application code must be containerizable (application must exit gracefully, support environment variable config)
- Docker Desktop 4.53+ with Minikube support
- Helm v3+ and kubectl installed locally
- Neon account with existing PostgreSQL database

## Notes & References

- Constitution v1.0.0 principles guide this feature: IaC (Helm), Statelessness, Security-First (Secrets), Observability (probes)
- All Helm charts must be in the repository under `/helm/` directory (or appropriate location per IaC principle)
- Secret creation process must be documented in a separate README/guide without storing plaintext in git
- Developers must use `minikube eval` or set DOCKER_HOST to build images in Minikube Docker daemon
