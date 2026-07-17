# Project management

Planning work for this repository is tracked on the [Templating Engine project board](https://github.com/users/betsalel-williamson/projects/5).

## Board

| Setting       | Value                                                                        |
| ------------- | ---------------------------------------------------------------------------- |
| Project       | [Templating Engine](https://github.com/users/betsalel-williamson/projects/5) |
| Owner         | `betsalel-williamson`                                                        |
| Status values | Todo, In Progress, Done                                                      |
| Epics         | Parent issues with linked sub-issues                                         |

## Epics

| Epic                    | Issue                                                                     | Child issues |
| ----------------------- | ------------------------------------------------------------------------- | ------------ |
| Modern Syntax Migration | [#40](https://github.com/betsalel-williamson/Templating-Engine/issues/40) | #16–#30      |
| CLI Interface           | [#41](https://github.com/betsalel-williamson/Templating-Engine/issues/41) | #31          |
| Tooling and CI          | [#42](https://github.com/betsalel-williamson/Templating-Engine/issues/42) | #32–#38      |

Epic issues were created by `scripts/configure-project-management.sh`. Re-run the script safely if you need to backfill a fresh board; it skips existing epics.

## Adding issues to the board

- **Issue templates** — `.github/ISSUE_TEMPLATE/*.yml` include `projects: [betsalel-williamson/5]` so template-created issues land on the board immediately.
- **Epics** — use the **Epic** issue template, then link child issues via **Set parent issue** in the GitHub UI or `gh` sub-issue APIs.
- **Backfill** — run `scripts/configure-project-management.sh` to add existing open issues to the board ([one-time setup](#one-time-setup)).

## One-time setup

After cloning or when bootstrapping a fresh project board:

```bash
chmod +x scripts/configure-project-management.sh
./scripts/configure-project-management.sh
```

This script:

1. Creates epic issues (if missing)
2. Links migrated work items as sub-issues under the correct epic
3. Adds all open repository issues to the project board
4. Sets #34 (parser error messages) to **In Progress**

Requires `gh` authenticated with `project`, `read:project`, and `repo` scopes.

## Create issues from markdown files

To publish a local issue definition to GitHub, use `scripts/create-issue.sh` with a markdown file that starts with YAML frontmatter:

```yaml
---
title: Short issue title
labels:
  - enhancement
---
Issue body in markdown (everything after the closing ---).
```

```bash
chmod +x scripts/create-issue.sh
./scripts/create-issue.sh path/to/issue.md
```

The script reads `title` and `labels` from frontmatter, uses the remaining content as the issue body, creates the issue with `gh`, and prints the new issue URL. Requires `gh` on `PATH` and authenticated with the `repo` scope.

## Working conventions

- File work as issues; use epics for multi-issue initiatives.
- Keep one feature branch and PR per issue (see [agent work-item tracking](agent-work-item-tracking.md)).
- Move project **Status** when starting or completing work.
- Reference issues in PRs with `Closes #N`.
