# Story 11: Setup Continuous Integration Pipeline

- **Project**: `template-engine-ts`
- **As an** Engineering Team,
- **I want to** implement a continuous integration pipeline using GitHub Actions,
- **so that** we can automate running tests, linting, and security scans on every commit, ensuring that defects are caught immediately and maintaining a high level of quality.

## Acceptance Criteria

-   A workflow file exists at `.github/workflows/ci.yml`.
-   The workflow must trigger on push events to the `main` branch.
-   The workflow must successfully execute the following steps: checkout code, install dependencies (`npm ci`), run linter, and run the test suite (`npm test`).
-   A failure in any step must cause the entire workflow run to fail.

## Metrics for Success

- **Primary Metric**: "Change Failure Rate decreases by 10% as regressions are caught before deployment."
- **Secondary Metrics**: "Change Lead Time is not negatively impacted by the new pipeline steps."
