# Pre-commit and pre-push hooks

Husky wires local git hooks. They must catch the same formatting failures CI runs (`pnpm run format:check`).

## Pre-commit (`.husky/pre-commit`)

1. **`lint-staged`** — formats (and eslint-fixes where configured) **staged** files:
   - `packages/**/*.{ts,mjs}` — eslint + prettier
   - `scripts/**/*.{js,mjs}` — eslint + prettier
   - `evals/**/*.{ts,mjs,js}` — prettier (dogfood harness)
   - `**/*.{json,jsonc,md,yml,yaml}` — prettier (nested docs and configs)
   - `eslint.config.mjs` — eslint + prettier
2. **`scripts/pre-commit-affected.mjs`** — typechecks/builds/tests for touched packages; also runs **`pnpm run format:check`** when prettier-covered files are staged (or when root config changes), so a missed lint-staged glob still fails the commit.

## Pre-push (`.husky/pre-push`)

- Runs **`pnpm run format:check`** on the whole tree (same gate as CI Format check).

## Commit message

- `commitlint` enforces Conventional Commits via `.husky/commit-msg`.

## Why this matters

If lint-staged only covers `packages/` and `scripts/`, new trees such as `evals/` can land unformatted and pass local commit/push while CI fails. Keep globs in sync when adding new source directories.
