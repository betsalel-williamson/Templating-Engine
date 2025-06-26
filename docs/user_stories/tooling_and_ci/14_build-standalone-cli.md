# Story 14: Build Standalone CLI

- **Project**: `template-engine-ts`
- **As a** DevOps Engineer,
- **I want to** build a single, self-contained executable for the template engine CLI,
- **so that** I can easily distribute and run it in environments without requiring a pre-installed Node.js runtime or `node_modules` folder, simplifying deployment and CI/CD setup.

## Acceptance Criteria

- The project includes a build script (e.g., `npm run build:standalone`) that produces a single executable file (e.g., `dist/template-engine-win.exe`, `dist/template-engine-linux`, `dist/template-engine-macos`).
- The generated executable includes all necessary Node.js dependencies and the Node.js runtime.
- The executable can be run directly (e.g., `./template-engine --help`) without `npm install` or `node`.
- Instructions for building and using the standalone executable are added to the `README.md`.

## Metrics for Success

- **Primary Metric**: "Reduce average CI/CD pipeline setup time for projects consuming the CLI by 30 seconds."
- **Secondary Metrics**: "Decrease the size of distributed CLI artifacts by 5% (by eliminating `node_modules` at target)."
