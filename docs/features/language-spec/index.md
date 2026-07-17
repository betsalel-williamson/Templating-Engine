# V2 Language Specification (Paper-First)

**Status:** **Proposed** — on-paper design for go/no-go review and TDD slice estimation. Not shipped in product code until accepted and implemented.

Normative architecture decision: [ADR-002: Mustache logic-less + JS/TS-first for code generation](../architecture/adr-002-mustache-js-first-code-generation.md).

This specification consolidates destination language intent from [V2 design goals](../architecture/v2_design_goals.md), [V2 mathematical design](../architecture/v2_mathematical_design.md), and spec inputs from issues [#21](https://github.com/betsalel-williamson/Templating-Engine/issues/21) (functions + TrustedTemplate), [#27](https://github.com/betsalel-williamson/Templating-Engine/issues/27) (string filters), and [#28](https://github.com/betsalel-williamson/Templating-Engine/issues/28) (array filters).

## Shipped today vs proposed destination

| Surface                                          | Parser                         | Status                              | This spec                                                    |
| ------------------------------------------------ | ------------------------------ | ----------------------------------- | ------------------------------------------------------------ |
| [Legacy syntax](../../glossary/legacy-syntax.md) | `parseLegacy`                  | **Shipped** — stable, CLI-supported | Preserved; not the long-term destination                     |
| [Modern syntax](../../glossary/modern-syntax.md) | `parseModern`                  | **Experimental** — library-only     | Partial overlap; `{% %}` control flow is **not** destination |
| V2 logic-less presentation                       | _(not yet a dedicated parser)_ | **Proposed**                        | Normative target described in shards below                   |

## Specification shards

1. [Overview and non-goals](./overview-and-non-goals.md)
2. [Surface syntax](./surface-syntax.md)
3. [Host layer contracts](./host-layer-contracts.md)
4. [Evaluation, security, and diagnostics](./evaluation-security-diagnostics.md)
5. [Tooling goals](./tooling-goals.md)
6. [Open questions and constraints](./open-questions.md)

## Related design notes (not this spec)

Exploratory grammar notes, operator mapping, and historical research remain in the architecture guide — use them for context, not as shipping contracts:

- [Modern syntax technical overview](../architecture/new_syntax_technical_overview.md) — exploratory; includes superseded `{% %}` examples
- [Language orthogonality](../architecture/language_orthogonality.md)
- [Property access patterns](../architecture/property_access_patterns.md)
- [Host environment integration](../architecture/host_environment_integration.md)
