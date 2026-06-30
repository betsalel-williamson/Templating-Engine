# Core library

`@bwilliamson/template-engine-core` provides parsers and a [secure evaluator](../glossary/secure-evaluator.md).

## Install

```bash
npm install @bwilliamson/template-engine-core
```

Requires Node.js >= 24.0.

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

| Export                                  | Description                                                        |
| --------------------------------------- | ------------------------------------------------------------------ |
| `parseLegacy(template, options?)`       | Parse [legacy syntax](../glossary/legacy-syntax.md) (stable)       |
| `parseModern(template, options?)`       | Parse [modern syntax](../glossary/modern-syntax.md) (experimental) |
| `createSecureEvaluator({ functions })`  | Build an evaluator with a frozen function registry                 |
| `formatTemplateParseError(error, opts)` | Format a syntax error with line, column, and caret                 |
| `isTemplateSyntaxError(error)`          | Type guard for parse errors that include `location`                |

`ParseOptions`:

| Option               | Description                                                         |
| -------------------- | ------------------------------------------------------------------- |
| `sourcePath`         | File or label shown in diagnostics (for example `invoice.template`) |
| `enablePeggyTracing` | Low-level Peggy trace logging (tests and debugging only)            |

[data context](../glossary/data-context.md) values are `Map`-based. Nested JSON objects should be converted to nested `Map` instances.

## Parse errors

Invalid template syntax throws a `SyntaxError` with `location.start.line` and `location.start.column` (1-based). Format errors for humans with `formatTemplateParseError`:

```typescript
import { formatTemplateParseError, parseModern } from '@bwilliamson/template-engine-core';

const sourcePath = 'report.v2.template';
const source = '{% for item in items %}\n  {{ item.name }}\n';

try {
  parseModern(source, { sourcePath });
} catch (error) {
  console.error(formatTemplateParseError(error, { sourcePath, sourceText: source }));
}
```

Example stderr-style output:

```text
Error: Expected end of input but "{" found.
 --> report.v2.template:2:3
  |
2 |   {{ item.name }}
  |   ^
```

Best practices: always pass `sourcePath` when parsing file-backed templates; pass full `sourceText` when formatting. The formatted diagnostics are designed to be self-contained and are typically sufficient for LLM prompts to assist with fixing syntax issues. Evaluation errors (unknown filters, circular aliases) do not include line/column metadata.

Full reference: [Parse diagnostics](../features/architecture/parse_diagnostics.md).

Full syntax reference: [template language](./template-language.md).
