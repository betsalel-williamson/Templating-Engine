---
title: 'Automate Release Binary Publication to GitHub'
project_name: template-engine-ts
epic_name: tooling_and_ci
story_id: 18
labels: ci/cd, release
status: verified completed
date_created: 2025-07-13T00:00:00-07:00
date_verified_completed: 
touched: *
---

- **As a** user of the template engine CLI,
- **I want to** download versioned, pre-compiled executables for my operating system directly from a GitHub release,
- **so that** I can easily use the tool in my projects and CI/CD pipelines without needing to build it from source.

## Acceptance Criteria

- A new GitHub Actions workflow must be created specifically for releases (e.g., `release.yml`).
- The release workflow must be triggered **only** when a new tag matching the pattern `v*.*.*` is pushed.
- The workflow must automatically build the standalone executables for Linux, macOS, and Windows.
- A new GitHub Release must be automatically created, with the title and tag matching the pushed Git tag.
- The three generated executables must be attached as downloadable assets to the GitHub Release.
- The uploaded asset filenames must include the version number for clarity (e.g., `template-engine-v1.0.0-linux`).

## Metrics for Success

- **Primary Metric**: "Reduce the time for a new user to download and run the CLI to under 1 minute."
- **Secondary Metrics**: "Automate 100% of the release artifact creation process, eliminating manual builds and uploads."
