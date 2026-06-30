# Parse Diagnostics

## Objective

Document the compiler-style parse error format and the APIs integrators should use so syntax failures report file path, line, column, and a source caret—like rustc or TypeScript.

## Error format

When parsing fails, `formatTemplateParseError` produces multi-line diagnostics on stderr or in application logs:

```text
Error: Expected end of input but "{" found.
 --> report.v2.template:3:7
  |
3 | line2 {{ unclosed
  |       ^
```

| Field                  | Meaning                                     |
| ---------------------- | ------------------------------------------- |
| Message line           | Peggy parse expectation (`Error: …`)        |
| `--> path:line:column` | 1-based line and column of the failure      |
| Source line            | The template line containing the error      |
| Caret (`^`)            | Column indicator under the unexpected token |

Both [legacy](../../glossary/legacy-syntax.md) (`parseLegacy`) and [modern](../../glossary/modern-syntax.md) (`parseModern`) parsers use the same formatter.

## API

### Parse with a source label

Pass `sourcePath` so errors identify the template file (or a logical name such as `email-body.template`):

```typescript
import { parseModern } from '@bwilliamson/template-engine-core';

const ast = parseModern(templateSource, { sourcePath: 'report.v2.template' });
```

`sourcePath` maps to Peggy `grammarSource` and appears in `error.location.source`.

### Format errors for humans

```typescript
import {
  formatTemplateParseError,
  isTemplateSyntaxError,
  parseModern,
} from '@bwilliamson/template-engine-core';

const sourcePath = 'report.v2.template';

try {
  parseModern(templateSource, { sourcePath });
} catch (error) {
  if (isTemplateSyntaxError(error)) {
    console.error(formatTemplateParseError(error, { sourcePath, sourceText: templateSource }));
    // Optional: programmatic access
    const { line, column } = error.location!.start;
  }
  throw error;
}
```

| Export                                                         | Role                                               |
| -------------------------------------------------------------- | -------------------------------------------------- |
| `formatTemplateParseError(error, { sourcePath?, sourceText })` | rustc-style string for logs and UI                 |
| `isTemplateSyntaxError(error)`                                 | Type guard; checks for `location.start.line`       |
| `TemplateSyntaxError`                                          | Peggy `SyntaxError` with `location` and `format()` |
| `ParseOptions.sourcePath`                                      | File label attached at parse time                  |

## Best practices

1. **Always pass `sourcePath`** when the template comes from a file, database record, or named slot—not only when writing to a terminal. Reviewers and LLMs use the label to map errors back to the right artifact.
2. **Always pass full `sourceText` to `formatTemplateParseError`.** The caret requires the original template string; do not format from the message alone.
3. **Use `isTemplateSyntaxError` before reading `location`.** Evaluation errors (unknown filters, circular aliases, max depth) are plain `Error` objects without line/column metadata.
4. **Prefer parse-time failures over silent output.** Invalid syntax throws; it does not partially render. See [parse failure contracts](../../../packages/template-engine-core/test/new_syntax/parse-failures.test.ts) in the test suite.
5. **CLI integrators:** The `template-engine` CLI passes `sourcePath` (`--template` path or `<stdin>`) and writes formatted parse errors to stderr. Match this pattern in hosted renderers.
6. **Leverage diagnostics for LLM assistance.** The formatted parse errors (with their messages, line/column numbers, and source carets) are designed to be self-contained. When users encounter a syntax error, pasting the raw diagnostic output directly into an LLM prompt is typically sufficient for the AI to identify and fix the issue without needing additional explanation.

## Out of scope (today)

| Error kind           | Location metadata      | Typical message                        |
| -------------------- | ---------------------- | -------------------------------------- |
| Parse / syntax       | Yes (`line`, `column`) | `Expected end of input but …`          |
| Unknown filter       | No                     | `Unknown filter: "…"`                  |
| Circular alias       | No                     | `Circular alias reference detected: …` |
| Max evaluation depth | No                     | `Max evaluation depth exceeded …`      |

Runtime evaluation errors may gain source spans in a future change if AST nodes carry parse locations.

## Related documents

- [Core library (client)](../../client/core-library.md)
- [CLI (client)](../../client/cli.md)
- [Modern syntax technical overview](./new_syntax_technical_overview.md)
- [V2 design goals](./v2_design_goals.md) — reviewability for humans and LLMs
