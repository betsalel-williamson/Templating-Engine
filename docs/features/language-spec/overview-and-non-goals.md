# Overview and Non-Goals

**Status:** **Proposed** destination language. [Legacy syntax](../../glossary/legacy-syntax.md) remains **shipped** until a V2 parser lands.

## Purpose

Define a **technically complete on-paper** V2 language so maintainers can judge fitness, estimate implementation slices, and decide go/no-go **before** engine work. This shard states what the language is for, what it is not, and how it relates to existing parsers.

## What V2 is

V2 is **Mustache [logic-less presentation](../../glossary/logic-less-presentation.md)** with a **JavaScript/TypeScript-first [host layer](../../glossary/host-layer.md)** for **code generation** workloads: SQL, configs, reports, batch artifacts, and other structured text from prepared data.

Templates **project and format** context; they do not orchestrate programs. Mathematical transformation semantics from mergeEngine (projection, cross-product joins, conditional vectors) survive through **host-prepared structures** and concise template sections — see [V2 mathematical design](../architecture/v2_mathematical_design.md).

Primary audience: TypeScript developers and LLM-assisted reviewers who need scannable, concise templates in PRs and recipes — and hosts that want the language to **integrate cleanly into tools** so agent and human workflows stay reviewable and trustworthy.

## Relationship to existing surfaces

### Legacy (`parseLegacy`) — **shipped**

- Stable CLI and API surface today (`<#name#>`, `<*>`, `<+>`, `<{fn()}>`, …).
- Preserves mergeEngine mathematical semantics in RPL-style tags.
- **Not** the long-term destination; recipes migrate via host context prep, not a delimiter swap alone.

### Modern (`parseModern`) — **experimental**

- Library-only; not CLI-supported.
- **Shipped subset:** `{{ }}` output expressions, dot property access, `|` filter pipelines in output.
- **Not destination:** `{% if %}`, `{% for %}`, and other Jinja-style control-flow delimiters — treat as implementation in flux.
- A future V2 parser may reuse output-expression grammar ideas but **must not** treat exploratory control blocks as normative.

### V2 destination — **proposed**

- Mustache sections (`{{#}}`, `{{^}}`, `{{/}}`) for iteration and conditionals over host-prepared values.
- Output expressions with filter pipelines and host-registered function calls.
- No imperative template statements.

## Goals (summary)

Aligned with [V2 design goals](../architecture/v2_design_goals.md) and [ADR-002](../architecture/adr-002-mustache-js-first-code-generation.md):

1. **Logic-less presentation** — control in host TS; templates render views.
2. **JS/TS-first ergonomics** — dot and bracket access, pipe chains, familiar mental models.
3. **Concise, tool-friendly review** — templates and host code stay easy to scan in editors, PRs, and agent loops ([tooling goals](./tooling-goals.md)).
4. **Orthogonality** — one job per construct; filters over special properties where they overlap.
5. **Mathematical transformation** — host shapes data; template expresses projection and formatting.
6. **Secure by default** — escaping, allowlisted registries, explicit TrustedTemplate for re-parse.
7. **Compact presentation** — prefer host-prepared context plus short template surfaces over large imperative template programs. Any claim of review-time or cost improvement requires measurements recorded when available; this goal states structure preference only.

## Compact pipeline (intent)

V2 is meant to sit in a **human- and LLM-forward** path from idea to artifact:

```text
High-level intent (specs / shards)
        ↓
Host meta-layer (TS data prep, registries, TrustedTemplate)
        ↓
Compact template presentation (Mustache + output expressions)
        ↓
Generated product (SQL, configs, reports, …)
```

The intent is not prettier delimiters alone: reviewers and agents can focus on **intent and host contracts**, with a small template surface that expands under documented evaluation and security rules. See [tooling goals](./tooling-goals.md) for editor and diagnostic support that makes this pipeline practical.

## Non-goals

Explicitly **out of scope** for the V2 destination:

| Non-goal                                                  | Rationale                                                                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Jinja-style `{% %}` control flow                          | Violates logic-less / Mustache philosophy ([ADR-002](../architecture/adr-002-mustache-js-first-code-generation.md)) |
| [Pkl](https://pkl-lang.org/) or external config languages | [ADR-001](../architecture/adr-001-adopt-pkl.md) fully superseded                                                    |
| Arbitrary JavaScript in template text                     | Host prepares context; engine does not embed a JS runtime in strings                                                |
| Built-in I/O in template functions                        | No file system, network, or shell from template registries                                                          |
| Browser-view-only templating                              | Primary workload is code generation, not HTML view layers alone                                                     |
| One-to-one legacy delimiter migration                     | Context and section modeling replace RPL operators                                                                  |

## Acceptance bar (paper spec)

Enough detail across this folder to:

- Estimate TDD slices (parser, evaluator, filters, functions, diagnostics, tooling).
- Decide go/no-go on V2.1 implementation cost.
- Trace every construct to **host** vs **template** responsibility.

Implementation tracking issues (#21, #27, #28, editor tooling) remain **blocked on accepting this design** — they are spec inputs, not immediate engine work.
