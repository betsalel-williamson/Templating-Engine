# Architectural Guide: Host Environment Integration

## Core Principle: The Language is Decoupled from the Runtime

Our templating engine's design is governed by a strict separation of concerns between the **template language** and the **engine's runtime environment**.

- **The Template Language:** This is our public API, defined by the syntax (`{{...}}`, `{%...%}`) and a set of abstract filter names (`| length`, `| upper`). This language is, by design, **platform-agnostic**. A template written today must be executable by a future version of this engine written in any other language (e.g., Rust, Go) without modification.

- **The Engine Implementation:** This is the internal TypeScript code that parses and evaluates templates. This implementation **should leverage the full power of its host environment (Node.js)** to be efficient, robust, and easy to maintain.

This decoupling is our primary strategy for ensuring long-term maintainability and portability.

## What This Means in Practice

### How We **DO** Leverage JavaScript/Node.js

We use Node.js features to make the *implementation* of our abstract filters simple and performant.

- **Array Filters (`length`, `slice`, `reduce`):** Our filter implementations use `Array.prototype.length`, `.slice()`, and `.reduce()` internally. The template author only sees `| length`, `| slice:1:5`, etc.
- **String Filters (`upper`, `trim`):** Our filter implementations use `String.prototype.toUpperCase()`, `.trim()`, etc. The template author only sees `| upper`.
- **Math Filters (`add`):** Our filter uses standard JavaScript math operators. The template author only sees `| add:5`.
- **Async Operations:** We use Node's `async/await` syntax to seamlessly handle custom functions or filters that may need to perform asynchronous tasks (like a database lookup).
- **Development Ecosystem:** We use the Node.js ecosystem (`npm`, `vitest`, `typescript`) for rapid, reliable development and testing.
- **Distribution:** We use Node.js's Single Executable Application (SEA) feature for simple, dependency-free distribution of our CLI.

### How We **DO NOT** Use JavaScript

We **never** expose raw JavaScript syntax or objects directly into the template language. The following would be considered architectural anti-patterns:

- **INCORRECT:** `{{ myArray.length }}` -> This exposes a JS-specific property name.
- **CORRECT:** `{{ myArray | length }}` -> This uses an abstract filter.

- **INCORRECT:** `{{ JSON.stringify(myObject) }}` -> This exposes a global JS object.
- **CORRECT:** `{{ myObject | json_encode }}` -> This uses an abstract filter.

- **INCORRECT:** `{{ myArray.map(item => item.name).join(', ') }}` -> This exposes JS methods and arrow functions.
- **CORRECT:** `{% for item in myArray %}{{ item.name }}{% if not loop.last %}, {% endif %}{% endfor %}` -> This uses language-native control flow.

By maintaining this strict boundary, we gain the best of both worlds: a simple, portable language for our users, and a powerful, modern environment for our developers.
