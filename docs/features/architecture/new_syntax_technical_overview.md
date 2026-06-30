# Modern Syntax: Technical Overview

## Objective

This document defines the core technical concepts for the new, modern templating syntax. It serves as the architectural source of truth, codifying lessons learned from the legacy engine to ensure the new implementation is more robust, intuitive, and maintainable.

Broader V2 goals—concise expressiveness, reviewability for humans and LLMs, orthogonality, and JS/TS-first conventions—are in [V2 design goals](./v2_design_goals.md).

Parse errors use compiler-style line/column diagnostics; see [Parse diagnostics](./parse_diagnostics.md).

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
  - _Example:_ `{{ user.name }}`, `{{ "hello world" | upper }}`, `{{ 5 + 3 }}`
- **Control Flow:** All control flow statements (e.g., loops, conditionals) are enclosed in `{% ... %}`.
  - _Example:_ `{% for user in users %}`, `{% if user.isAdmin %}`

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

### 5. String Literal Handling (Under Consideration)

**Status:** This section documents exploratory analysis of string literal handling options. No final decision has been made.

#### Legacy System Limitations

The current (legacy) templating syntax uses backslash (`\`) as an escape character within string literals. This creates a cascade problem:

1. To include template syntax as literal text, you must escape it: `\<#name#\>` → `<#name#>`
2. To include a literal backslash, you must escape the backslash itself: `\\` → `\`
3. Common use cases like file paths and regex patterns become cumbersome:
   - File path: `"path\\to\\file"` → `path\to\file`
   - Windows path: `"C:\\Users\\Admin\\Documents"` → `C:\Users\Admin\Documents`
   - Regex pattern: `"\\d{3}-\\d{4}"` → `\d{3}-\d{4}`

This pattern increases cognitive load and makes the syntax less intuitive, especially for users working with data that naturally contains backslashes.

#### Possible Directions for Improvement

The following options represent different approaches to providing a more consistent and intuitive experience with string literals in the modern syntax. Each has distinct benefits and tradeoffs.

##### Option A: Bash/Shell-Style Quote Distinction

Use different quote types to control interpolation behavior:

- **Single quotes (`'...'`)**: Raw/literal strings with no variable interpolation or escape sequences
  - Example: `'C:\Users\Admin\Documents'` → `C:\Users\Admin\Documents`
  - Example: `'Price: $9.99'` → `Price: $9.99`
  - Literal single quote: Not directly supported; would need concatenation or double quotes

- **Double quotes (`"..."`)**: Interpolated strings that evaluate variables and support escape sequences
  - Example: `"Hello {{ name }}"` → `Hello World` (if `name = "World"`)
  - Example: `"Path: \"C:\\Users\""` → `Path: "C:\Users"`

**Benefits:**

- Intuitive for developers familiar with Bash, Python, and other shell scripting languages
- Clear separation between "literal" and "interpolated" contexts
- Zero escaping needed for raw strings (single quotes)

**Drawbacks:**

- Double-quoted strings still require escaping for quotes and backslashes
- Cannot include a literal single quote inside single-quoted strings without workarounds
- Two sets of rules to remember

**Use Cases:**

- Single quotes: File paths, regex patterns, literal code snippets, any text with special characters
- Double quotes: User-facing messages with variable substitution

##### Option B: JavaScript-Style Template Literals

Use backticks with explicit interpolation syntax:

- **Backticks (`` `...` ``)**: Template literals with `${ expression }` for interpolation
  - Example: `` `Hello ${ user.name }!` `` → `Hello Alice!`
  - Example: `` `Path: C:\Users\Admin` `` → `Path: C:\Users\Admin` (no escaping needed)
  - Escape only backticks: `` `Use \` for code` `` → ``Use ` for code``

**Benefits:**

- Familiar to JavaScript/TypeScript developers
- Clear, explicit interpolation syntax separates literal text from expressions
- Minimal escaping required (only backticks themselves)
- Natural for multiline strings

**Drawbacks:**

- Introduces a third delimiter type (in addition to `{{ }}` and `{% %}`)
- May conflict with Markdown or code embedding use cases where backticks are common
- Requires learning `${ }` interpolation syntax

**Use Cases:**

- Messages with variable substitution
- Embedding code blocks or SQL queries
- Generating markup with dynamic values

##### Option C: Python-Style Triple-Quoted Strings

Use triple quotes for multiline strings with minimal escaping:

- **Triple double-quotes (`"""..."""`)**: Multiline strings with interpolation
  - Example:

    ```text
    """
    SELECT * FROM users
    WHERE name = "{{ username }}"
    """
    ```

  - Only need to escape `"""` itself

- **Triple single-quotes (`'''...'''`)**: Raw multiline strings
  - Example:

    ```text
    '''
    regex = \d{3}-\d{4}
    path = C:\Users\Admin
    '''
    ```

  - Only need to escape `'''` itself

**Benefits:**

- Excellent for embedding blocks of code, SQL, JSON, or other structured text
- Minimal escaping requirements
- Natural handling of multiline content
- Familiar to Python developers

**Drawbacks:**

- More complex to parse (need to track quote count)
- Introduces two additional syntax forms
- May be overkill for simple single-line strings
- Leading/trailing whitespace handling requires clear rules

**Use Cases:**

- SQL query templates
- JSON/XML generation
- Code generation (HTML, JavaScript, etc.)
- Documentation or help text

##### Option D: Raw String Prefix

Use a prefix to explicitly mark strings as raw:

- **Raw strings (`r"..."` or `raw"..."`)**: Disable all escape sequences
  - Example: `r"C:\Users\Admin\Documents"` → `C:\Users\Admin\Documents`
  - Example: `r"\d{3}-\d{4}"` → `\d{3}-\d{4}`

- **Regular strings (`"..."`)**: Standard behavior with interpolation and escaping
  - Example: `"Hello {{ name }}"` → `Hello World`
  - Example: `"Use \"quotes\""` → `Use "quotes"`

**Benefits:**

- Explicit intent: immediately clear whether string is raw or processed
- Single delimiter style (quotes) remains consistent
- Familiar to Python and Rust developers
- Easy to implement as a parse-time flag

**Drawbacks:**

- Adds prefix syntax to learn
- Raw strings still cannot contain their delimiter without ending the string
- Visual clutter with prefix notation

**Use Cases:**

- File paths, especially on Windows
- Regular expressions
- Any string with many backslashes or special characters

##### Option E: Hybrid Approach (Multiple Options)

Combine several of the above options to provide maximum flexibility:

- Single quotes (`'...'`): Raw/literal (no interpolation, no escaping)
- Double quotes (`"..."`): Standard interpolation with escape sequences
- Triple quotes (`"""..."""`, `'''...'''`): Multiline with minimal escaping
- Raw prefix (`r"..."`, `r'...'`): Explicit raw string marker

**Benefits:**

- Users can choose the right tool for each use case
- Maximum flexibility and expressiveness
- Follows precedent from languages like Python that support multiple string types

**Drawbacks:**

- Most complex to implement and document
- Highest learning curve for new users
- Potential for confusion about which type to use
- More parser complexity

**Use Cases:**

- All of the above, giving users choice based on their specific needs

#### Comparison Matrix

| Approach                                     | Escaping Burden                 | Interpolation Support       | Multiline Support | Developer Familiarity        | Implementation Complexity | Best For                           |
| -------------------------------------------- | ------------------------------- | --------------------------- | ----------------- | ---------------------------- | ------------------------- | ---------------------------------- |
| **Option A: Bash-Style (`'` vs `"`)**        | Low (single), Medium (double)   | Yes (double quotes)         | Limited           | High (Bash, Python, PHP)     | Low                       | General purpose, file paths        |
| **Option B: JS Template Literals (`` ` ``)** | Very Low                        | Yes (`${ }`)                | Excellent         | High (JavaScript/TypeScript) | Low                       | Modern web developers, multiline   |
| **Option C: Triple Quotes**                  | Very Low                        | Yes/No (depends on variant) | Excellent         | Medium (Python)              | Medium                    | Code embedding, SQL, documentation |
| **Option D: Raw Prefix (`r"..."`)**          | Very Low (raw), Medium (normal) | Yes (normal only)           | Limited           | Medium (Python, Rust)        | Low                       | Regex, Windows paths               |
| **Option E: Hybrid**                         | Varies                          | Yes (most types)            | Excellent         | Varies                       | High                      | Maximum flexibility                |
| **Legacy (current)**                         | High                            | Yes                         | Limited           | Low (unique syntax)          | N/A (existing)            | Current implementation             |

#### Key Considerations for Decision

When evaluating these options, consider:

1. **User Experience:**
   - Which option minimizes cognitive load for common use cases?
   - How intuitive is the syntax for developers from different backgrounds?

2. **Implementation Complexity:**
   - Parser complexity and maintenance burden
   - Error handling and error message quality
   - Testing requirements

3. **Migration Path:**
   - How does this affect existing templates in the legacy syntax?
   - Can we provide clear migration guidance?

4. **Language Evolution:**
   - Does this choice constrain future syntax additions?
   - How does it interact with the filter system and other features?

5. **Real-World Usage:**
   - What types of strings do users actually write most often?
   - Where do users currently struggle with the legacy syntax?

#### Next Steps

Before making a decision on string literal handling:

1. Gather usage data from existing templates to understand common patterns
2. Prototype parser implementations for top 2-3 options
3. Create user testing scenarios to validate ergonomics
4. Review error handling and edge cases for each approach
5. Consider community feedback from users familiar with different language backgrounds
