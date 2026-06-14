# Developer Guide

## Layout

```
packages/
  template-engine-core/   @bwilliamson/template-engine-core
  template-engine-cli/    @bwilliamson/template-engine-cli
```

## Setup

```bash
pnpm install
```

Requires Node.js >= 22.12.0 (see `.nvmrc`).

## Common commands

```bash
pnpm run build        # build all packages
pnpm run test         # test all packages
pnpm run typecheck    # TypeScript check all packages
pnpm run check        # typecheck + lint + format + build + test
```

## Changesets

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

## Pre-commit hooks

- `lint-staged` formats and lints staged files.
- `scripts/pre-commit-affected.mjs` typechecks, builds, and runs related tests for touched packages only.
- `commitlint` enforces Conventional Commits on commit messages.
