# Modern Syntax: Technical Overview

## Objective

This document defines the core technical concepts for the new, modern templating syntax. It serves as the architectural source of truth, codifying lessons learned from the legacy engine to ensure the new implementation is more robust, intuitive, and maintainable.

## Key Concepts

### 1. Keywords & Delimiters

The modern syntax is defined by the following keywords and delimiters.

- **Output Delimiters:** `{{ ... }}`
  - Used for any expression that should be rendered as text in the output.
- **Control Flow Delimiters:** `{% ... %}`
  - Used for statements that control the rendering process, like loops and conditionals.
- **Control Flow Keywords:**
  - `if`, `else`, `endif`: For conditional blocks.
  - `for`, `in`, `endfor`: For iteration.
- **Filter Operator:** `|`
  - Applies a transformation function to the value on its left.
- **Property Access Operator:** `.`
  - Accesses a nested property of an object.

### 2. Variable & Expression Syntax

- **Output:** All expressions that produce output are enclosed in `{{ ... }}`.
  - *Example:* `{{ user.name }}`, `{{ "hello world" | upper }}`, `{{ 5 + 3 }}`
- **Control Flow:** All control flow statements (e.g., loops, conditionals) are enclosed in `{% ... %}`.
  - *Example:* `{% for user in users %}`, `{% if user.isAdmin %}`

### 3. Unified Property Access (`.` notation)

All access to nested properties of an object (a `Map` in our context) will use dot notation. This is a primary lesson from the legacy engine, which had inconsistent access patterns.

- **Example:** `{{ user.address.city }}`
- **Implementation:** The evaluator will traverse nested `Map` structures based on the dot-separated path.

### 4. Filters for Data Transformation (`|` operator)

This is the most critical architectural decision. Instead of a mix of special properties (`.length`) and function calls (`<{...}>`), all data transformations will be handled by a single, composable **filter pipeline** using the `|` character.

- **Syntax:** `{{ input | filterName:arg1:arg2 }}`
- **Rationale:**
  - **Clarity & Readability:** It is an industry-standard pattern (Jinja2, Liquid, Twig) that is immediately familiar to developers.
  - **Composability:** Filters can be chained: `{{ "  Hello World  " | trim | upper }}`
  - **Extensibility:** It provides a single, secure mechanism for adding new "built-in" functionality without polluting the global function namespace.
- **Implementation:** The evaluator will have a dedicated, private `FilterRegistry`.

#### Initial Set of Built-in Filters

The following filters will be implemented to provide baseline functionality. Each will be its own small-batch user story.

- **String Filters:**
  - `upper`: Converts string to uppercase.
  - `lower`: Converts string to lowercase.
  - `trim`: Removes leading/trailing whitespace.
  - `capitalize`: Capitalizes the first letter of the string.
- **Array Filters:**
  - `length`: Returns the number of items in an array. This explicitly replaces the legacy `<#array.length#>` syntax.
  - `first`: Returns the first item of an array.
  - `last`: Returns the last item of an array.
- **Math Filters:**
  - `add:number`: Adds a number. Example: `{{ 5 | add:10 }}` -> `15`
  - `subtract:number`: Subtracts a number.
- **Utility Filters:**
  - `default:value`: Provides a default value if the input is empty or undefined. Example: `{{ user.nickname | default:'Guest' }}`
