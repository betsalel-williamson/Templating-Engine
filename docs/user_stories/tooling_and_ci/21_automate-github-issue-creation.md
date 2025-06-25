# Story 21: Automate GitHub Issue Creation from Documentation

- **Project**: `template-engine-ts`
- **Status**: `todo`
- **As a** Developer,
- **I want to** run a script that takes a local issue file (e.g., `docs/issues/01.md`) and automatically creates a corresponding issue in the GitHub repository,
- **so that** I can maintain a single source of truth for issue definitions in the repository while seamlessly integrating with GitHub's project management tools, ensuring all work is tracked.

## Acceptance Criteria

- A new `scripts/create-issue.sh` script must be created.
- The script must accept a single argument: the path to an issue markdown file.
- The script must parse the file's YAML frontmatter to extract the `title` and `labels`.
- The script must use the content of the file *after* the frontmatter as the issue body.
- The script must use the GitHub CLI (`gh`) to create a new issue in the project's repository with the extracted title, labels, and body.
- The script must output the URL of the newly created issue upon success.
- If the `gh` command is not installed or the user is not authenticated, the script must fail with a clear, helpful error message.

## Metrics for Success

- **Primary Metric**: "Reduce the time to create a well-formatted GitHub issue from a repository file from 2-3 minutes to under 5 seconds."
- **Secondary Metrics**: "Achieve 100% consistency in the formatting (title, labels) of issues created from the repository."
