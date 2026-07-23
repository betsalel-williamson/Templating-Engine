# Calculator CLI — functional specification

Normative behavior for **both** dogfood arms. Implementation may differ; black-box acceptance must match.

## Location

Build under `evals/dogfood/tasks/calculator-cli/` (greenfield mini-package).

## Invocation

From task directory after `pnpm build`:

```bash
node dist/cli.js <command> [args...]
```

## Commands

| Command  | Arguments      | stdout                             | stderr                | exit  |
| -------- | -------------- | ---------------------------------- | --------------------- | ----- |
| `add`    | `<a> <b>`      | sum (number)                       | usage on bad args     | 0 / 1 |
| `sub`    | `<a> <b>`      | difference                         | usage on bad args     | 0 / 1 |
| `mul`    | `<a> <b>`      | product                            | usage on bad args     | 0 / 1 |
| `div`    | `<a> <b>`      | quotient with **2 decimal places** | divide-by-zero, usage | 0 / 1 |
| `eval`   | `<expression>` | numeric result                     | parse/eval error      | 0 / 1 |
| `--help` | —              | usage listing all commands         | —                     | 0     |

## Expression grammar (`eval`)

- Decimal numbers
- Operators: `+`, `-`, `*`, `/`
- Parentheses
- Standard precedence
- Division by zero → error on stderr, exit 1

## Examples

```text
node dist/cli.js add 2 3        → 5
node dist/cli.js div 7 2        → 3.50
node dist/cli.js eval "2+3*4"   → 14
node dist/cli.js div 1 0        → stderr message, exit 1
```

## Arm-specific rules (see `task.md`)

- **Arm A:** TypeScript only; no `@bwilliamson/template-engine-core`; no `.template` files; no `src/generated/`.
- **Arm B:** **Build-time TS codegen** — `.template` meta-patterns + `scripts/codegen.mjs` expand into `src/generated/*.ts`. Template engine runs at **codegen only**, not in the running CLI.
