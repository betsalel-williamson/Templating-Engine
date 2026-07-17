# Parse Diagnostics

## Objective

Define the compiler-style diagnostic contract for template failures so integrators and operators get a file path, line, column, and source caret—like rustc or TypeScript—whether the failure is syntax or runtime evaluation.

## Diagnostic shape

Both parse failures and evaluation failures that carry source metadata use the same multi-line shape on stderr or in application logs:

```text
Error: Expected end of input but "{" found.
 --> report.v2.template:3:7
  |
3 | line2 {{ unclosed
  |       ^
```

```text
Error: Unknown filter: "unknown"
 --> filters.template:2:12
  |
2 | {{ users | unknown }}
  |            ^
```

| Field                  | Meaning                                    |
| ---------------------- | ------------------------------------------ |
| Message line           | Parse expectation or runtime error message |
| `--> path:line:column` | 1-based line and column of the failure     |
| Source line            | The template line containing the error     |
| Caret (`^`)            | Column indicator under the error token     |

[Legacy](../../glossary/legacy-syntax.md) and [modern](../../glossary/modern-syntax.md) parsers share this shape for syntax errors. Evaluation diagnostics use the same shape when the failing construct has parse-time location metadata.

## AST source spans

Peggy grammars attach an optional `location` field to canonical AST nodes at parse time:

| Field                   | Meaning                                                |
| ----------------------- | ------------------------------------------------------ |
| `location.source`       | Template label from `ParseOptions.sourcePath` when set |
| `location.start.line`   | 1-based start line                                     |
| `location.start.column` | 1-based start column                                   |
| `location.end.line`     | 1-based end line (inclusive span)                      |
| `location.end.column`   | 1-based end column                                     |

The evaluator reads `location` from the node that triggered a failure when formatting runtime errors. Unknown-filter failures on modern syntax are the first supported evaluation path; additional error kinds may attach spans in follow-up work.

## Contracts

1. **Named source.** When a template comes from a file, database record, or named slot, parsers accept a source label so diagnostics name that artifact—not only when writing to a terminal. The label is stored on AST `location.source` and on parse error locations.
2. **Full source text for formatting.** Building the caret requires the original template string; formatting from the message alone is not enough.
3. **Guard before reading location.** Not every thrown error includes line/column metadata. Callers distinguish syntax errors and location-bearing evaluation errors from plain runtime errors before reading spans.
4. **Fail closed on invalid syntax.** Invalid syntax throws; it does not partially render.
5. **CLI parity.** The `template-engine` CLI attaches a source label (`--template` path or `<stdin>`) and writes formatted parse errors to stderr. Hosted renderers should match that pattern for evaluation errors as spans roll out.
6. **LLM-ready output.** Formatted diagnostics are self-contained: message, path, line/column, and caret are typically enough to paste into an LLM prompt without extra explanation.

Integrator usage and package exports live in the [core library (client)](../../client/core-library.md) guide; this shard defines the product contract only.

## Coverage (today)

| Error kind            | Location metadata      | Typical message                                |
| --------------------- | ---------------------- | ---------------------------------------------- |
| Parse / syntax        | Yes (`line`, `column`) | `Expected end of input but …`                  |
| Unknown filter        | Yes (filter span)      | `Unknown filter: "…"`                          |
| Circular alias        | No                     | `Circular alias reference detected: …`         |
| Max evaluation depth  | No                     | `Max evaluation depth exceeded …`              |
| Unregistered function | No                     | `Attempted to call unregistered function: "…"` |

Additional evaluation paths may attach spans later; the diagnostic shape above stays the target when location metadata is present.

## Related documents

- [Core library (client)](../../client/core-library.md)
- [CLI (client)](../../client/cli.md)
- [Modern syntax technical overview](./new_syntax_technical_overview.md)
- [V2 design goals](./v2_design_goals.md) — reviewability for humans and LLMs
