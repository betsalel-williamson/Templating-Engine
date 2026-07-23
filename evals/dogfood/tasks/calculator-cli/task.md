# Task: Calculator CLI (app codegen dogfood)

You are working in this repository only. Do not ask clarifying questions. Do not wait for human approval. Stop when acceptance checks pass.

## Goal

Implement a calculator CLI per **`spec.md`** in this directory.

## Arm you are in

- If the **`legacy-template-codegen`** skill is available: you are **Arm B** (**build-time TS codegen**). Author compact `.template` meta-patterns that a codegen script expands into `src/generated/*.ts`. Use `@bwilliamson/template-engine-core` only in `scripts/codegen.mjs` — **not** in runtime `src/cli.ts`.
- If no treatment skill is provided: you are **Arm A**. Write TypeScript directly under `src/`. No templates, no template engine, no `src/generated/`.

## Arm B layout (required)

```text
scripts/codegen.mjs          # parseLegacy → evaluate → write src/generated/*.ts
templates/
  help.ts.template           # expands to export const HELP_TEXT = `...`
  dispatch.ts.template       # expands switch cases or handlers from command registry
src/
  cli.ts                     # imports from ./generated/ — no template-engine-core
  eval.ts                    # expression math (hand-written TS)
  registry.ts                # command metadata fed into codegen context
src/generated/               # output of pnpm codegen (help.ts, dispatch.ts, …)
```

## Build

```json
"scripts": {
  "codegen": "node scripts/codegen.mjs",
  "build": "pnpm codegen && tsc"
}
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
