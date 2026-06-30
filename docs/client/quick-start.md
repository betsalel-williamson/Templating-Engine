# Quick start

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
