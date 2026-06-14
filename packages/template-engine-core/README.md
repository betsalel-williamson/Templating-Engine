# @bwilliamson/template-engine-core

Secure templating engine library.

## Install

```bash
npm install @bwilliamson/template-engine-core
```

## Usage

```typescript
import { createSecureEvaluator, parseLegacy } from '@bwilliamson/template-engine-core';

const evaluate = createSecureEvaluator({ functions: new Map() });
const output = await evaluate(parseLegacy('Hello, <#name#>!'), new Map([['name', 'World']]));
```
