# Templating Engine

This project provides a flexible and powerful templating engine for dynamic content generation, built with a focus on robustness and maintainability. It allows developers to create reusable templates that are easily populated with data, enabling dynamic configuration, code generation, and content rendering.

<p align="center">
    <a href="https://github.com/betsalel-williamson/Templating-Engine/blob/main/LICENSE">
        <img alt="License" src="https://img.shields.io/github/license/betsalel-williamson/Templating-Engine?style=flat-square&color=blue">
    </a>
    <a href="https://github.com/betsalel-williamson/Templating-Engine/actions/workflows/ci.yml">
        <img alt="CI Status" src="https://github.com/betsalel-williamson/Templating-Engine/actions/workflows/ci.yml/badge.svg">
    </a>
    <img alt="Language" src="https://img.shields.io/github/languages/count/betsalel-williamson/Templating-Engine?style=flat-square">
    <img alt="Language" src="https://img.shields.io/github/languages/top/betsalel-williamson/Templating-Engine?style=flat-square">
</p>

## Core Concepts & Syntax

The templating engine uses a unique syntax derived from the original `mergeEngine` (for historical context, see [jordanhenderson.com](https://jordanhenderson.com/)). It combines various tags and expressions to define dynamic content.

> **WARNING** This version of the template language is not compatible with mergeEngine because slicing uses 0-based indexing, where it was previously 1-based indexing. To update legacy code, increment all slices `{X,Y}` by decrementing `X` by one.

### Variables

Variables are used to inject data values into templates.

* **Simple Variable Replacement**: `<#variableName#>`
    The engine replaces placeholders with corresponding values from the data context. If a variable is not found, its tag is left unchanged.

    ```txt
    Template: Hello, <#name#>.
    Context: { name: 'World' }
    Output:   Hello, World.
    ```

* **Recursive Variable Replacement**: If a variable's value is itself a variable tag, the engine will recursively resolve it until a non-variable value is found.

    ```txt
    Context: { recursive1: '<#recursive2#>', recursive2: 'Final Value' }
    Template: <#recursive1#>
    Output:   Final Value
    ```

* **Indirect Variable Replacement**: `<##variableName##>`
    This allows a variable's *value* to be used as the *name* of the next variable to look up, enabling dynamic selection of data sources. The engine will follow a chain of indirection until a non-variable value or an undefined key is reached.

    ```txt
    Context: { indirection-0: 'indirection-1', indirection-1: 'The real value' }
    Template: See Indirection -- <##indirection-0##>
    Output:   See Indirection -- The real value
    ```

### Iteration (Cross-Product)

The `<~...<*>...~>` syntax allows iterating over arrays of data, applying a template snippet for each item. This is powerful for generating repetitive structures.

* **Basic Iteration**:

    ```txt
    Context: { users: [Map([['name', 'Alice']]), Map([['name', 'Bob']])] }
    Template: <~<`- <#name#>`><*><[users]>~>
    Output:   - Alice- Bob
    ```

* **Iteration Variables**: Within a loop, special variables are available, prefixed with the array name (e.g., `users.`).

> **Preferred (Modern):**

* `<#arrayName.index#>`: The **0-based** index of the current element in the *original* array.
* `<#arrayName.length#>`: The total number of elements in the *original* array.

> **Legacy (Deprecated but Supported):**

* `<#arrayName.elementindex#>`: (1-based index) The 1-based index of the current element in the *original* array.
* `<#arrayName.numberofelements#>`: (total count) The total number of a elements in the *original* array.

    ```txt
    Context: { users: [Map([['name', 'Alice']])] } (array length 1)
    Template: <~<`<#users.elementindex#> of <#users.numberofelements#>: <#name#>;`><*><[users]>~>
    Output:   1 of 1: Alice;

    ```

* **Array Slicing**: Control which elements of an array are iterated over using `{offset,limit}` syntax (e.g., `{2}` for first 2, `{1,2}` for 2 elements starting at index 1).

    ```txt
    Context: { numbers: [Map([['value', 'one']]), Map([['value', 'two']]), Map([['value', 'three']])] }
    Template: <~{2}<`<#value#>`><*><[numbers]>~>
    Output:   onetwo
    ```

* **Templated Array Names**: The name of the array to iterate can itself be a template, allowing for dynamic selection of data sources.

    ```txt
    Context: { entity: 'users', users_list: [Map([['name', 'Alice']]), Map([['name', 'Bob']])] }
    Template: <~<`- <#name#>`><*><[<#entity#>_list]>~>
    Output:   - Alice- Bob
    ```

* **Conditional Delimiters**: Define a delimiter that appears *between* items, and an optional terminator *after* the last item.

    ```txt
    Context: { attributes: [Map([['attribute', 'attr1']]), Map([['attribute', 'attr2']])] }
    Template: <~<`<#attribute#>`><*?,\n:\n><[attributes]>~>
    Output:   attr1,\nattr2\n
    ```

### Conditionals

The ``<~<+><`true_branch`><-><`false_branch`><?condition?>~>`` syntax allows rendering content conditionally based on a value.

* If `condition` evaluates to anything other than `"0"` or an empty string, the `true_branch` is rendered. Otherwise, the `false_branch` is rendered.
* Both `true_branch` (`<+...`) and `false_branch` (`<->...`) are optional.

    ```txt
    Context: { isAdmin: '1' }
    Template: <~<+><`User is Admin`><-><`User is not Admin`><?<#isAdmin#>?>~>
    Output:   User is Admin
    ```

### Function Calls

The `<{functionName(arg1,arg2,...)}>` syntax allows calling pre-registered JavaScript functions from within templates.

* Functions can return dynamically generated data (e.g., current timestamp) or perform simple data transformations.
* **Security Note**: Functions must be explicitly registered by the host application. The engine itself does not include built-in functions for file system, network, or shell interaction, maintaining a secure transformation boundary.

    ```txt
    Context: { user: 'Alice' }
    Registered Function: toUpperCase: (str) => str.toUpperCase()
    Template: <{toUpperCase(<#user#>)}>
    Output:   ALICE
    ```

## Why This Templating Engine?

While many templating solutions exist, this engine offers a distinct set of features and a philosophical approach that differentiates it for specific use cases, especially dynamic configuration, code generation, and advanced data transformations.

Unlike more common templating libraries that focus primarily on rendering web content and sometimes limit dynamic behavior, our engine emphasizes:

1. **Deep Indirection as a First-Class Feature**: The `<##variableName##>` syntax is a powerful construct that allows the *value* of one variable to dynamically determine the *name* of the next variable to resolve. This "data as metadata" approach enables highly adaptive and generic templates, where a single configuration value can switch entire content structures or code generation patterns. Most other engines require complex helper functions or multi-step logic in the host application to achieve similar effects.

2. **Robust Recursive Resolution**: Variables whose values are themselves template expressions are recursively evaluated until a final literal value is found. The engine includes explicit mechanisms for detecting circular references and preventing infinite loops, ensuring stability even with complex self-referential data.

3. **Expressive Iteration Control**: Our "Cross-Product" iteration, beyond standard looping, includes unique features like direct inline conditional delimiters (`<*?delimiter:terminator>`). This enables precise control over list formatting (e.g., comma-separated lists without trailing commas) directly within the template construct, often simplifying what would require more verbose conditional logic in other languages.

4. **Security-First Function Integration**: The `createSecureEvaluator` factory implements a "trusted kernel" pattern that creates a private, immutable copy of the function registry. For even higher security, it offers deep cloning of registered functions to explicitly break closures, preventing runtime manipulation of external state. This focus on securing the function execution boundary is paramount for environments where templates might be loaded from untrusted sources or used in sensitive contexts.

This engine is built for scenarios where deep data-driven dynamism, fine-grained control over output, and a robust, secure execution environment are paramount. We are currently migrating its powerful features to a modern, more accessible syntax (like `{{ ... }}` and `{% ... %}`) to blend its unique capabilities with a developer-friendly experience.

## Getting Started

To get started with this templating engine:

1.  **Clone the repository and install dependencies:**
    ```bash
    git clone [repository-url]
    cd Templating-Engine
    npm install
    ```

2.  **Build the parsers and application code:**
    ```bash
    npm run build
    ```

3.  **Run the demo:**
    See `src/index.ts` for a basic usage example.
    ```bash
    npm start
    ```

4.  **Explore tests for more examples:**
    The `test/` directory contains comprehensive examples for all syntax features.
    ```bash
    npm test
    ```

## Building a Standalone CLI Executable

For environments where Node.js is not pre-installed, you can build a single, self-contained executable using Node.js's native Single Executable Application (SEA) feature.

1.  **Install Dependencies**: Make sure you have run `npm install`.

2.  **Build for your Platform**: Run the script corresponding to your operating system.

    *   **Linux**:
        ```bash
        npm run build:standalone:linux
        ```
        The output will be at `dist/template-engine-linux`.

    *   **macOS**:
        ```bash
        npm run build:standalone:macos
        ```
        The output will be at `dist/template-engine-macos`.

    *   **Windows (in Git Bash or WSL)**:
        ```bash
        npm run build:standalone:windows
        ```
        The output will be at `dist/template-engine-win.exe`.

3.  **Run the Executable**:
    You can now run the generated executable directly without Node.js.
    ```bash
    # On Linux/macOS:
    ./dist/template-engine-linux --help

    # On Windows:
    .\\dist\\template-engine-win.exe --help
    ```
    These executables are self-contained and do not require Node.js or `npm install` on the target machine.

## Advanced Topics & Behavioral Notes

Understanding the specific behaviors and limitations of the templating engine helps in its effective and secure use.

### Recursion and Circular Reference Handling

The template engine is designed to prevent infinite loops and provide clear diagnostics for recursive variable resolutions:

* **Maximum Evaluation Depth**: To prevent uncontrolled recursion and potential stack overflows (e.g., from deeply nested variable references like `<#a#> <#a#>`), the engine enforces a `MAX_EVAL_DEPTH` limit (defaulting to 50 levels). If this limit is exceeded, an error is thrown: `Max evaluation depth exceeded, possible infinite loop in template variables.`.
* **Circular Reference Detection (Indirect Variables)**: For indirect variable references (`<##name##>`) which can form explicit cycles (e.g., `{a: 'b', b: 'a'}`), the engine employs a dedicated cycle detection mechanism. If a key is revisited within the same indirection chain, a more specific error is thrown: `Circular indirect reference detected: a -> b -> a`. This pinpoints the exact cycle.

When encountering such errors, review your template and data context to break the recursive dependency.

### Streaming Input Behavior for CLI

The `template-engine` CLI can accept template input via `stdin` (e.g., `cat template.txt | template-engine --data data.json`). It's important to understand how this input is processed:

* **All-at-Once Parsing**: The CLI's parser is an "all-at-once" parser. It reads the *entire* `stdin` stream until the stream closes (e.g., `Ctrl+D` on Linux/macOS, `Ctrl+Z` on Windows, or the piping process finishes). Only then is the complete received content passed to the parser.
* **No Incremental Processing**: The CLI will **not** pause and wait for more input if it encounters an incomplete template tag (e.g., `<#variable` without a closing `#>`) while the stream is still open. If the stream *closes* with an incomplete tag, the parser will immediately report a syntax error (e.g., `Expected "#" or ">"`) and the CLI will exit with a non-zero status code.
* **Error Handling**: If a parsing error occurs due to incomplete or malformed input, the CLI will output the error message to `stderr` and exit with status code `1`.

### Extending Functionality with a Host Application

The standalone CLI is designed for common use cases. For more complex scenarios, leveraging the template engine's API directly within a Node.js "host" application offers greater control:

* **Custom Functions**: The CLI's function registry is intentionally empty for security. In a host application, you can register your own JavaScript functions (e.g., to interact with databases, perform complex calculations, or access external services) using `createSecureEvaluator({ functions: yourFunctionMap })`. Remember our security guidelines (`docs/ai_guidelines/README.md`, `docs/secure_templating_guide.md`) when registering functions.
* **Incremental Input Processing**: If you need to process templates from a continuously flowing stream (e.g., a network socket) and parse/evaluate them chunk by chunk, a host application can manage the input stream and call `parse()` and `evaluate()` as complete template segments become available. The CLI does not support this "streaming parse" behavior.
* **Dynamic Context Manipulation**: A host script can dynamically modify the data context based on runtime conditions, user input, or external events before each template evaluation, providing flexibility beyond static JSON files.
* **Error Handling**: In a host application, you have full programmatic control over error handling for parsing or evaluation failures, allowing for custom logging, retry mechanisms, or graceful degradation.

By understanding these nuances, you can choose the most appropriate method for integrating the `template-engine` into your workflows, from simple CLI usage to sophisticated programmatic control.
