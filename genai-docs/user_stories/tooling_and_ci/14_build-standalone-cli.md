# Story 14: Build Standalone CLI

- **Project**: `template-engine-ts`
- **Status**: `verified completed`
- **As a** DevOps Engineer,
- **I want to** build a single, self-contained executable for the template engine CLI,
- **so that** I can easily distribute and run it in environments without requiring a pre-installed Node.js runtime or `node_modules` folder.

## Acceptance Criteria

- The project must include a build script (e.g., `npm run build:standalone`) that produces a single executable file.
- The generated executable must include all necessary dependencies and the Node.js runtime.
- The executable must be runnable directly (e.g., `./template-engine --help`) without `npm install` or `node`.
- Instructions for building and using the standalone executable must be added to the `README.md`.

## Metrics for Success

- **Primary Metric**: "Reduce average CI/CD pipeline setup time for projects consuming the CLI by 30 seconds."
- **Secondary Metrics**: "Decrease the size of distributed CLI artifacts by 5% (by eliminating `node_modules` at target)."
