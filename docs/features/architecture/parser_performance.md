# Parser Performance (Peggy / grammar_new)

## Objective

Establish a measurable baseline for V2 parser speed and memory footprint, apply Peggy best practices during grammar review, and only trade readability for optimizations that demonstrate **>2× improvement** on representative workloads.

## Status

Baseline harness in place. Grammar changes require before/after benchmark comparison against [`benchmarks/parser-baseline.json`](../../../packages/template-engine-core/benchmarks/parser-baseline.json).

## Methodology

### 1. Hypothesis → change → measure

1. Record baseline (`pnpm run benchmark:parser`).
2. State the hypothesis (for example, “reordering `TemplateParts` reduces backtracking on text-heavy templates”).
3. Apply one grammar change.
4. Re-run the benchmark under the same Node version and iteration counts.
5. Accept the change only if median throughput improves **>2×** _or_ heap delta improves **>2×** without a readability regression; otherwise keep the more readable form.

### 2. Harness

| Command                          | Purpose                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------- |
| `pnpm run benchmark:parser`      | Human-readable table; 500 timed parses per fixture after 50 warmup iterations |
| `pnpm run benchmark:parser:json` | Machine-readable output for diffing baselines                                 |
| `pnpm run bench`                 | Vitest/tinybench interactive comparison during development                    |

Fixtures cover real recipes (`.v2.template`), micro-expressions, text-heavy HTML, tag-heavy output, and one legacy recipe for cross-parser context.

Metrics per fixture:

- **µs/parse** and **parses/s** — wall-clock throughput
- **AST node count** — proxy for allocation pressure from semantic actions
- **heap Δ/parse** — when Node is started with `--expose-gc`

### 3. Environment notes

- Parsers are **pre-generated at build time** (`build:parsers`); never compile grammar at runtime.
- Do **not** enable Peggy’s `--cache` flag unless a fixture shows pathological backtracking; Peggy documents that cache avoids exponential time but **slows typical parses**.
- Pin Peggy version in `package.json`; upgrades require a new baseline commit.

## Peggy Best Practices (applied to grammar_new)

### Already in good shape

| Practice                          | grammar_new                                                       |
| --------------------------------- | ----------------------------------------------------------------- |
| Build-time code generation        | `peggy --format es` → `lib/parser_new.js`                         |
| No per-parse tracing overhead     | Unlike legacy `grammar.peggy`, no `log()` in every rule           |
| Silent whitespace                 | `ws = [ \t\n\r]*` (no captured string allocation)                 |
| Greedy literal capture            | `Literal = $((!TagStart .)+)` — one rule application per text run |
| Identifier as `$()` capture       | `Ident = $([a-zA-Z] [a-zA-Z_0-9-]*)`                              |
| Ordered choice for disambiguation | `PropertyAccess` before `Identifier`; `BracketLookup` before both |
| Minimal `text()` use              | Only `OutputTag` retains `raw: text()` for delimiter fidelity     |

### Review findings (no change recommended yet)

#### TemplateParts order (`OutputTag / ControlTag / Literal`)

**Current:** Tags are tried before literals.

**Trade-off:** On text-heavy templates, Peggy attempts tag rules at each `TemplateParts` boundary before `Literal` succeeds. Because `Literal` is greedy, this cost is paid once per literal _segment_, not per character.

**Hypothesis tested (2026-06-29):** Reordering to `Literal / OutputTag / ControlTag` on text-heavy (49 KB) and tag-heavy fixtures yielded **~1–5% throughput gain**, well below the 2× bar. **Kept tag-first order** for clearer review semantics (“try dynamic constructs, then static text”).

#### Literal merging in `buildTemplate`

**Legacy** merges adjacent `Literal` nodes in `buildTemplate`; **grammar_new** uses `parts.filter((part) => part)` only.

**Impact:** More AST nodes on templates with many small literal fragments (for example, HTML with frequent `{% if %}` blocks). Measure via AST node count before adding merge logic — merge code is readable but not free; adopt only if node reduction correlates with measurable parse/eval improvement.

#### Semantic predicates (`!TagStart`)

Required for correct delimiter handling in mixed content. Peggy discourages predicates in hot paths, but there is no simpler correct formulation for `{{` / `{%` disambiguation without a separate lexer. **Keep as-is.**

#### Nested `TemplateParts*` in `ForBlock` / `IfBlock`

Inherent to block structure. Performance scales with template size and nesting depth; optimize only if recipe-scale benchmarks show a problem.

#### `FilterPipeline` suffix repetition

`(ws "|" ws filter:FilterCall)*` is idiomatic Peggy. Rewriting to left-recursive or manual loop in semantic action is less readable with negligible gain on current fixtures.

## Readability vs optimization policy

```text
IF measured_speedup > 2.0 OR measured_memory_reduction > 2.0:
  consider optimization
ELSE:
  keep more readable grammar / semantic action
```

Readability signals for this project (aligned with [V2 design goals](./v2_design_goals.md)):

- One rule per syntactic concept, named after the concept
- Semantic actions that build typed AST nodes directly (no post-walk transforms in the grammar)
- Global initializer helpers (`buildTemplate`, `buildPropertyAccess`) over inline object literals repeated across rules

## grammar_new.peggy structure reference

```text
Start → TemplateParts*
TemplateParts → OutputTag | ControlTag | Literal
ControlTag → ForBlock | IfBlock
Expression → FilterPipeline → PrimaryExpression (+ filters)
PrimaryExpression → BracketLookup | PropertyAccess | Identifier | StringLiteral
Literal → (!TagStart .)+   // stops before {{ or {%
```

## Baseline snapshot (Node 24.18.0, 2026-06-29)

| Fixture                          | Input    | µs/parse | AST nodes |
| -------------------------------- | -------- | -------- | --------- |
| recipe-01-v2                     | 340 B    | 28       | 45        |
| recipe-04-v2                     | 401 B    | 22       | 48        |
| expr-simple                      | 23 B     | 2        | 3         |
| text-heavy                       | 49 KB    | 2,589    | 62        |
| tag-heavy                        | 500 tags | 710      | 1,500     |
| nested-for-stress (pure literal) | 14 KB    | 1,175    | 2         |

Full machine-readable baseline: [`packages/template-engine-core/benchmarks/parser-baseline.json`](../../../packages/template-engine-core/benchmarks/parser-baseline.json).

**Scaling observations:**

- Pure literals scale linearly with input size (~1,175 µs for 14 KB single node).
- Tag-heavy workloads scale with tag count (1,500 AST nodes for 500 expressions).
- Recipe-scale templates parse in **<30 µs** — optimization effort should target large generated templates, not typical recipes.

## Related documents

- [Modern syntax technical overview](./new_syntax_technical_overview.md)
- [V2 design goals](./v2_design_goals.md)
