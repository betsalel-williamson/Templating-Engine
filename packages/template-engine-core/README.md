# @bwilliamson/template-engine-core

Parser and secure evaluator for the mergeEngine-derived template language.

> **Pre-1.0:** Expect breaking changes in APIs and syntax until `1.0.0`. Pin exact versions and check release notes before upgrading.

Requires Node.js >= 24.0.

## Install

```bash
npm install @bwilliamson/template-engine-core
```

## Usage

```typescript
import { createSecureEvaluator, parseLegacy } from '@bwilliamson/template-engine-core';

const evaluate = createSecureEvaluator({
  functions: new Map([['toUpperCase', (str: string) => str.toUpperCase()]]),
});

const ast = parseLegacy('Hello, <#name#>!');
const context = new Map([['name', 'World']]);
const output = await evaluate(ast, context);
// => "Hello, World!"
```

### API

| Export                                 | Description                                        |
| -------------------------------------- | -------------------------------------------------- |
| `parseLegacy(template)`                | Parse legacy-syntax templates (stable)             |
| `parseModern(template)`                | Parse modern-syntax templates (experimental)       |
| `createSecureEvaluator({ functions })` | Build an evaluator with a frozen function registry |

Data context values are `Map`-based. Nested objects from JSON should be converted to nested `Map` instances (see the CLI package for a reference implementation).

## Template language

Templates are plain text with embedded tags. The evaluator resolves tags against a data context and produces a string.

**Core constructs**

| Tag               | Example                   | Behavior                           |
| ----------------- | ------------------------- | ---------------------------------- |
| Variable          | `<#name#>`                | Insert a context value             |
| Indirect variable | `<##key##>`               | Use a value as the next lookup key |
| Expression        | `<~ ... ~>`               | Evaluate nested template content   |
| Loop              | `<~ ... <*> <[items]> ~>` | Iterate an array                   |
| Conditional       | `<~<+> ... <?cond?> ~>`   | Branch on a condition              |
| Function          | `<{fn(<#arg#>)}>`         | Call a registered function         |

**Example — loop with a sub-template**

```txt
Context:  { "users": [{ "name": "Alice" }, { "name": "Bob" }] }
Template: <~<`- <#name#>`><*><[users]>~>
Output:   - Alice- Bob
```

Full syntax, slicing rules, safety limits, and advanced patterns: **[Template Language Reference](https://github.com/betsalel-williamson/Templating-Engine/blob/main/docs/client/template-language.md)**.

Modern `{{ ... }}` / `{% ... %}` syntax is available via `parseModern` but is not yet feature-complete.

## Security

`createSecureEvaluator` uses a trusted-kernel pattern: the function registry is frozen at creation time. The library does not ship built-in functions for file, network, or shell access. See [secure templating guide](https://github.com/betsalel-williamson/Templating-Engine/blob/main/docs/features/architecture/secure_templating_guide.md) before registering host functions.

## Links

- [CLI package](https://www.npmjs.com/package/@bwilliamson/template-engine-cli)
- [Repository](https://github.com/betsalel-williamson/Templating-Engine)
- [Issues](https://github.com/betsalel-williamson/Templating-Engine/issues)
