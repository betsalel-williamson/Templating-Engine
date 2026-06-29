# Packages

## `@bwilliamson/template-engine-core`

Parser and evaluator library.

| Export                                 | Description                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------- |
| `parseLegacy(template)`                | Parse [legacy syntax](../glossary/legacy-syntax.md) (stable)                                |
| `parseModern(template)`                | Parse [modern syntax](../glossary/modern-syntax.md) (experimental)                          |
| `createSecureEvaluator({ functions })` | Build a [secure evaluator](../glossary/secure-evaluator.md) with a frozen function registry |

[Data context](../glossary/data-context.md) values are `Map`-based. Convert nested JSON objects to nested `Map` instances before evaluation.

## `@bwilliamson/template-engine-cli`

Command-line renderer for legacy templates and JSON data.

```bash
template-engine --template template.txt --data data.json
```

The CLI intentionally registers **no** template functions. Use the core library when custom functions are required.

## Monorepo layout

```text
packages/
  template-engine-core/
  template-engine-cli/
```

Maintainer commands and release workflow: [developer guide](../developer/index.md).
