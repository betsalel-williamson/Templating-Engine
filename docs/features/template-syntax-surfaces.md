# Template syntax surfaces

Two parsers share one [AST](../glossary/ast.md) and one [secure evaluator](../glossary/secure-evaluator.md). Only legacy syntax is stable and CLI-supported.

## Legacy syntax (stable)

Default for the CLI and the stable API. Derived from [mergeEngine](../glossary/merge-engine.md).

| Construct         | Syntax                   | Purpose                                            |
| ----------------- | ------------------------ | -------------------------------------------------- |
| Expression block  | `<~ ... ~>`              | Wrap dynamic content                               |
| Variable          | `<#name#>`               | Insert a context value                             |
| Indirect variable | `<##name##>`             | Use a value as the next lookup key                 |
| Function call     | `<{fn(args)}>`           | Call a registered function                         |
| Conditional       | `<+>`, `<->`, `<?cond?>` | Branch on a condition                              |
| Iteration         | `<*>`, `<[array]>`       | [Cross-product](../glossary/cross-product.md) loop |

Full reference: [Template language](../client/template-language.md) in the client guide.

## Modern syntax (experimental)

Available via `parseModern` in the core library. Uses `{{ ... }}` output delimiters and `{% ... %}` control-flow delimiters. **Not** exposed by the CLI.

### Shipped today

| Construct       | Syntax example                          | Notes                                 |
| --------------- | --------------------------------------- | ------------------------------------- |
| Output          | `{{ name }}`, `{{ user.address.city }}` | Dot property access on context `Map`s |
| Filter pipeline | `{{ value \| upper }}`                  | Composable `\|` transforms in output  |
| Conditional     | `{% if cond %}…{% else %}…{% endif %}`  | Exploratory — see direction below     |
| Iteration       | `{% for item in items %}…{% endfor %}`  | Exploratory — see direction below     |

Feature parity with legacy is incomplete. Parser and evaluator behavior for modern templates may change without notice.

### Direction (not yet normative)

Modern control-flow delimiters (`{% if %}`, `{% for %}`, and similar) are **implementation in flux**, not the long-term destination. V2 design targets **Mustache logic-less presentation**: templates render prepared data; branching, iteration planning, and side effects belong in host JavaScript/TypeScript. See [V2 design goals](./architecture/v2_design_goals.md). **ADR-002** will record the superseding decision ([issue #76](https://github.com/betsalel-williamson/Templating-Engine/issues/76)).

For exploratory modern-syntax design notes (delimiters, filters, property access), see [modern syntax technical overview](./architecture/new_syntax_technical_overview.md) — treat that shard as design exploration, not a shipping contract.

## Orthogonality

Constructs that accept values also accept templates that resolve to those values — array names, slice bounds, property keys, function arguments, and conditions can be dynamic. See [language orthogonality](./architecture/language_orthogonality.md).
