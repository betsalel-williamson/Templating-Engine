# Quick start

The templating engine renders structured text from a template string plus a [data context](../glossary/data-context.md). Prepare data in JavaScript/TypeScript (library) or JSON (CLI); templates project that context. Arbitrary host code runs only when you register template functions in the core library — the CLI registers none.

Shipped syntax is [legacy](../glossary/legacy-syntax.md). Full reference: [template language](./template-language.md).

## Library

```bash
npm install @bwilliamson/template-engine-core
```

```typescript
import { createSecureEvaluator, parseLegacy } from '@bwilliamson/template-engine-core';

const evaluate = createSecureEvaluator({ functions: new Map() });
const output = await evaluate(parseLegacy('Hello, <#name#>!'), new Map([['name', 'World']]));
```

## CLI

```bash
npm install -g @bwilliamson/template-engine-cli
template-engine --template template.txt --data data.json
```

See [core library](./core-library.md) and [CLI](./cli.md) for API and flag details. Invalid syntax reports file, line, and column — see [Parse diagnostics](../features/architecture/parse_diagnostics.md).
