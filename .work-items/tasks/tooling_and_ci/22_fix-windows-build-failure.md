---
title: 'CI/CD: Build fails on Windows runner due to non-portable `mkdir -p` command'
project_name: template-engine-ts
epic_name: tooling_and_ci
task_id: 22
labels: bug, ci/cd, chore
status: todo
date_created: 2025-07-13T00:00:00-07:00
date_verified_completed: 
touched: *
---

## Task

The `npm run build` command fails on the Windows runner in our release workflow. The log shows the error: `A subdirectory or file -p already exists.`

This indicates that the `bash` environment on the Windows runner is not correctly interpreting the `mkdir -p lib` command. Instead of treating `-p` as a flag, it's attempting to create a directory named `-p`.

This is a critical bug that completely blocks our automated release process. We cannot produce Windows binaries until this is fixed. It violates our **Comprehensive Automation** principle, as our pipeline is not reliable across all target platforms.

We must replace the non-portable `mkdir -p` command with a guaranteed cross-platform equivalent from the Node.js ecosystem.

## Acceptance Criteria

- [ ] Add the `mkdirp` package as a `devDependency` to `package.json`.
- [ ] Update the `build` script in `package.json` to use the `mkdirp lib` command instead of `mkdir -p lib`.

## Context/Links

- Related user story:
- Additional context: This task is critical for enabling cross-platform builds and releases.
