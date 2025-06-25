# Language Orthogonality Principle

## Guiding Principle

**Any construct within the template language that expects a value can instead accept a template that resolves to that value.**

This principle of orthogonality is a core design philosophy of the engine. It guarantees that features are composable and work together predictably without special rules or exceptions. For example, you don't need to wonder if a function's argument can be a variable, or if a loop's array name can be constructed dynamically. The answer is always yes.

## Examples of Orthogonality

This principle applies across the entire language. Below are concrete examples in both legacy and modern syntax.

### 1. In Array Names (Cross-Product / `for` loop)

An array name doesn't have to be a literal; it can be a template that resolves to the name of an array in the data context.

- **Legacy:** `<~...<*><[<#entity#>_list]>~>`
- **Modern:** `{% for item in config[entity_list_name] %}` (Assumes `config` holds the lists)

### 2. In Array Slices

The offset and limit for an array slice can be provided by variables.

- **Legacy:** `<~{<#offset#>,<#limit#>}...~>`
- **Modern:** `{{ items | slice(offset, limit) }}` (where `offset` and `limit` are context variables)

### 3. In Dynamic Property Access

The key for a property lookup can be dynamically constructed.

- **Legacy:** `<##<#env#>-db-host##>`
- **Modern:** `{{ settings[env + '-db-host'] }}` (Assumes a `settings` object and that `+` is a concatenation filter/operator)

### 4. In Conditional Logic

The value being tested in a conditional can be the result of a complex, nested evaluation.

- **Legacy:** `<~<+>...<?<{lookupSomething(<#id#>)}?>~>`
- **Modern:** `{% if lookupSomething(id) %}`

### 5. In Function Arguments

The arguments passed to a function are themselves templates that are fully resolved before the function is called.

- **Legacy:** `<{add(<#var1#>, <{getOffset(<#entity#)}}>)}>`
- **Modern:** `{{ add(var1, getOffset(entity)) }}`

Adhering to this principle ensures the language remains simple, powerful, and predictable as it evolves.
