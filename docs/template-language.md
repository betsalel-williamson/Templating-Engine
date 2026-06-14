# Template Language Reference

The templating engine uses a syntax derived from the original [`mergeEngine`](https://jordanhenderson.com/). Templates combine literal text with tags that read data, iterate, branch, and call registered functions.

> **Indexing:** Array slicing uses **1-based** `{offset,limit}` notation, matching the original `mergeEngine`.

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

Modern syntax (`{{ ... }}`, `{% ... %}`) is in development. The CLI and stable API currently use **legacy syntax** via `parseLegacy`.

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

Functions must be registered by the host application. The CLI ships with an empty registry for security. See [secure templating guide](architecture/secure_templating_guide.md) before registering functions that touch I/O or external state.

## Orthogonality

Any construct that expects a value can accept a template that resolves to that value — array names, slice bounds, property keys, function arguments, and conditions can all be dynamic. See [language orthogonality](architecture/language_orthogonality.md).

## Safety limits

- **Max evaluation depth** (default 50) prevents runaway recursion.
- **Circular indirect references** (`<##...##>`) are detected and reported with the cycle path.

## Further reading

- [Modern syntax overview](architecture/new_syntax_technical_overview.md) (in progress)
- [Property access patterns](architecture/property_access_patterns.md)
- [Host environment integration](architecture/host_environment_integration.md)
