# Task: Calculator CLI (app codegen dogfood)

You are working in this repository only. Do not ask clarifying questions. Do not wait for human approval. Stop when acceptance checks pass.

## Goal

Implement a calculator CLI per **`spec.md`** in this directory.

## Arm you are in

- If the **`legacy-template-codegen`** skill is available: you are **Arm B**. Use legacy templates for **help/usage** and **at least one runtime output path** (results or formatted errors). Import `@bwilliamson/template-engine-core` with `parseLegacy` and `createSecureEvaluator`.
- If no treatment skill is provided: you are **Arm A**. Use TypeScript only. **Do not** import `@bwilliamson/template-engine-core` or use `.template` files.

## Requirements

1. Create `package.json`, `tsconfig.json`, `src/`, build to `dist/cli.js`.
2. Implement all commands in `spec.md`.
3. Add unit tests under `src/` if helpful; acceptance is black-box.
4. Keep changes inside `allowlist.txt`.

## Suggested layout (Arm B)

```text
src/
  cli.ts              # argv parsing, dispatch
  eval.ts             # expression evaluator (TS)
  registry.ts         # operation metadata for help template
  render-help.ts      # host → help.template
  render-output.ts    # host → format-result.template (or similar)
templates/
  help.template
  format-result.template
```

## Stop condition

From repo root (Node 24 login shell):

```bash
cd evals/dogfood/tasks/calculator-cli && pnpm install && pnpm build
DOGFOOD_WORKTREE=<worktree-root> pnpm exec vitest run \
  --config ../../../vitest.acceptance.config.ts acceptance/
node spec-alignment.mjs <worktree-root>
```

When acceptance + spec-alignment pass, stop.
