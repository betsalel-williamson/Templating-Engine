# V2 Design Goals

## Objective

Define the human- and machine-review goals that guide Version 2 syntax and API decisions, alongside the mathematical transformation model described in [V2 mathematical design](./v2_mathematical_design.md).

## Status

V2 is **in active design**. [ADR-001](./adr-001-adopt-pkl.md) (Pkl adoption) is **fully superseded** — Pkl is not a parallel or recommended path. The normative decision record is [ADR-002: Mustache logic-less + JS/TS-first for code generation](./adr-002-mustache-js-first-code-generation.md).

The current parser and recipe implementations are exploratory. Goals here steer decisions; they do not freeze syntax that is not yet shipped. Where the codebase still exposes exploratory control-flow delimiters, treat that as implementation in flux—not the long-term destination.

## Primary Goals

### 1. Logic-less presentation (Mustache philosophy)

Templates render **presentation**; branching, iteration planning, aggregation, and side effects belong in the **host JavaScript/TypeScript** layer that prepares template context.

- **Separate logic from markup.** Follow the [Mustache](https://mustache.github.io/) principle: templates show data; the host program shapes data.
- **Prefer sections over imperative loops.** Repetition and conditional blocks in template text should express views over data the host already prepared—not reimplement `for` / `if` control flow inside the template language.
- **Safer by default.** Keeping logic out of template text reduces accidental complexity, eases security review, and makes golden-file tests deterministic.

This does not mean templates are dumb string substitution. Output expressions, filter pipelines, and section rendering still express the mathematical transformation model—but **control decisions happen before render**.

### 2. JavaScript / TypeScript first

V2 serves a **JS/TS-first** ecosystem. When syntax is undecided, default to what a TypeScript developer already knows:

- Dot notation for property access (`user.address.city`)
- Bracket notation for dynamic keys (`settings[env + '-db-host']`)
- Pipe (`|`) for composable transforms inside output expressions
- Host-side data prep with ordinary JS/TS (arrays, maps, functions) instead of template-local variables and statements

The engine does **not** execute arbitrary JavaScript inside template text. Host code prepares context; templates project and format it.

### 3. Concise yet expressive (humans and LLMs)

Templates should say what they mean without ceremony.

- **Verbose templates cost more to review.** Every extra delimiter, keyword, or nested block adds cognitive load for humans and for LLM-assisted review.
- **Fewer tokens, same intent.** Prefer host-prepared structures plus short output expressions over long imperative template programs.
- **Shorthand is welcome when it is widely understood.** Favor familiar JS/TS mental models over niche DSL symbols when both express the same idea.

### 4. No overlapping concepts (orthogonality)

Each construct should have **one clear job**. Avoid multiple ways to do the same thing unless legacy parity explicitly requires it.

| Concept          | Primary surface (destination)                         |
| ---------------- | ----------------------------------------------------- |
| Iteration        | Host prepares arrays; template sections render items  |
| Delimited output | `\| join(', ')` (or host-prepared string)             |
| Conditionals     | Host prepares flags/variants; template sections       |
| Data transforms  | Filter pipeline (`\| map`, `\| filter`, …) in `{{ }}` |
| Dynamic keys     | Bracket lookup in output expressions                  |

When two constructs overlap (for example, a special property and a filter both exposing length), prefer the filter and document the deprecation path. See [Language orthogonality](./language_orthogonality.md).

### 5. Easy to review (humans and LLMs)

Templates are reviewed often—in PRs, in recipes, and in agent-generated output. Design for **scannable structure**:

- Linear data flow (left-to-right pipes in output expressions) over deeply nested template programs
- Predictable section boundaries instead of ad hoc control-flow keywords
- Golden-file recipes that show canonical patterns for real workloads
- Self-contained parse diagnostics that can be pasted directly into LLM prompts for automated fixes (see [Parse diagnostics](./parse_diagnostics.md))

Reviewers (human or LLM) should be able to answer quickly: _what data is read, what transforms run, and what text is emitted._

### 6. Mathematical transformation, modern presentation

Preserve the legacy insight that templating is **data transformation**, not imperative programming—but express it with readable, logic-less presentation syntax. See [V2 mathematical design](./v2_mathematical_design.md) for the operator mapping (`<*>`, `<*?>`, `<+>` → projection, join, conditional views).

Transformation can happen in **two coordinated places**:

1. **Host JS/TS** — shape, filter, zip, and branch before render.
2. **Template output pipelines** — compose filters inside `{{ ... }}` for presentation-time formatting.

## Decision Checklist

When proposing or reviewing a V2 language feature, ask:

1. **Can this logic live in host JS/TS instead of template text?** If yes, prefer host prep.
2. **Is it the shortest clear expression of this pattern?** If not, can a filter or precomputed context remove boilerplate?
3. **Does it overlap an existing construct?** If yes, justify or consolidate.
4. **Would a JS/TS developer recognize it without reading a style guide?**
5. **Can a reviewer trace data flow in one pass?**
6. **Does it work in an output pipe chain without special cases?**

## Related Documents

- [ADR-002: Mustache logic-less + JS/TS-first for code generation](./adr-002-mustache-js-first-code-generation.md) — normative architecture decision
- [V2 mathematical design](./v2_mathematical_design.md) — operator metaphor and pipeline principles
- [Modern syntax technical overview](./new_syntax_technical_overview.md) — current exploratory delimiters, filters, and grammar direction
- [Language orthogonality](./language_orthogonality.md) — composability and dynamic value rules
- [Host environment integration](./host_environment_integration.md) — decoupling template language from Node.js implementation
