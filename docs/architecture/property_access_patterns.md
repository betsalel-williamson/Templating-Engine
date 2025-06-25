# Architectural Guide: Property Access Patterns

## Objective

This document details the two distinct patterns for accessing properties of objects within the modern templating syntax: **Static Key Access (`.`)** and **Dynamic Key Access (`[]`)**. Understanding the purpose and trade-offs of each is essential for writing efficient, readable, and maintainable templates.

---

### 1. Static Key Access (`.` notation)

This is the standard, preferred method for accessing object properties.

- **Syntax:** `{{ user.name }}`
- **Meaning:** "Access the property with the literal key `name` on the `user` object."
- **When to Use:** Use this whenever you know the exact name of the property at the time you are writing the template. This covers the vast majority of use cases.
- **Engine Implementation:** This is a highly efficient, single-step process. At parse-time, the engine identifies `name` as a static key. At run-time, the evaluator performs a direct lookup on the data context map (e.g., `userMap.get('name')`).

**Example:**

```txt
// CONTEXT
{
  user: Map([
    ['name', 'Alice'],
    ['status', 'active']
  ])
}

// TEMPLATE
<p>User: {{ user.name }}</p>
<p>Status: {{ user.status }}</p>
```

---

### 2. Dynamic Key Access (`[]` notation)

This is a more advanced feature for creating generic, reusable templates. It is the modern replacement for the legacy `<##...##>` construct.

- **Syntax:** `{{ user[key_variable] }}`
- **Meaning:** "First, evaluate the expression inside the brackets (`key_variable`) to get a string. Then, use that resulting string as the key to access a property on the `user` object."
- **When to Use:** Use this **only** when the name of the property you need to access is not known when writing the template and is instead determined by runtime data. This is ideal for meta-programming or building highly generic components.
- **Engine Implementation:** This is a two-step process:
    1. **Resolve Key:** The evaluator must first fully evaluate the template inside the brackets to resolve it to a string (e.g., `'name'`).
    2. **Perform Lookup:** It then uses that resulting string to perform the lookup on the data context map (e.g., `userMap.get('name')`).

**Example:**

```txt
// CONTEXT
{
  user: Map([
    ['name', 'Alice'],
    ['id', 'usr_123']
  ]),
  display_key: 'id' // The key itself is data
}

// GENERIC TEMPLATE
<p>Primary Display: {{ user[display_key] }}</p>
// Step 1: `display_key` resolves to the string 'id'.
// Step 2: The engine looks up `user['id']`.
```

---

## Performance Considerations & Guidance

While both patterns are fast, there is a measurable difference in their execution path that is important to understand.

- **Static (`.`) is more performant than Dynamic (`[]`).**

The reason is the number of evaluation steps required. Static access is a direct, single-step lookup. Dynamic access requires a preliminary evaluation step to determine the key before the final lookup can occur.

## Recommendation

1. **Default to Static Access (`.`):** Always use dot notation when the property key is known. It is faster, more explicit, and easier for other developers to read and understand.
2. **Use Dynamic Access (`[]`) Deliberately:** Reserve bracket notation for cases where it provides significant value by reducing code duplication or enabling generic components. Its purpose is to handle keys that are determined at runtime.
3. **Do Not Prematurely Optimize:** For 99% of templates, the performance difference will be imperceptible. The primary reason to prefer static access is **clarity and maintainability**. Do not avoid dynamic access where it is the correct tool for the job out of a misplaced concern for micro-optimizations. Choose the pattern that makes your template's intent the clearest.
