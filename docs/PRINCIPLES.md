# Core Engineering Principles

Our principles are derived from DORA research and are non-negotiable foundations of our engineering culture.

## Product & User Principles

- **Relentlessly User-Centric**: We prioritize understanding and addressing user needs. Product quality, developer productivity, and job satisfaction are all downstream effects of this focus. We measure our success by the value we deliver to users.
- **Stable Priorities**: We work to maintain stable, clear organizational priorities. Constant churn is a primary cause of burnout and must be actively managed and mitigated by leadership.

## Delivery Principles

- **Maintain Small Batch Sizes**: This is our most critical delivery principle. Large changes are the primary cause of reduced delivery stability and throughput. All work must be broken down into the smallest possible units that can be independently deployed and deliver value. This applies to code, configuration, and infrastructure.
- **Comprehensive Automation**: The path to production must be fully automated, from commit to deployment. This includes all testing, quality gates, and infrastructure provisioning. Manual steps are an anti-pattern.
- **Trunk-Based Development**: All work is integrated into the `main` branch continuously. Long-lived feature branches are avoided to prevent integration complexity and support small batch sizes.
- **Decoupled Deployment and Release**: We use feature flags to separate the technical act of deploying code from the business act of releasing features to users. This reduces risk and enables experimentation.

## Architectural Principles

- **Stateless Services**: Services must not maintain internal state. State is externalized to dedicated persistence layers (databases, caches, object stores) to enable horizontal scaling and resilience.
- **Asynchronous Communication**: We prefer non-blocking, asynchronous communication (e.g., event queues, message streams) between services to promote loose coupling and fault tolerance.
- **Idempotent Operations**: All API endpoints and event handlers must be designed to be safely retried without unintended side effects.
- **Design for Failure**: We assume every component and dependency will fail. Systems must include mechanisms for graceful degradation, including health checks, retries with exponential backoff, and circuit breakers.
- **Embedded Observability**: Systems must be designed for observability from the start. This includes structured logging (JSON), key performance metrics (DORA), and distributed tracing.
