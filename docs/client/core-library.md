# Core library

`@bwilliamson/template-engine-core` provides parsers and a [secure evaluator](../glossary/secure-evaluator.md). Use it when embedding template rendering in a JavaScript/TypeScript application.

## Install

```bash
npm install @bwilliamson/template-engine-core
```

Requires Node.js >= 24.0.

## Host-first workflow

Templates render **prepared** context. Fetch, validate, map, filter, and branch in TypeScript **before** calling `evaluate`. Register only the template functions your application needs.

Long-term direction keeps logic in the host and templates logic-less — see [ADR-002](../features/architecture/adr-002-mustache-js-first-code-generation.md). Today, [legacy syntax](../glossary/legacy-syntax.md) is the stable surface; `parseModern` is exploratory and not CLI-supported.

## Usage

```typescript
import { createSecureEvaluator, parseLegacy } from '@bwilliamson/template-engine-core';

const evaluate = createSecureEvaluator({
  functions: new Map([['toUpperCase', (str: string) => str.toUpperCase()]]),
});

const ast = parseLegacy('Hello, <#name#>!', { sourcePath: 'greeting.template' });
const context = new Map([['name', 'World']]);
const output = await evaluate(ast, context);
```

## API

| Export                                       | Description                                                          |
| -------------------------------------------- | -------------------------------------------------------------------- |
| `parseLegacy(template, options?)`            | Parse [legacy syntax](../glossary/legacy-syntax.md) (stable)         |
| `parseModern(template, options?)`            | Parse [modern syntax](../glossary/modern-syntax.md) (experimental)   |
| `createSecureEvaluator({ functions })`       | Build an evaluator with a frozen function registry                   |
| `formatTemplateParseError(error, opts)`      | Format a syntax error with line, column, and caret                   |
| `formatTemplateEvaluationError(error, opts)` | Format an evaluation error with line, column, and caret when present |
| `isTemplateSyntaxError(error)`               | Type guard for parse errors that include `location`                  |
| `isTemplateEvaluationError(error)`           | Type guard for evaluation errors that include `location`             |

`ParseOptions`:

| Option               | Description                                                         |
| -------------------- | ------------------------------------------------------------------- |
| `sourcePath`         | File or label shown in diagnostics (for example `invoice.template`) |
| `enablePeggyTracing` | Low-level Peggy trace logging (tests and debugging only)            |

[data context](../glossary/data-context.md) values are `Map`-based. Nested JSON objects should be converted to nested `Map` instances.

## Parse errors

Invalid template syntax throws a `SyntaxError` with `location.start.line` and `location.start.column` (1-based). Format errors for humans with `formatTemplateParseError`:

```typescript
import { formatTemplateParseError, parseLegacy } from '@bwilliamson/template-engine-core';

const sourcePath = 'report.template';
const source = 'Hello, <#name\n';

try {
  parseLegacy(source, { sourcePath });
} catch (error) {
  console.error(formatTemplateParseError(error, { sourcePath, sourceText: source }));
}
```

Example stderr-style output:

```text
Error: Expected end of input but "<" found.
 --> report.template:1:12
  |
1 | Hello, <#name
  |           ^
```

Best practices: always pass `sourcePath` when parsing file-backed templates; pass full `sourceText` when formatting. The formatted diagnostics are designed to be self-contained and are typically sufficient for LLM prompts to assist with fixing syntax issues. Some evaluation errors include the same line/column metadata when the failing AST node carries a parse-time `location`.

## Evaluation errors

When evaluation fails at a node with parse-time location metadata, format the error with `formatTemplateEvaluationError` using the same options as parse errors:

```typescript
import {
  createSecureEvaluator,
  formatTemplateEvaluationError,
  isTemplateEvaluationError,
  parseLegacy,
} from '@bwilliamson/template-engine-core';

const sourcePath = 'functions.template';
const source = '<{unknownFn(<#user#>)}>';
const evaluate = createSecureEvaluator({ functions: new Map() });
const context = new Map([['user', 'World']]);

try {
  const ast = parseLegacy(source, { sourcePath });
  await evaluate(ast, context);
} catch (error) {
  if (isTemplateEvaluationError(error)) {
    console.error(formatTemplateEvaluationError(error, { sourcePath, sourceText: source }));
  }
}
```

Full reference: [Parse diagnostics](../features/architecture/parse_diagnostics.md).

Full syntax reference: [template language](./template-language.md).
