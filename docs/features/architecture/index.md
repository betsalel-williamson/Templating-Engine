# Architecture

Design notes and ADRs for the templating engine.

## Decision records

- [ADR-002: Mustache logic-less + JS/TS-first for code generation](./adr-002-mustache-js-first-code-generation.md) — **current north star**
- [ADR-004: Abstract host invocation for filters and functions](./adr-004-abstract-host-invocation.md) — invocation contracts and reserved backend direction
- [ADR-005: Retire all SEA CLI binaries](./adr-005-retire-sea-binaries.md) — npm/npx is the supported CLI install path
- [ADR-006: Dogfood gate before broad V2 engine TDD](./adr-006-dogfood-gate.md) — A/B Cursor eval; go / slim-go / no-go before broad TDD
- [ADR-001: Pkl adoption (superseded)](./adr-001-adopt-pkl.md)
- [ADR-003: Retire Windows SEA and CI (superseded)](./adr-003-retire-windows-sea-ci.md)

## V2 direction

- [V2 design goals](./v2_design_goals.md)
- [V2 mathematical design](./v2_mathematical_design.md)
- [Templating evolution and tool landscape](./templating_evolution.md)

## V2 language specification (paper-first)

**Proposed** destination language — [language spec index](../language-spec/index.md):

- [Overview and non-goals](../language-spec/overview-and-non-goals.md)
- [Surface syntax](../language-spec/surface-syntax.md)
- [Host layer contracts](../language-spec/host-layer-contracts.md)
- [Evaluation, security, and diagnostics](../language-spec/evaluation-security-diagnostics.md)
- [Tooling goals](../language-spec/tooling-goals.md)
- [Open questions and constraints](../language-spec/open-questions.md)

## Language design

- [Modern syntax technical overview](./new_syntax_technical_overview.md)
- [Language orthogonality](./language_orthogonality.md)
- [Property access patterns](./property_access_patterns.md)
- [Host environment integration](./host_environment_integration.md)

## As-built contracts

- [Parse diagnostics](./parse_diagnostics.md)
- [Secure templating guide](./secure_templating_guide.md)
- [Parser performance (Peggy)](./parser_performance.md)
