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

See **[Template Language Reference](docs/client/template-language.md)** for the full syntax guide, examples, and behavioral notes.

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

**Standalone binary (GitHub Releases)**

Pre-built executables for Linux, macOS, and Windows are attached to [GitHub Releases](https://github.com/betsalel-williamson/Templating-Engine/releases) (for example `template-engine-v1.2.3-macos`). Download the file for your platform, make it executable if needed, and run it with the same flags as the npm CLI.

### macOS: Gatekeeper warning

On macOS, the first launch of a downloaded release binary may be blocked by **Gatekeeper** with a message that the developer cannot be verified. Release binaries are **not** signed with an Apple Developer ID certificate and are **not** notarized. That is expected for the current release process.

To run the binary safely without changing system-wide security settings:

1. Download `template-engine-v*-macos` from [GitHub Releases](https://github.com/betsalel-williamson/Templating-Engine/releases).
2. In Finder, **Control-click** (or right-click) the file and choose **Open**.
3. In the dialog, click **Open** again to confirm.
4. macOS records a one-time exception for that file; later runs from Terminal or Finder should work normally.

If you prefer to avoid this step, install the CLI with npm instead (`npm install -g @bwilliamson/template-engine-cli`).

See [CLI — standalone binary](docs/client/cli.md#standalone-binary) for more detail.

## Development

```bash
git clone https://github.com/betsalel-williamson/Templating-Engine.git
cd Templating-Engine
pnpm install
pnpm run build
pnpm run test
```

See [DEVELOPERS.md](DEVELOPERS.md) for changesets, releases, contributor workflow, and the [mdcp](docs/mdcp.v0.4.llms.txt) documentation pipeline (`pnpm docs:compile`, `pnpm docs:check`). Requires Node.js >= 24.0.0 (see `.nvmrc`).

## Background

This project started as a learning exercise porting `mergeEngine` to TypeScript with a Peggy parser. See [ADR-001](docs/features/architecture/adr-001-adopt-pkl.md) for notes on how it relates to [Pkl](https://pkl-lang.org/) and future direction.
