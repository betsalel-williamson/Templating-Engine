---
name: legacy-template-codegen
description: >-
  Build applications with legacy template code generation using
  @bwilliamson/template-engine-core (parseLegacy + createSecureEvaluator).
  Use when implementing CLIs, reports, SQL/config generators, or any tool where
  host-prepared data projects into structured text — especially dogfood
  calculator-cli or "use templates to build this app" tasks.
---

# Legacy template code generation

## When templates earn their keep

Use legacy templates when output is **structured text from data**:

- CLI help/usage generated from a command registry
- Formatted results, tables, or error lines from evaluated context
- SQL/config/report fragments (see recipe `01-dynamic-sql-generation`)

Keep **logic in TypeScript**: parsing argv, math, validation, file I/O.

## When TypeScript only

- Single literal strings with no data-driven structure
- Algorithms and control flow
- Parsing and evaluation

## Host workflow

1. Prepare a `Map` data context (nested maps for objects).
2. `parseLegacy(templateSource)` → AST.
3. `createSecureEvaluator({ functions, parseTemplate: parseLegacy })` → `evaluate(ast, context)`.
4. Register host functions with `functions` map when templates call `<{fn()}>`.

Read [`docs/client/template-language.md`](../../../docs/client/template-language.md) for delimiter reference.

## Legacy constructs (high impact)

| Pattern         | Syntax                   | Use                                  |
| --------------- | ------------------------ | ------------------------------------ |
| Variable insert | `<#key#>`                | Simple substitution                  |
| Conditional     | `<+>...<->` + `<?cond?>` | Branch on prepared flags             |
| Iteration       | `<~...<*><[items]>~>`    | Lists from host arrays               |
| Delimiters      | `<*?, :>`                | Commas between items, not after last |
| Functions       | `<{name(args)}>`         | Host-registered formatters           |

## Calculator-cli requirements (Option D)

When this skill is active for `calculator-cli`:

1. **`help.template`** (or equivalent) — usage from operation registry.
2. **Runtime template** — e.g. `format-result.template` for successful `eval`/`div` output or structured errors.
3. **Do not** import template engine on Arm A-style tasks (skill absent).

## Anti-patterns

- Putting expression parsing inside templates
- One-line templates that are clearer as TS strings
- `parseModern` / V2-only syntax on legacy tasks

## Stop

Stop when task acceptance + spec-alignment pass. No clarifying questions.
