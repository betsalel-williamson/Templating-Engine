# Changesets

This repository uses [Changesets](https://github.com/changesets/changesets) for semver versioning of `@bwilliamson/template-engine-core` and `@bwilliamson/template-engine-cli` together.

## Adding a changeset

```bash
pnpm changeset
```

Describe your change and select the bump type (**patch**, **minor**, or **major**). Commit the generated file under `.changeset/`.

## Verify before opening a PR

```bash
pnpm changeset:status
```

## Release

1. Merge feature PRs (with changesets) to `main`.
2. On `main`, run **`pnpm release:tag:push`** — pick bump type, confirm, tag, push; CI publishes to npm.
3. See [DEVELOPERS.md](../DEVELOPERS.md).
