# Template syntax surfaces

## Legacy syntax (stable)

Default for CLI and stable API. Derived from [mergeEngine](../glossary/merge-engine.md).

| Construct         | Syntax                   | Purpose                                              |
| ----------------- | ------------------------ | ---------------------------------------------------- |
| Expression block  | `<~ ... ~>`              | Wrap dynamic content                                 |
| Variable          | `<#name#>`               | Insert a context value                               |
| Indirect variable | `<##name##>`             | Use a value as the next lookup key                   |
| Function call     | `<{fn(args)}>`           | Call a registered function                           |
| Conditional       | `<+>`, `<->`, `<?cond?>` | Branch on a condition                                |
| Iteration         | `<*>`, `<[array]>`       | [Cross-product](./../glossary/cross-product.md) loop |

Full reference: [Template language](../client/template-language.md) in the client guide.

## Modern syntax (experimental)

Jinja2/Handlebars-inspired `{{ ... }}` and `{% ... %}` blocks. Available via `parseModern`; feature parity with legacy is still in progress. See [modern syntax technical overview](./architecture/new_syntax_technical_overview.md).

## Orthogonality

Constructs that accept values also accept templates that resolve to those values — array names, slice bounds, property keys, function arguments, and conditions can be dynamic. See [language orthogonality](./architecture/language_orthogonality.md).
