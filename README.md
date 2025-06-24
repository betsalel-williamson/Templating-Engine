# TypeScript Templating Engine

This project provides a flexible and powerful templating engine for dynamic content generation, built with a focus on robustness and maintainability. It allows developers to create reusable templates that are easily populated with data, enabling dynamic configuration, code generation, and content rendering.

## Core Concepts & Syntax

The templating engine uses a unique syntax derived from the original `mergeEngine` (for historical context, see [jordanhenderson.com](https://jordanhenderson.com/)). It combines various tags and expressions to define dynamic content.

### Variables

Variables are used to inject data values into templates.

* **Simple Variable Replacement**: `<#variableName#>`
    The engine replaces placeholders with corresponding values from the data context. If a variable is not found, its tag is left unchanged.

    ```rpl
    Template: Hello, <#name#>.
    Context: { name: 'World' }
    Output:   Hello, World.
    ```

* **Recursive Variable Replacement**: If a variable's value is itself a variable tag, the engine will recursively resolve it until a non-variable value is found.

    ```rpl
    Context: { recursive1: '<#recursive2#>', recursive2: 'Final Value' }
    Template: <#recursive1#>
    Output:   Final Value
    ```

* **Indirect Variable Replacement**: `<##variableName##>`
    This allows a variable's *value* to be used as the *name* of the next variable to look up, enabling dynamic selection of data sources. The engine will follow a chain of indirection until a non-variable value or an undefined key is reached.

    ```rpl
    Context: { indirection-0: 'indirection-1', indirection-1: 'The real value' }
    Template: See Indirection -- <##indirection-0##>
    Output:   See Indirection -- The real value
    ```

### Iteration (Cross-Product)

The `<~...<*>...~>` syntax allows iterating over arrays of data, applying a template snippet for each item. This is powerful for generating repetitive structures.

* **Basic Iteration**:

    ```rpl
    Context: { users: [Map([['name', 'Alice']]), Map([['name', 'Bob']])] }
    Template: <~<`- <#name#>`><*><[users]>~>
    Output:   - Alice- Bob
    ```

* **Iteration Variables**: Within a loop, special variables like `<#arrayName.elementindex#>` (1-based index) and `<#arrayName.numberofelements#>` (total count) are available.

    ```rpl
    Context: { users: [Map([['name', 'Alice']])] } (array length 1)
    Template: <~<`<#users.elementindex#> of <#users.numberofelements#>: <#name#>;`><*><[users]>~>
    Output:   1 of 1: Alice;
    ```

* **Array Slicing**: Control which elements of an array are iterated over using `{offset,limit}` syntax (e.g., `{2}` for first 2, `{1,2}` for 2 elements starting at index 1).

    ```rpl
    Context: { numbers: [Map([['value', 'one']]), Map([['value', 'two']]), Map([['value', 'three']])] }
    Template: <~{2}<`<#value#>`><*><[numbers]>~>
    Output:   onetwo
    ```

* **Templated Array Names**: The name of the array to iterate can itself be a template, allowing for dynamic selection of data sources.

    ```rpl
    Context: { entity: 'users', users_list: [Map([['name', 'Alice']]), Map([['name', 'Bob']])] }
    Template: <~<`- <#name#>`><*><[<#entity#>_list]>~>
    Output:   - Alice- Bob
    ```

* **Conditional Delimiters**: Define a delimiter that appears *between* items, and an optional terminator *after* the last item.

    ```rpl
    Context: { attributes: [Map([['attribute', 'attr1']]), Map([['attribute', 'attr2']])] }
    Template: <~<`<#attribute#>`><*?,\n:\n><[attributes]>~>
    Output:   attr1,\nattr2\n
    ```

### Conditionals

The `<~<+true_branch<->false_branch<?condition?>>~>` syntax allows rendering content conditionally based on a value.

* If `condition` evaluates to anything other than `"0"` or an empty string, the `true_branch` is rendered. Otherwise, the `false_branch` is rendered.
* Both `true_branch` (`<+...`) and `false_branch` (`<->...`) are optional.

    ```rpl
    Context: { isAdmin: '1' }
    Template: <~<+><`User is Admin`><-><`User is not Admin`><?<#isAdmin#>?>~>
    Output:   User is Admin
    ```

### Function Calls

The `<{functionName(arg1,arg2,...)}>` syntax allows calling pre-registered JavaScript functions from within templates.

* Functions can return dynamically generated data (e.g., current timestamp) or perform simple data transformations.
* **Security Note**: Functions must be explicitly registered by the host application. The engine itself does not include built-in functions for file system, network, or shell interaction, maintaining a secure transformation boundary.

    ```rpl
    Context: { user: 'Alice' }
    Registered Function: toUpperCase: (str) => str.toUpperCase()
    Template: <{toUpperCase(<#user#>)}>
    Output:   ALICE
    ```

## Getting Started

To get started with this templating engine:

1. **Clone the repository:**

    ```bash
    git clone [repository-url] # Replace [repository-url] with your actual repo URL
    cd template-engine-ts
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Build the parser and TypeScript code:**

    ```bash
    npm run build
    ```

4. **Run the demo:**
    See `src/index.ts` for a basic usage example.

    ```bash
    npm start
    ```

5. **Explore tests for more examples:**
    The `test/` directory contains comprehensive examples for all syntax features.

    ```bash
    npm test
    ```
