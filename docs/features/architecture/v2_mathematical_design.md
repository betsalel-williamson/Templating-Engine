# V2 Mathematical Design

The original `mergeEngine` language (written in TCL) was designed around a **transformational, mathematical metaphor** rather than an imperative programming metaphor. Instead of using procedural programming constructs like `for` loops or `if/else` statements, the language treated templates and data as operands, using mathematical operators to define how they should be combined.

To take a **design-first approach** for Version 2, we translate this profound insight—that **templating is fundamentally mathematical data transformation**—into the modern, Jinja-like syntax (`{{ ... }}`, `{% ... %}`) that the project is migrating toward.

In a procedural engine, users write code (loops, variables, breaks). In a mathematical engine, users write **equations** (projections, filters, combinations).

This document outlines how V2 preserves the mathematical elegance of the legacy engine while leveraging the readability and composability of modern template syntax.

## 1. The Core Operators (The Foundation)

In V2, we shift from cryptic symbols (`<*>`, `<+>`) to semantic blocks and filters, but the underlying mathematical behavior remains identical.

### Multiplication (Projection / Map)

- **Concept:** Multiplying a template block by a data array.
- **Legacy Operator:** `<*>`
- **V2 Design:** While `{% for item in array %}` is the standard, a true mathematical approach also emphasizes the `map` filter for inline transformations.
- **Modern Syntax:** `{{ array | map('attribute') }}` or `{% for item in array %}...{% endfor %}`

### Cross Product (Delimited Combinatorics)

- **Concept:** Iterating with boundary awareness (separators, terminators) without manual index tracking.
- **Legacy Operator:** `<*? ... >`
- **V2 Design:** The `join` filter acts as the cross-product operator, elegantly handling the "trailing comma" problem natively.
- **Modern Syntax:** `{{ array | map('name') | join(', ') }}`

### Sum & Subtraction (Conditional Branching)

- **Concept:** Adding or omitting template blocks based on boolean vectors.
- **Legacy Operator:** `<+>` and `<->`
- **V2 Design:** Standard `{% if %}` blocks, but heavily favoring inline ternary operators for simple algebraic expressions.
- **Modern Syntax:** `{{ isAdmin ? "Admin" : "User" }}`

## 2. The Extended Operators (The V2 Additions)

By extending the mathematical metaphor, we can introduce advanced data transformations that are typically painful to write in standard template languages.

### Dot Product (Zipping / Parallel Projection)

- **Concept:** Multiplying two parallel vectors.
- **V2 Design:** A `zip` filter that combines multiple arrays into an array of tuples, allowing simultaneous iteration without manual index lookups (`array[loop.index0]`).
- **Modern Syntax:**

  ```liquid
  {% for col, val in columns | zip(values) %}
    {{ col }}: {{ val }}
  {% endfor %}
  ```

### Convolution (Reduction / Folding)

- **Concept:** Applying a sliding window or accumulating a state across a vector.
- **V2 Design:** A `reduce` filter for scalar accumulation, and a `batch` or `window` filter for matrix reshaping.
- **Modern Syntax (Scalar):** `{{ items | map('price') | reduce('a + b', 0) }}`
- **Modern Syntax (Matrix/Window):** `{% for row in items | batch(3) %}` (convolves a 1D array into a 2D grid of 3 columns).

## 3. Function Composition (The Pipe `|` as $f(g(x))$)

The most powerful aspect of modern syntax is the pipe operator (`|`). Mathematically, this is **function composition**. Instead of deeply nested function calls `h(g(f(x)))`, the pipe allows a linear flow of transformations: $x \rightarrow f \rightarrow g \rightarrow h$.

**V2 Design Principle:** Every operation should be chainable. Data flows from left to right, being mathematically transformed at each step before finally being rendered as a string.

_Example of a complex mathematical pipeline:_

```liquid
{{
  users
  | filter('isActive')           {# 1. Subset (Filter) #}
  | sort('createdAt')            {# 2. Order (Vector sort) #}
  | map('roles')                 {# 3. Multiply (Extract roles) #}
  | flatten                      {# 4. Flatten matrix to 1D vector #}
  | unique                       {# 5. Set theory (Distinct elements) #}
  | join(', ')                   {# 6. Cross Product (Stringify) #}
}}
```

## 4. Design-First Principles for V2

To ensure the new engine remains as robust as the original TCL `mergeEngine`, V2 enforces these architectural rules:

1. **Immutability (No Side Effects):** Templates should never mutate the underlying data context. Operations like `reduce` or `map` return _new_ virtual arrays. There should be no `{% set array[0] = 'new' %}`.
2. **Orthogonality:** Every filter and operator should do exactly one thing and be perfectly composable with any other filter. If `zip` works on arrays, it should work on the output of `map` or `filter`.
3. **Late Stringification:** Keep data as rich objects/arrays for as long as possible in the pipeline. Only convert to a string at the very end of the pipe (e.g., via `join` or implicit rendering). This prevents the classic templating bug of accidentally printing `[object Object]`.
