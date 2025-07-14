# Functional Style over Imperative

**Rationale:** Functional patterns, especially with `Option` and `Result`, lead to more declarative, readable, and less error-prone code by explicitly handling all possible states.

**Rule:** Prefer functional combinators (`.map()`, `.and_then()`, `.unwrap_or()`, etc.) over imperative `if let` or `match` blocks when the logic is a simple transformation or chaining of operations. Use `match` when complex, multi-path logic is required.
