# Overview

TypeScript port of the classic [mergeEngine](https://jordanhenderson.com/) templating language. Templates combine literal text with tags that read a [data context](../glossary/data-context.md), iterate, branch, and call host-registered functions.

## Mental model

```text
Template string → Parser (legacy or modern) → Canonical AST → Secure evaluator → Output string
```

Both [legacy syntax](../glossary/legacy-syntax.md) and [modern syntax](../glossary/modern-syntax.md) grammars produce the same [AST](../glossary/ast.md) so evaluation logic stays in one place.

## Packages

| Package                             | Role                                                                |
| ----------------------------------- | ------------------------------------------------------------------- |
| `@bwilliamson/template-engine-core` | Peggy parsers, canonical AST types, secure evaluator                |
| `@bwilliamson/template-engine-cli`  | `template-engine` command — legacy syntax, JSON data, stdout output |

See [Packages](./packages.md) for exports and boundaries.

## Security

The [secure evaluator](../glossary/secure-evaluator.md) uses a trusted-kernel pattern: register functions once, freeze the registry, evaluate. The CLI ships with an empty function registry. Read [secure templating guide](./architecture/secure_templating_guide.md) before exposing I/O from template functions.

## Status

Packages are published to npm but remain **pre-1.0**: APIs and syntax may change without a major bump until `1.0.0`. Pin exact versions in production.
