# Agent work-item tracking

How coding agents load tracker issues and delivery conventions **for this repository**. Task-type prompts in `docs/.caches/mdcp/prompts/` point here via `WORK_ITEM_LOOKUP`.

## Tracker

```text
Host=GitHub (betsalel-williamson/Templating-Engine)
Issue base URL=https://github.com/betsalel-williamson/Templating-Engine/issues/
WORK_ITEM=issue number (e.g. 42) or full issue URL
```

## Load scope

**GitHub CLI** (when `gh` is on `PATH` and authenticated):

```bash
gh issue view <number> --comments
```

**GitHub MCP** (when enabled): use GitHub issue tools to fetch the issue named in `WORK_ITEM`.

## Git and delivery

```text
Integration branch=main (pull before branching)
Feature branches=descriptive (e.g. feature/issue-42-mdcp-docs)
One branch per WORK_ITEM=do not mix unrelated features in one PR
Branch before work=create the feature branch before shards, tests, or code
Commits=conventional; atomic and logically grouped
Release notes=changeset in .changeset/ for user-facing package changes
Docs=describe current behavior only; breaking changes belong in changeset notes
Code review=gh pr create; link WORK_ITEM in PR body (Closes #N when appropriate)
```

## Example prompt header

```text
WORK_ITEM=42
WORK_ITEM_LOOKUP=Branch from main (pull first). One issue per branch. Load WORK_ITEM per docs/developer/agent-work-item-tracking.md.
```
