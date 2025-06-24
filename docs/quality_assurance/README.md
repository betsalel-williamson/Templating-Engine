# Quality Assurance Process

Quality is a shared responsibility, built into our process from the start. Our approach is designed to provide fast feedback and prevent defects from reaching production, especially given our use of AI-assisted tools.

### 1. Automated Testing

-   **Unit Tests**: Every piece of new logic must be accompanied by comprehensive unit tests. We aim for high code coverage, but more importantly, we test for behavior and edge cases.
-   **Integration Tests**: We have an automated suite of integration tests that run against every commit to `main`. These verify the interactions between services.
-   **End-to-End Tests**: A small, carefully selected suite of E2E tests validates critical user paths. These are slow and brittle, so they are used sparingly.

### 2. Code Review

-   Every change requires at least one approval from another team member before it can be merged into `main`.
-   Reviews focus on correctness, clarity, maintainability, and adherence to our principles (especially **Small Batch Size**).
-   Reviewers are expected to be particularly critical of AI-generated code, questioning its logic and assumptions.

### 3. Automated Quality Gates

The CI/CD pipeline is the ultimate guardian of quality. A merge to `main` is blocked if any of the following fail:
-   Static analysis (linting)
-   Unit test suite
-   Integration test suite
-   Security vulnerability scan

### 4. Production Monitoring

-   We rely on our DORA metrics (Change Failure Rate, Rework Rate) and user-centric metrics to provide the final feedback loop on quality.
-   Alerting is configured for key service level objectives (SLOs) to immediately notify us of production issues.
