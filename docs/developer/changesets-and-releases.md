# Changesets and releases

When changing publishable package code, add a changeset:

```bash
pnpm changeset
```

Verify before opening a PR:

```bash
pnpm changeset:status
```

## Publishing

1. Merge PRs with changesets to `main`.
2. On `main`, run `pnpm release:tag:push` (interactive; requires a TTY).
3. CI publishes to npm on tag push (`v*`).
4. SEA binaries are published separately via the `release-binaries` workflow.

Record removed or breaking behavior in the **changeset**, not in feature or client shards.
