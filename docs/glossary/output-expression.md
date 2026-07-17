# output expression

**Proposed** V2 and **partially shipped** experimental construct: text inside `{{ … }}` delimiters that evaluates to a value, applies optional filter pipelines, escapes, and appends to template output.

Destination surface for variable lookup, literals, filter chains (`| upper`, `| length`), and allowlisted function calls — not for imperative control flow. Control flow belongs in [Mustache sections](./mustache-section.md) over host-prepared context or in the [host layer](./host-layer.md).

**Shipped (experimental):** `parseModern` supports output expressions with dot access and filters. Function-call shape and full V2 grammar are **proposed**.

See [surface syntax](../features/language-spec/surface-syntax.md).
