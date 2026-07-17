# Architectural Guide: Host Environment Integration

## Core Principle: The Language is Decoupled from the Runtime

Our templating engine's design separates the **template language** from the **host that implements transforms**.

- **The Template Language:** Public surface of syntax (`{{...}}` sections and output expressions) and **abstract** filter/function names (`| length`, `| upper`, `formatId(...)`). Templates stay portable across host runtimes that honor the same names and value contract ([ADR-004](./adr-004-abstract-host-invocation.md)).
- **The Default Host Runtime:** TypeScript/Node.js parses and evaluates templates and supplies filter/function implementations. This is the path that delivers product value today and should use the full power of that environment for efficiency and maintainability.
- **Direction:** The same abstract names remain valid if a host later attaches additional trusted backends under one registration model (capability labels, JSON-serializable value exchange first). See [ADR-004](./adr-004-abstract-host-invocation.md).

This decoupling is the primary strategy for long-term maintainability and an open path for future host backends without rewriting templates.

## What This Means in Practice

### How the default JS/TS host implements abstract names

We use Node.js features to make implementations of abstract filters and functions simple and performant.

- **Array Filters (`length`, `slice`, `reduce`):** Implementations use `Array.prototype.length`, `.slice()`, and `.reduce()` internally. The template author only sees `| length`, `| slice:1:5`, etc.
- **String Filters (`upper`, `trim`):** Implementations use `String.prototype.toUpperCase()`, `.trim()`, etc. The template author only sees `| upper`.
- **Math Filters (`add`):** Implementations use standard JavaScript math operators. The template author only sees `| add:5`.
- **Async Operations:** Host functions and filters may return Promises; the evaluator awaits them in walk order.
- **Development Ecosystem:** Node.js tooling (`npm`, `vitest`, `typescript`) supports rapid, reliable development and testing.
- **Distribution:** Install and run the CLI via npm or npx (`@bwilliamson/template-engine-cli`). See [ADR-005: Retire all SEA CLI binaries](./adr-005-retire-sea-binaries.md).

### Keep the template language abstract

Template text uses abstract names and Mustache presentation—not raw host-language APIs:

- Prefer `{{ myArray | length }}` over exposing a runtime-specific property name such as `.length` on a host object.
- Prefer `{{ myObject | json_encode }}` over embedding a host global such as `JSON.stringify`.
- Prefer host-prepared arrays/flags plus Mustache sections over embedding host-language map/join expressions in the template.

By keeping this boundary, authors get a simple portable language, and host developers keep a powerful default runtime—with room to attach further trusted backends later under [ADR-004](./adr-004-abstract-host-invocation.md).
