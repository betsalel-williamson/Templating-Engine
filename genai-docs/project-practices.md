# Project Practices

This document outlines general project practices that apply across all languages and technologies used in the project.

## Clear Documentation and Usage Examples (`README.adoc`)

Provide comprehensive documentation for configurations, including evaluation instructions and common use cases.

- **Principle**: Use AsciiDoc (`.adoc`) for rich documentation.
- **Principle**: Define reusable URIs (for example, `:uri-name: url`).
- **Principle**: Embed shell command examples using `[source,bash]` blocks.
- **Principle**: Explain commands with glob patterns, output flags (`-o`, `-m`), and integration with tools like `kubectl`.

**Example:**

```adoc
// README.adoc (snippet)
To evaluate all manifests, run:

[source,bash]
----
$ pkl eval **/*.pkl
----

# Write each resource as its own file to a path within `.output/`
$ pkl eval -m .output/ **/*.pkl
```

## Language Feature Selection Principles

When choosing which language features to employ, prioritize clarity, commonality, and composability over conciseness or single-line power. Complex or obscure language features, while sometimes powerful, can increase cognitive load, reduce readability, and hinder cross-language understanding. The aim is to build rich behavior by composing simpler, more widely understood instructions.

- **Lean into:**
  - Features common across multiple paradigms (for example, basic control flow, functional primitives like map/filter/reduce).
  - Explicit and clear constructs.
  - Patterns that promote modularity and testability.
- **Avoid (or use with extreme caution):**
  - Highly specialized or obscure language constructs.
  - Features that create implicit side effects or hidden complexity.
  - "Magic" features that obscure the underlying logic.
