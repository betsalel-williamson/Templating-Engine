# Template language

The templating engine uses [legacy syntax](../glossary/legacy-syntax.md) derived from the original [`mergeEngine`](https://jordanhenderson.com/). Templates combine literal text with tags that read [data context](../glossary/data-context.md), iterate, branch, and call registered functions.

This is the **stable, CLI-supported** surface. Prepare and shape data in JavaScript/TypeScript (or JSON for the CLI) before render — templates project context; they do not execute arbitrary host programs unless you register functions.

> **Indexing:** Array slicing uses **1-based** `{offset,limit}` notation, matching the original mergeEngine.

## Delimiters

| Construct              | Syntax                   | Purpose                                    |
| ---------------------- | ------------------------ | ------------------------------------------ |
| Expression block       | `<~ ... ~>`              | Wrap dynamic content                       |
| Variable               | `<#name#>`               | Insert a value from the data context       |
| Indirect variable      | `<##name##>`             | Use a value as the name of the next lookup |
| Function call          | `<{fn(args)}>`           | Call a host-registered function            |
| Sub-template (literal) | ``<` ... `>``            | Literal text inside an expression          |
| Conditional            | `<+>`, `<->`, `<?cond?>` | True branch, false branch, condition       |
| Iteration              | `<*>`, `<[array]>`       | Loop over an array                         |
| Array slice            | `{offset,limit}`         | Limit which elements are iterated          |

[Modern syntax](../glossary/modern-syntax.md) (`{{ ... }}`, `{% ... %}`) is **library-only and experimental** via `parseModern`. Exploratory modern control-flow delimiters are **not** the long-term destination — active design targets Mustache logic-less presentation with a JS/TS-first host layer ([ADR-002](../features/architecture/adr-002-mustache-js-first-code-generation.md)).

## Variables

**Simple replacement** — unresolved tags are left unchanged:

```txt
Template: Hello, <#name#>.
Context:  { "name": "World" }
Output:   Hello, World.
```

**Recursive resolution** — values that contain variable tags are evaluated until a literal is reached:

```txt
Context:  { "recursive1": "<#recursive2#>", "recursive2": "Final Value" }
Template: <#recursive1#>
Output:   Final Value
```

**Indirect lookup** — the value of one variable selects the name of the next:

```txt
Context:  { "indirection-0": "indirection-1", "indirection-1": "The real value" }
Template: <##indirection-0##>
Output:   The real value
```

## Iteration (cross-product)

Iterate with `<~ ... <*> ... ~>`. Within a loop, fields from the current item are available by name (for example `<#name#>`).

**Loop metadata** (preferred, 0-based index):

- `<#arrayName.index#>` — current index in the original array
- `<#arrayName.length#>` — total element count

Legacy 1-based names (`elementindex`, `numberofelements`) are still supported.

**Array slicing** — `{2}` takes the first two elements; `{2,2}` takes two starting at element 2:

```txt
Context:  { "numbers": [{ "value": "one" }, { "value": "two" }, { "value": "three" }] }
Template: <~{2}<`<#value#>`><*><[numbers]>~>
Output:   onetwo
```

**Dynamic array names** — the array key can itself be a template:

```txt
Context:  { "entity": "users", "users_list": [{ "name": "Alice" }, { "name": "Bob" }] }
Template: <~<`- <#name#>`><*><[<#entity#>_list]>~>
Output:   - Alice- Bob
```

**Delimiters between items** — `<*?delimiter:terminator>` inserts `delimiter` between items and `terminator` after the last item.

## Conditionals

```txt
Template: <~<+><`User is Admin`><-><`User is not Admin`><?<#isAdmin#>?>~>
```

If `condition` is anything other than `"0"` or an empty string, the true branch renders; otherwise the false branch renders. Either branch may be omitted.

## Function calls

```txt
Template: <{toUpperCase(<#user#>)}>
```

Functions must be registered by the host application. The CLI ships with an empty registry for security. See [secure templating guide](../features/architecture/secure_templating_guide.md) before registering functions that touch I/O or external state.

## Orthogonality

Any construct that expects a value can accept a template that resolves to that value — array names, slice bounds, property keys, function arguments, and conditions can all be dynamic. See [language orthogonality](../features/architecture/language_orthogonality.md).

## Safety limits

- **Max evaluation depth** (default 50) prevents runaway recursion.
- **Circular indirect references** (`<##...##>`) are detected and reported with the cycle path.

## Further reading

- [ADR-002: Mustache logic-less + JS/TS-first](../features/architecture/adr-002-mustache-js-first-code-generation.md) — normative direction (not fully shipped)
- [V2 design goals](../features/architecture/v2_design_goals.md)
- [Property access patterns](../features/architecture/property_access_patterns.md)
- [Host environment integration](../features/architecture/host_environment_integration.md)
