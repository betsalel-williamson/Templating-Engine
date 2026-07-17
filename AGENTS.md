# AGENTS.md

## Cursor Cloud specific instructions

Standard commands live in `package.json` scripts, `README.md`, and `DEVELOPERS.md`; prefer those. Notes below are the non-obvious gotchas.

### Toolchain / Node version (important)

- This repo requires **Node >= 24** (`.nvmrc` = 24) with `engine-strict=true`, so `pnpm install` and most scripts **fail on the VM's default `/exec-daemon/node` (v22)**.
- Node 24 is installed via `nvm` (default alias) and `pnpm@9.15.9` is provided via `corepack`. The update script refreshes dependencies with the correct Node.
- The catch: a **login shell** (`bash -lc '...'`) picks up Node 24 (via a `~/.bashrc` nvm prepend), but a **bare/non-login shell** resolves `node` to `/exec-daemon/node` (v22) and `pnpm install` then errors with `ERR_PNPM_UNSUPPORTED_ENGINE`.
- Therefore run repo commands in a login shell, e.g. `bash -lc 'pnpm run test'`, or first run `. "$HOME/.nvm/nvm.sh" && nvm use default` in the current shell.

### Services / packages

This is a pnpm monorepo with no long-running servers or databases. Two publishable packages:

- `@bwilliamson/template-engine-core` — parser/evaluator library. Its build/test/typecheck first run `build:parsers` (Peggy grammar → `lib/parser*.js`), so those steps regenerate parser artifacts automatically.
- `@bwilliamson/template-engine-cli` — the runnable `template-engine` CLI (depends on core via `workspace:*`).

### Running the CLI (the "app")

Build first (`pnpm run build`), then run the built entry directly:

```bash
bash -lc 'node packages/template-engine-cli/dist/cli.js --template <file> --data <file.json>'
# or pipe a template via stdin:
bash -lc 'echo "Hello, <#name#>!" | node packages/template-engine-cli/dist/cli.js --data <file.json>'
```

The CLI registers no template functions by design; `--data` (JSON) is required.

### Checks

`pnpm run check` runs typecheck + lint + format:check + build + test. Pre-commit hooks (husky + `scripts/pre-commit-affected.mjs`) run typecheck/build/tests only for affected packages, and `commit-msg` enforces Conventional Commits via commitlint.
