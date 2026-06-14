# Templating Engine

A TypeScript port of the classic [`mergeEngine`](https://jordanhenderson.com/) templating language. Use it to generate configuration, code, or other text from templates and structured data.

> **Pre-1.0:** Packages are published to npm, but APIs and template syntax may change without a major-version bump until `1.0.0`. Pin exact versions in production and read release notes before upgrading.

<p align="center">
    <a href="https://github.com/betsalel-williamson/Templating-Engine/blob/main/LICENSE">
        <img alt="License" src="https://img.shields.io/github/license/betsalel-williamson/Templating-Engine?style=flat-square&color=blue">
    </a>
    <a href="https://github.com/betsalel-williamson/Templating-Engine/actions/workflows/ci.yml">
        <img alt="CI Status" src="https://github.com/betsalel-williamson/Templating-Engine/actions/workflows/ci.yml/badge.svg">
    </a>
</p>

## Packages

| Package                                                              | npm                                                                                       | Description                         |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------- |
| [`@bwilliamson/template-engine-core`](packages/template-engine-core) | [`template-engine-core`](https://www.npmjs.com/package/@bwilliamson/template-engine-core) | Parser, evaluator, and types        |
| [`@bwilliamson/template-engine-cli`](packages/template-engine-cli)   | [`template-engine-cli`](https://www.npmjs.com/package/@bwilliamson/template-engine-cli)   | `template-engine` command-line tool |

Install and usage details live in each package README.

## Template language

Templates mix literal text with tags for variables, loops, conditionals, and function calls. The current stable surface uses **legacy syntax** (for example `<#name#>`, `<~ ... ~>`).

```txt
Template: Hello, <#name#>!
Context:  { "name": "World" }
Output:   Hello, World!
```

See **[Template Language Reference](docs/template-language.md)** for the full syntax guide, examples, and behavioral notes.

## Quick start

**Library**

```bash
npm install @bwilliamson/template-engine-core
```

```typescript
import { createSecureEvaluator, parseLegacy } from '@bwilliamson/template-engine-core';

const evaluate = createSecureEvaluator({ functions: new Map() });
const output = await evaluate(parseLegacy('Hello, <#name#>!'), new Map([['name', 'World']]));
```

**CLI**

```bash
npm install -g @bwilliamson/template-engine-cli
template-engine --template template.txt --data data.json
```

## Development

```bash
git clone https://github.com/betsalel-williamson/Templating-Engine.git
cd Templating-Engine
pnpm install
pnpm run build
pnpm run test
```

See [DEVELOPERS.md](DEVELOPERS.md) for changesets, releases, and contributor workflow.

## Background

This project started as a learning exercise porting `mergeEngine` to TypeScript with a Peggy parser. See [ADR-001](docs/architecture/adr-001-adopt-pkl.md) for notes on how it relates to [Pkl](https://pkl-lang.org/) and future direction.
