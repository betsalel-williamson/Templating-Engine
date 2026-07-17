# Project management

Open work for this repository lives in [GitHub Issues](https://github.com/betsalel-williamson/Templating-Engine/issues) and on the [Templating Engine project board](https://github.com/users/betsalel-williamson/projects/5). The tracker is the source of truth — not local bootstrap scripts or durable docs backlogs.

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

Create new epics with the **Epic** issue template (`.github/ISSUE_TEMPLATE/epic.yml`). Link child issues via **Set parent issue** in the GitHub UI or the `gh` sub-issue APIs.

## File and track work

### Issue templates

Templates under `.github/ISSUE_TEMPLATE/` cover bug reports, features, documentation, maintenance, and epics. Each template includes `projects: [betsalel-williamson/5]`, so issues created from a template land on the board immediately.

Create an issue from the web UI (**New issue** → pick a template) or with `gh`:

```bash
gh issue create --repo betsalel-williamson/Templating-Engine --template feature_request.yml
```

### Add an existing issue to the board

When an issue was not created from a template, add it to the project with `gh`:

```bash
gh project item-add 5 --owner betsalel-williamson \
  --url https://github.com/betsalel-williamson/Templating-Engine/issues/<number>
```

### View and update status

Browse or drag cards on the [project board](https://github.com/users/betsalel-williamson/projects/5), or use `gh issue view` / `gh issue edit` for issue fields. Move **Status** to **In Progress** when starting work and **Done** when the linked PR merges or the issue closes.

### Agents and automation

Coding agents load issue scope via [agent work-item tracking](agent-work-item-tracking.md):

- **`gh`** — `gh issue view <number> --comments` when the CLI is authenticated
- **GitHub MCP** — issue and project tools when the MCP server is enabled in the agent host

## Working conventions

- File work as issues; use epics for multi-issue initiatives.
- Keep one feature branch and PR per issue (see [agent work-item tracking](agent-work-item-tracking.md)).
- Move project **Status** when starting or completing work.
- Reference issues in PRs with `Closes #N`.
