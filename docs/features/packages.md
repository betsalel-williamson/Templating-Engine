# Packages

## `@bwilliamson/template-engine-core`

Parser and evaluator library.

| Export                                 | Description                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------- |
| `parseLegacy(template, options?)`      | Parse [legacy syntax](../glossary/legacy-syntax.md) (stable)                                |
| `parseModern(template, options?)`      | Parse [modern syntax](../glossary/modern-syntax.md) (experimental)                          |
| `createSecureEvaluator({ functions })` | Build a [secure evaluator](../glossary/secure-evaluator.md) with a frozen function registry |
| `formatTemplateParseError`             | rustc-style parse error string (line, column, caret)                                        |
| `isTemplateSyntaxError`                | Detect parse errors with `location` metadata                                                |

Pass `sourcePath` in parse options so diagnostics name the template file. See [Parse diagnostics](./architecture/parse_diagnostics.md).

[Data context](../glossary/data-context.md) values are `Map`-based. Convert nested JSON objects to nested `Map` instances before evaluation.

`parseModern` is **library-only** — the CLI does not expose it. Treat modern parsing as exploratory; long-term syntax direction is in [V2 design goals](./architecture/v2_design_goals.md) (ADR-002 forthcoming in [issue #76](https://github.com/betsalel-williamson/Templating-Engine/issues/76)).

## `@bwilliamson/template-engine-cli`

Command-line renderer for **legacy** templates and JSON data.

```bash
template-engine --template template.txt --data data.json
```

Parse failures are written to stderr with `path:line:column` and a source caret. See [CLI (client)](../client/cli.md).

The CLI intentionally registers **no** template functions. Use the core library when custom functions are required.

## Monorepo layout

```text
packages/
  template-engine-core/
  template-engine-cli/
```

Maintainer commands and release workflow: [developer guide](../developer/index.md).
