# ADR-002: Mustache Logic-less + JS/TS-First for Code Generation

- **Status**: Accepted
- **Date**: 2026-07-17
- **Supersedes**: [ADR-001: Pkl adoption](./adr-001-adopt-pkl.md) — completely; Pkl is not a parallel or configuration side-path for this project

## Context

This repository ports legacy `mergeEngine` (RPL-style TCL templating) to TypeScript. Early exploration considered many tools — including [Pkl](https://pkl-lang.org/) — and briefly adopted Pkl as the future direction ([ADR-001](./adr-001-adopt-pkl.md)). That path is **obsolete**.

The primary workload for this engine is **code generation**: SQL, configs, reports, batch artifacts, and other structured text produced from live or prepared data — not browser view rendering alone. Authors need mergeEngine-class **mathematical indirection** (projection, cross-product joins, conditional vectors) without returning to a TCL-first surface syntax.

Industry research ([Templating evolution and tool landscape](./templating_evolution.md)) shows why no single tool won the whole market. For this project, the north star is a **host-integrated template engine** with:

- [Mustache](https://mustache.github.io/) **logic-less** presentation — templates project data; they do not execute imperative programs
- **JavaScript/TypeScript-first** data preparation — artisans shape context in ordinary TS; workers write concise sections and output expressions
- **RPL power via the host** — map, join, branch, and indirection live in TS context getters, lambdas, and macros — not in a rediscovered TCL or Jinja control-flow layer
- **Concise, reviewable syntax** — fewer tokens and delimiters for humans and LLM-assisted review

## Decision

Adopt **Mustache logic-less presentation + JS/TS-first host context** as the normative architecture for **code generation** in this templating engine.

1. **Templates are presentation.** Branching, iteration planning, aggregation, and side effects belong in host JavaScript/TypeScript that prepares template context before render.
2. **Mustache sections and output expressions** are the primary template surface (`{{#section}}`, `{{^section}}`, `{{variable}}`, filter pipelines in output expressions where the grammar supports them).
3. **Legacy RPL operators** (`<*>`, `<*?>`, `<+>`) map to host-prepared structures and sections — see [V2 mathematical design](./v2_mathematical_design.md).
4. **Pkl is dropped.** It is not recommended for configuration, templating, or any other lane in this repository. Use TypeScript (or plain data formats) for orchestration and config that feeds templates.
5. **Active development stays on this TypeScript engine.** Syntax and evaluator work align with [V2 design goals](./v2_design_goals.md) and ADR-002 — not with external standalone config languages.

## Design contracts (normative intent; not product implementation)

These are **architecture contracts** for future implementation and review. They describe boundaries; they are not shipped API guarantees until reflected in code and tests.

### Host-context logic

- The engine **asks the TypeScript context** for keys. Arrays drive section iteration; booleans drive conditional sections; functions/lambdas run in the host and return renderable values.
- **Orchestration lives in TS:** fetch, validate, paginate, map, filter, zip, and branch before or during context resolution — not as template statements.
- **Registry and allowlisting:** templates may invoke only host-registered functions/macros; unrecognized names fail safe (empty output or explicit diagnostic — product choice at implementation time).

### TrustedTemplate boundary

- Output from host functions is **data by default**: escaped and written to the buffer **without** rescanning for new template tags.
- When a host macro intentionally emits template syntax (e.g. pagination partials), it returns an explicit **`TrustedTemplate`** wrapper. Only trusted, developer-controlled code may construct `TrustedTemplate`; untrusted strings must never be promoted.
- Prevents SSTI and uncontrolled m4-style blind rescan of attacker-controlled content. See [V2 mathematical design](./v2_mathematical_design.md) §4 and [Secure templating guide](./secure_templating_guide.md).

### Recursion and depth

- The evaluator maintains a **context stack depth** limit to prevent macro/section recursion attacks (e.g. billion-laughs patterns).

### Context-aware escaping

- Default output escaping; explicit unescaped channels only where the output domain requires it and the contract is documented per [Secure templating guide](./secure_templating_guide.md).

## Tooling goals

Editor support is part of the architecture, not an afterthought:

- **VS Code syntax highlighting** for template delimiters, sections, and output expressions (tracked separately; see project issue backlog for editor tooling).
- **Go-to-definition / hover** for context keys and registered template functions where the host exposes a schema or registry manifest.

These goals improve human and LLM review; they do not change the logic-less / JS-first split.

## Consequences

### Positive

- Single coherent north star for syntax, security, and docs — no split-brain with Pkl or TCL-first surfaces.
- Smaller template grammar: fewer procedural constructs to parse, test, and secure.
- Templates stay scannable in PRs and agent-generated output ([V2 design goals](./v2_design_goals.md)).
- Live TS runtimes (proxies, async, signals) integrate naturally via context preparation.

### Negative / trade-offs

- Authors must learn the **artisan/worker split**: experts implement transforms in TS; workers cannot express arbitrary logic in template text.
- Legacy mergeEngine recipes require **context migration**, not a one-to-one delimiter swap.
- Standalone typed-config workflows that Pkl served in ADR-001 are **out of scope** for this repo; consumers use TS or their own config tools.

## Related documents

- [V2 design goals](./v2_design_goals.md) — reviewability, orthogonality, JS/TS-first checklist
- [V2 mathematical design](./v2_mathematical_design.md) — RPL operator mapping and security architecture
- [Templating evolution and tool landscape](./templating_evolution.md) — historical research; north star = this engine + ADR-002
- [ADR-001: Pkl adoption (superseded)](./adr-001-adopt-pkl.md) — historical record only
