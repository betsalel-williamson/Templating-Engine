# V2 Mathematical Design (v2.1 Rev: Mustache/m4 Hybrid)

The original `mergeEngine` language (written in TCL) was designed around a **transformational, mathematical metaphor** rather than an imperative programming metaphor. Instead of using procedural programming constructs like `for` loops or `if/else` statements, the language treated templates and data as operands, using mathematical operators to define how they should be combined.

To take a **design-first approach** for Version 2, we translate this profound insight—that **templating is fundamentally mathematical data transformation**—into a highly secure, logic-less modern syntax.

In a procedural engine (like Jinja or Twig), users write code (loops, variables, breaks). In a mathematical engine, users write **equations** (projections, filters, combinations).

This document outlines how V2.1 preserves the mathematical elegance of the legacy engine while leveraging the readability of Mustache, the recursive expansion power of `m4`, and the execution safety of TypeScript.

For reviewability, conciseness, and JS/TS-first conventions that guide syntax choices, see [V2 design goals](./v2_design_goals.md).

## 1. The Core Paradigm: Mustache + m4 + TypeScript

We are building an engine that achieves Jinja/Liquid-level output complexity (advanced text formatting, structured data mapping, config generation) but is driven by m4/Mustache's execution mechanics (recursive macro expansion and logic-less, host-driven context).

1. **Drop procedural block tags:** We move away from `{% for %}` or `{% if %}`.
2. **Embrace logic-less sections:** We use `{{# ... }}` (Sections) and `{{^ ... }}` (Inverted Sections) for all logic (loops, conditionals, and context scoping).
3. **Use TS Lambdas for transformations:** If we need a custom mathematical transform (like joining, formatting, or filtering), we use Mustache lambdas or m4-style TS macros: `{{#formatDate}}{{createdAt}}{{/formatDate}}` or `{{ paginate(users, 3) }}`.

By stripping complex parsing (operator precedence, iterators, conditional ASTs) out of the templating language itself and deferring it to TypeScript, we get an engine that is smaller, faster, less error-prone, and deeply integrated with modern JS/TS runtimes.

## 2. The Core Operators (The Foundation)

In V2.1, we shift from cryptic symbols (`<*>`, `<+>`) to semantic sections and macros. The underlying mathematical behavior remains identical, but execution is pushed to the TypeScript runtime context.

### Multiplication (Projection / Map)

- **Concept:** Multiplying a template block by a data array.
- **Legacy Operator:** `<*>`
- **V2.1 Design:** Mustache sections over array context properties. The iteration is handled by TypeScript returning an Array to the engine.
- **Modern Syntax:**

  ```mustache
  {{#activeUsers}}
    {{name}}
  {{/activeUsers}}
  ```

### Cross Product (Delimited Combinatorics)

- **Concept:** Iterating with boundary awareness (separators, terminators) without manual index tracking.
- **Legacy Operator:** `<*? ... >`
- **V2.1 Design:** TypeScript-driven array manipulation using m4-style macros or custom lambdas to handle trailing commas natively.
- **Modern Syntax:** `{{ join(pluck(users, "name"), ", ") }}`

### Sum & Subtraction (Conditional Branching)

- **Concept:** Adding or omitting template blocks based on boolean vectors.
- **Legacy Operator:** `<+>` and `<->`
- **V2.1 Design:** Standard Mustache sections evaluating boolean context properties.
- **Modern Syntax:**

  ```mustache
  {{#isAdmin}}Admin{{/isAdmin}}
  {{^isAdmin}}User{{/isAdmin}}
  ```

## 3. The Power of "Logic-less" in a TypeScript World

Instead of building a massive standard library of filters inside the template engine (like `unique`, `sort`, `batch`), you rely on standard TypeScript.

The template is just a projection layer. It uses tags like `{{#section}}` which are polymorphic. The magic happens because of how TypeScript evaluates the context object:

- **If TS provides an Array:** The engine loops over it.
- **If TS provides a Boolean:** The engine treats it as an `if/else` block.
- **If TS provides a Getter/Proxy:** The engine triggers a live read from your runtime state.
- **If TS provides a Function (Lambda/Macro):** The engine executes the TS function, dropping the result into the buffer.

### Pulling from "Live Runtimes"

Because the engine just asks the TS context for a key, you can hook it directly into live paradigms:

- **JS Proxies:** Pass a `Proxy` as the template context. Asking for `{{systemMetrics}}` intercepts the `get` trap, performs a live API fetch, and returns real-time data.
- **Async/Promises:** If enabled, `{{#liveDatabaseQuery}}` awaits the TS function.
- **Signals/Observables:** Context properties can read from reactive signals.

## 4. Security Architecture

Because m4-style macro expansion can introduce Server-Side Template Injection (SSTI) and Domain Injection (SQLi/XSS), V2.1 strictly enforces boundaries at the architecture level.

1. **Implicit Escaping:** `{{ data }}` is ALWAYS escaped by default.
2. **Explicit Execution:** The engine only executes macros that exist in the predefined TS `context`. Unrecognized macros return empty strings.
3. **Data / Template Segregation via Types:** Output from TS functions is NEVER rescanned for new macros unless it is wrapped in an explicit `TrustedTemplate` type.
   - **String Returns:** Treated as pure data. Escaped and dumped to buffer. No rescan.
   - **TrustedTemplate Returns:** If a TS macro (e.g., `paginate`) generates safe template syntax intentionally, it returns `new Engine.TrustedTemplate('{{#batch}}...{{/batch}}')`. Only developers control instantiation.
4. **Context-Aware Escaping & Parameterization:** Instead of string-concatenating SQL, the TS context acts as a parameter builder (e.g., `AND {{column}} = {{bind value}}` yielding parameterized queries like `$1`).
5. **Call Stack Limits:** The engine maintains a `depth` counter on the context stack. If `depth > 100`, it throws a `RecursionDepthError` to prevent "Billion Laughs" infinite loops.

## 5. Design-First Principles for V2.1

To ensure the new engine remains robust:

1. **Immutability (No Side Effects in Template):** Templates should never mutate the underlying data context. All data transformation logic lives in the TypeScript context getters/lambdas.
2. **Orthogonality:** Every macro and section should do exactly one thing and perfectly compose.
3. **Late Stringification:** Keep data as rich objects/arrays for as long as possible in the TS context pipeline. Only convert to a string at the very end of the evaluation.
