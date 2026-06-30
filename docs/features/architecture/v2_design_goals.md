# V2 Design Goals

## Objective

Define the human- and machine-review goals that guide Version 2 syntax and API decisions, alongside the mathematical transformation model described in [V2 mathematical design](./v2_mathematical_design.md).

## Status

V2 syntax is **in active design**. Nothing in this document is a permanent standard. The current parser and recipe implementations are exploratory; goals here steer decisions rather than freeze them.

## Primary Goals

### 1. Concise yet expressive

Templates should say what they mean without ceremony. Prefer constructs that compress common patterns (iteration, branching, projection, joining) into a small number of readable tokens.

- **Verbose templates cost more to review.** Every extra delimiter, keyword, or nested block adds cognitive load for humans and for LLM-assisted review.
- **Shorthand is welcome when it is widely understood.** Favor familiar JavaScript/TypeScript idioms over niche DSL symbols when both express the same idea.

### 2. JavaScript / TypeScript first

V2 is a **JS/TS-first** template language. When syntax is undecided, default to what a TypeScript developer already knows:

- Dot notation for property access (`user.address.city`)
- Bracket notation for dynamic keys (`[env + '-db-host']`)
- Pipe (`|`) for composable transforms
- Block delimiters (`{{ }}`, `{% %}`) for output vs control flow

This does not mean the engine executes arbitrary JS in templates. It means surface syntax and mental models should align with the host ecosystem the project serves.

### 3. No overlapping concepts (orthogonality)

Each construct should have **one clear job**. Avoid multiple ways to do the same thing unless legacy parity explicitly requires it.

| Concept          | One primary V2 surface                     |
| ---------------- | ------------------------------------------ |
| Iteration        | `{% for item in collection %}`             |
| Delimited output | `\| join(', ')`                            |
| Conditionals     | `{% if %}` / ternary for simple cases      |
| Data transforms  | Filter pipeline (`\| map`, `\| filter`, …) |
| Dynamic keys     | Bracket lookup (`[expression]`)            |

When two constructs overlap (for example, a special property and a filter both exposing length), prefer the filter and document the deprecation path. See [Language orthogonality](./language_orthogonality.md).

### 4. Easy to review (humans and LLMs)

Templates are reviewed often—in PRs, in recipes, and in agent-generated output. Design for **scannable structure**:

- Linear data flow (left-to-right pipes) over deeply nested calls
- Consistent delimiter pairing (`{% for %}` … `{% endfor %}`, `{% if %}` … `{% endif %}`)
- Predictable naming (`loop.index`, `loop.last`) instead of magic iteration variables
- Golden-file recipes that show canonical patterns for real workloads
- Self-contained parse diagnostics that can be pasted directly into LLM prompts for automated fixes

Reviewers (human or LLM) should be able to answer quickly: _what data is read, what transforms run, and what text is emitted._

### 5. Mathematical transformation, modern syntax

Preserve the legacy insight that templating is **data transformation**, not imperative programming—but express it with modern, readable syntax. See [V2 mathematical design](./v2_mathematical_design.md) for the operator mapping (`<*>`, `<*?>`, `<+>` → `for`, `join`, `if`).

## Decision Checklist

When proposing or reviewing a V2 language feature, ask:

1. **Is it the shortest clear expression of this pattern?** If not, can shorthand or a filter remove boilerplate?
2. **Does it overlap an existing construct?** If yes, justify or consolidate.
3. **Would a JS/TS developer recognize it without reading a style guide?**
4. **Can a reviewer trace data flow in one pass?**
5. **Does it work in a pipe chain without special cases?**

## Known In-Flux Areas

Document intended direction here; implementation may lag until syntax stabilizes.

| Topic                                       | Current implementation          | Under consideration                                           |
| ------------------------------------------- | ------------------------------- | ------------------------------------------------------------- |
| String concatenation in bracket expressions | `~` (e.g. `[env ~ '-db-host']`) | `+` per [Language orthogonality](./language_orthogonality.md) |
| Ternary conditionals                        | Not yet implemented             | `{{ cond ? a : b }}`                                          |
| Math in expressions                         | Filters (`add`, `subtract`)     | Infix `+` / `-` for numeric literals                          |

## Related Documents

- [V2 mathematical design](./v2_mathematical_design.md) — operator metaphor and pipeline principles
- [Modern syntax technical overview](./new_syntax_technical_overview.md) — delimiters, filters, and grammar direction
- [Language orthogonality](./language_orthogonality.md) — composability and dynamic value rules
