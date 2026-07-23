---
name: legacy-template-codegen
description: >-
  Generate TypeScript source files from legacy template meta-patterns using
  @bwilliamson/template-engine-core at build time (parseLegacy + createSecureEvaluator).
  Use when building apps via template→code expansion — calculator-cli dogfood,
  SQL/config generators, or "write templates that expand into TS/source files".
---

# Legacy template → TypeScript codegen

## Core idea

**Templates are the authoring surface.** Compact legacy template files describe meta-patterns (command tables, help blocks, dispatch stubs). A **build-time codegen script** expands them into `.ts` files under `src/generated/`. The shipped CLI uses **only compiled TypeScript** — no template engine at runtime.

Arm A writes TypeScript directly. Arm B writes **smaller template sources** + a thin codegen driver; tokens go into template authoring, not hand-typing repetitive TS.

## Build-time workflow (Arm B)

1. Define a **data model** in TypeScript (e.g. `commands.json` or `registry.ts` exported metadata only).
2. Author **`.template` files** that emit TypeScript **source text** when evaluated with that context.
3. `scripts/codegen.mjs` (or `pnpm codegen`):
   - load command registry into `Map` context
   - `parseLegacy(template)` → `createSecureEvaluator` → `evaluate` → string of TS source
   - write `src/generated/help.ts`, `src/generated/dispatch.ts`, etc.
4. `pnpm build` = `pnpm codegen && tsc`
5. `src/cli.ts` imports from `./generated/` — **must not** import `template-engine-core`.

## When templates earn their keep (codegen)

- Repetitive TS structures driven by a table (commands, routes, enum dispatch)
- Help/usage strings that mirror the same registry
- SQL/config/report **files** (recipe `01-dynamic-sql-generation`)

## When TypeScript only (no template)

- Expression parser / evaluator algorithms
- Arg parsing control flow
- One-off glue with no repeated pattern

## Legacy constructs for TS emission

| Pattern            | Syntax                | Codegen use                            |
| ------------------ | --------------------- | -------------------------------------- |
| Iteration          | `<~...<*><[items]>~>` | Emit one TS block per registry row     |
| Delimiters         | `<*?\n:>`             | Join emitted lines                     |
| Literals in output | ``<`...`>``           | Wrap emitted TS keywords/punctuation   |
| Variables          | `<#field#>`           | Substitute names, operators, summaries |

## Calculator-cli requirements

1. **`scripts/codegen.mjs`** — imports `@bwilliamson/template-engine-core`, writes `src/generated/*.ts`.
2. **≥2 `templates/*.template`** — meta-patterns that expand into TS (e.g. `help.ts.template`, `dispatch.ts.template`).
3. **`src/generated/`** — committed or build output consumed by `tsc`; must exist after `pnpm codegen`.
4. **No runtime template engine** in `src/cli.ts` or other runtime modules.

## Example meta-pattern (dispatch stub)

Template `templates/dispatch.ts.template` (conceptual):

```text
<~    case '<#name#>':
      runBinary(<#op#>, args);
      break;
`><*><[commands]>~>
```

Codegen evaluates with `commands` array in context → writes `src/generated/dispatch.ts`.

## Anti-patterns

- Runtime `renderHelp()` / `parseLegacy` inside the CLI hot path
- Templates that only format user-facing stdout (that is not TS codegen)
- `parseModern` on legacy tasks

## Stop

`pnpm codegen && pnpm build`; acceptance + spec-alignment pass. No clarifying questions.
