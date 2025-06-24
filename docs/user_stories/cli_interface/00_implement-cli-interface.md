# Story 12: Implement CLI Interface

- **Project**: `template-engine-ts`
- **As a** DevOps Engineer,
- **I want to** use a command-line interface (CLI) for the template engine,
- **so that** I can leverage it in shell scripts and CI/CD pipelines to generate configuration files dynamically, without writing a custom Node.js wrapper.

## Acceptance Criteria

- An executable binary is produced (e.g., `dist/cli.js`).
- The package.json `bin` field is configured to create a `template-engine` command on `npm install -g`.
- The CLI must accept a template file path and a data file path (JSON) as arguments.
- The CLI must print the rendered output to `stdout`.
- The CLI must be able to accept streaming input from `stidin`.
- The CLI must exit with a non-zero status code if rendering fails.
- The CLI must include a `--help` flag that documents its usage.

## Metrics for Success

- **Primary Metric**: "Enable at least 3 distinct automation use cases (e.g., generating Kubernetes configs, CI reports, deployment manifests) within the first month."
- **Secondary Metrics**: "Reduce boilerplate script code for teams using the engine by an average of 20 lines per script."
