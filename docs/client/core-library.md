# Core library

`@bwilliamson/template-engine-core` provides parsers and a [secure evaluator](../glossary/secure-evaluator.md).

## Install

```bash
npm install @bwilliamson/template-engine-core
```

Requires Node.js >= 22.12.

## Usage

```typescript
import { createSecureEvaluator, parseLegacy } from '@bwilliamson/template-engine-core';

const evaluate = createSecureEvaluator({
  functions: new Map([['toUpperCase', (str: string) => str.toUpperCase()]]),
});

const ast = parseLegacy('Hello, <#name#>!');
const context = new Map([['name', 'World']]);
const output = await evaluate(ast, context);
```

## API

| Export                                 | Description                                                        |
| -------------------------------------- | ------------------------------------------------------------------ |
| `parseLegacy(template)`                | Parse [legacy syntax](../glossary/legacy-syntax.md) (stable)       |
| `parseModern(template)`                | Parse [modern syntax](../glossary/modern-syntax.md) (experimental) |
| `createSecureEvaluator({ functions })` | Build an evaluator with a frozen function registry                 |

[data context](../glossary/data-context.md) values are `Map`-based. Nested JSON objects should be converted to nested `Map` instances.

Full syntax reference: [template language](./template-language.md).
