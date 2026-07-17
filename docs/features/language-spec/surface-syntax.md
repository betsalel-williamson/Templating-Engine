# Surface Syntax

**Status:** **Proposed** V2 destination. **Shipped today:** legacy tags via `parseLegacy`; partial `{{ }}` output + filters via `parseModern` (experimental). **Not destination:** `{% %}` blocks in `parseModern`.

Normative philosophy: [Mustache](https://mustache.github.io/) logic-less tags. Templates contain **literals**, **output expressions**, **sections**, **partials**, and **comments** only.

## Delimiters and constructs

| Construct                                                | Syntax                  | Role                                                                      | Host vs template                                |
| -------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------- | ----------------------------------------------- |
| Literal text                                             | Plain characters        | Copied to output                                                          | Template                                        |
| [Output expression](../../glossary/output-expression.md) | `{{ … }}`               | Evaluate and emit escaped text                                            | Template syntax; values from context            |
| Positive section                                         | `{{#name}} … {{/name}}` | Render block when context value is truthy; iterate when value is an array | Template; array/boolean from host               |
| Inverted section                                         | `{{^name}} … {{/name}}` | Render block when value is falsy or missing                               | Template; flag from host                        |
| Partial                                                  | `{{> name}}`            | Include named partial template                                            | Template reference; partials registered by host |
| Comment                                                  | `{{! … }}`              | Ignored                                                                   | Template                                        |

Section names use the same identifier rules as output paths unless [bracket dynamic keys](#output-expressions) apply.

## Output expressions

**Proposed** canonical form inside `{{ }}`:

- **Variable lookup:** dot paths (`user.address.city`) and bracket dynamic keys (`settings[env + '-db-host']`) per [property access patterns](../architecture/property_access_patterns.md).
- **String and numeric literals** where the grammar supports them.
- **Filter pipeline:** left-to-right `|` chains — spec input [#27](https://github.com/betsalel-williamson/Templating-Engine/issues/27), [#28](https://github.com/betsalel-williamson/Templating-Engine/issues/28).
- **Function calls:** `fn(arg1, arg2)` with fully evaluated arguments — spec input [#21](https://github.com/betsalel-williamson/Templating-Engine/issues/21).

**Shipped (experimental)** in `parseModern` today: output delimiters, dot access, and filter pipelines. Function-call shape and Mustache sections are **not** shipped as the V2 destination parser.

### Initial filter set (proposed)

| Filter   | Input           | Result                                | Issue |
| -------- | --------------- | ------------------------------------- | ----- |
| `upper`  | string          | uppercase string                      | #27   |
| `lower`  | string          | lowercase string                      | #27   |
| `trim`   | string          | trimmed string                        | #27   |
| `length` | array or string | item/character count; non-array → `0` | #28   |
| `first`  | array           | first element or empty                | #28   |
| `last`   | array           | last element or empty                 | #28   |

Filters chain: `{{ " hi " | trim | upper }}`. Additional filters (math, `default`, encoding) are **proposed** extensions documented in [open questions](./open-questions.md) — not part of the minimal slice.

Filter arguments use a consistent abstract syntax (name and colon-separated args); exact delimiter rules are an open question.

## Sections (iteration and conditionals)

**Proposed** — replaces legacy `<*>`, `<+>`, `<->`, and **replaces** exploratory `{% for %}` / `{% if %}`.

When the host provides:

- **Array** — engine iterates the section body once per element; inner context pushes the element (Mustache scoping rules).
- **Boolean (or truthy/falsy scalar)** — engine includes or omits the block.
- **Function (lambda/macro)** — host executes registered callable; return type determines render path (data vs [TrustedTemplate](../../glossary/trusted-template.md)) — see [host layer contracts](./host-layer-contracts.md).

Inverted sections (`{{^}}`) cover else/missing cases without template-local `if/else` statements.

## Partials

**Proposed:** `{{> partialName}}` includes a named sub-template from a host-provided partial map. Partials compose; recursion depth is bounded by host-configurable limits (see [evaluation shard](./evaluation-security-diagnostics.md)).

Partial resolution strategy (file paths vs inline registry) is an open question.

## What stays out of template text

| Concern                              | Where it lives                             |
| ------------------------------------ | ------------------------------------------ |
| Loop planning, pagination, joins     | Host TypeScript                            |
| Branching on business rules          | Host prepares booleans or variant sections |
| Data fetch, validation, side effects | Host orchestration                         |
| Registry of filters and functions    | Host configuration at evaluator setup      |
| SQL parameterization policy          | Host context builders                      |

## Legacy mapping (informative)

| Legacy           | V2 destination (proposed)                 |
| ---------------- | ----------------------------------------- |
| `<#name#>`       | `{{ name }}`                              |
| `<*>…<[*]>`      | `{{#items}}…{{/items}}` with host array   |
| `<+>…<?cond?>`   | `{{#cond}}…{{/cond}}` or inverted section |
| `<{fn(a)}>`      | `{{ fn(a) }}` with allowlisted registry   |
| `<#arr.length#>` | `{{ arr }}` with length filter            |

## Orthogonality

Any construct that accepts a value also accepts an expression that resolves to that value — dynamic array names, slice bounds, property keys, and function arguments. See [language orthogonality](../architecture/language_orthogonality.md); destination examples use output expressions and sections, not `{% %}` blocks.
