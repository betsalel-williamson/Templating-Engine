# Developer Guide

**Audience:** Contributors and maintainers working in this monorepo.

**Scope:** Setup, layout, validation, releases, and the MDCP documentation pipeline — not end-user template tutorials. Product behavior is documented under [features](docs/features/index.md) and [client](docs/client/index.md).

**Planning and delivery:** Open work lives in [GitHub Issues](https://github.com/betsalel-williamson/Templating-Engine/issues) on the [project board](https://github.com/users/betsalel-williamson/projects/5). Agents and contributors load scope and delivery conventions from [agent work-item tracking](#agent-work-item-tracking).

## Glossary

Shared terms for the Templating Engine documentation. Spell out on first use in a shard and link the short form here.

Each term is its own shard under `docs/glossary/`. Sub-indexes group related terms.

**Inclusion bar:** Add a glossary entry when a term is project-specific jargon, overloaded in general English, or when two docs use the same word for different ideas (for example **modern syntax** vs **V2** destination).

**Terminology:** [Legacy syntax](#legacy-syntax) is the stable, shipped template surface today. [Modern syntax](#modern-syntax) names the experimental `parseModern` grammar in the codebase—not the long-term language destination. [V2](#v2) and [logic-less presentation](#logic-less-presentation) describe the active design direction (Mustache-inspired presentation, JS/TS-first [host layer](#host-layer), code-generation use cases). Do not treat exploratory `{% ... %}` control blocks or superseded ADR-001 Pkl guidance as current product direction.

### Templating terms

See [index-templating](#templating-terms).

### Documentation terms

See [index-protocol](#protocol-terms).

## Local setup

```bash
git clone https://github.com/betsalel-williamson/Templating-Engine.git
cd Templating-Engine
pnpm install
```

Requires Node.js >= 24.0.0 (see `.nvmrc`).

```bash
pnpm run build
pnpm run test
```

## Repository layout

```text
packages/
  template-engine-core/   @bwilliamson/template-engine-core
  template-engine-cli/    @bwilliamson/template-engine-cli
docs/
  glossary/               shared terms (one shard per term)
  features/               product capabilities and architecture
  developer/              this guide (compiles to DEVELOPERS.md)
  client/                 end-user guide
```

Open work is tracked in [GitHub Issues](https://github.com/betsalel-williamson/Templating-Engine/issues) on the [Templating Engine project board](https://github.com/users/betsalel-williamson/projects/5). See [project management](#project-management) and [agent work-item tracking](#agent-work-item-tracking).

Sharded documentation is configured in [`docs/mdcp.config.json`](docs/mdcp.config.json).

## Common commands

```bash
pnpm run build        # build all packages
pnpm run test         # test all packages
pnpm run typecheck    # TypeScript check all packages
pnpm run check        # typecheck + lint + format + build + test
pnpm run lint:md      # root markdownlint (non-mdcp paths)
```

Documentation (Node >= 24):

```bash
pnpm run docs:compile # compile shards + refresh llms-index
pnpm run docs:check   # compile, refs, xrefs, markdownlint
pnpm run docs:context # export features monolith for agent context
```

Look up link slugs from compiled output (quote multi-word queries):

```bash
pnpm docs:refs -- "Template language"
```

## Pre-commit hooks

- `lint-staged` formats and lints staged files.
- `scripts/pre-commit-affected.mjs` typechecks, builds, and runs related tests for touched packages only.
- `commitlint` enforces Conventional Commits on commit messages.

## Changesets and releases

When changing publishable package code, add a changeset:

```bash
pnpm changeset
```

Verify before opening a PR:

```bash
pnpm changeset:status
```

### Publishing

1. Merge PRs with changesets to `main`.
2. On `main`, run `pnpm release:tag:push` (interactive; requires a TTY).
3. CI publishes to npm on tag push (`v*`).
4. SEA binaries are published separately via the `release-binaries` workflow.

Record removed or breaking behavior in the **changeset**, not in feature or client shards.

## Standalone CLI binaries

Build a self-contained executable (Node.js SEA) for the CLI package on **Linux** or **macOS**:

```bash
pnpm --filter @bwilliamson/template-engine-cli run build:standalone:linux
pnpm --filter @bwilliamson/template-engine-cli run build:standalone:macos
```

Artifacts are written to `packages/template-engine-cli/dist/` (`template-engine-linux` or `template-engine-macos`). Binaries are published separately via the `release-binaries` workflow as `template-engine-v*-{linux,macos}` on GitHub Releases.

Windows is not part of the standalone release matrix. Windows users should use the npm-published CLI. Decision, restore criteria, and pointers to the prior Windows SEA/CI implementation are in [ADR-003: Retire Windows SEA and CI](docs/features/architecture/adr-003-retire-windows-sea-ci.md).

Release artifacts are **not** Apple-signed or notarized. macOS users may see a Gatekeeper warning on first launch; the safe one-time **Control-click → Open** workaround is documented in the [CLI client guide](./docs/_build/client.md#macos-gatekeeper).

## Docs dogfooding

Documentation is sharded under [`docs/`](../). [Shards](docs/glossary/shard.md) are the **source of truth**; compiled output is generated by [mdcp](docs/glossary/mdcp.md).

### Guide directories

| Directory    | Audience             | Output                                            |
| ------------ | -------------------- | ------------------------------------------------- |
| `glossary/`  | Shared terms         | One shard per term; scoped transitive stitch      |
| `features/`  | Product capabilities | `docs/_build/guides.md` (gitignored local review) |
| `developer/` | Contributors         | `DEVELOPERS.md` at repo root                      |
| `client/`    | End users            | `docs/_build/client.md` (gitignored local review) |

Config: [`docs/mdcp.config.json`](docs/mdcp.config.json).

### Edit workflow

1. Edit shard `.md` files under the relevant guide directory.
2. Run `pnpm docs:compile` then `pnpm docs:check` (Node >= 24).
3. Commit shard changes. Regenerated `docs/_build/`, `docs/.caches/refs.json`, and `docs/mdcp.v*.llms.txt` (from `docs:compile`) are gitignored.
4. Commit `DEVELOPERS.md` when `developer/` shards change.

### Agent context

```bash
pnpm docs:context
```

Exports the **features** monolith only (`compileOrder` in config).

### Bootstrap prompts

After `mdcp export --llms-index --fetch`, task prompts are cached at `docs/.caches/mdcp/prompts/`:

- `feature-level-task.prompt.md`
- `doc-only-task.prompt.md`
- `design-architecture-task.prompt.md`
- `ux-task.prompt.md`
- `review-task.prompt.md`

Set `WORK_ITEM_LOOKUP` in each prompt to [agent work-item tracking](#agent-work-item-tracking).

### Linting

- **markdownlint** — shard preset from `@bwilliamson/mdcp-presets` plus compiled preset (`DEVELOPERS.md`, `_build/*.md`)
- **xref lint** — `mdcp check` flags broken cross-references in shards
- **link lint** — runs on every `docs:check` with default error severity

Use `mdcp refs lookup "<topic>" --format json` before inserting `[text](#slug)` — slugs come from **compiled** output.

## Project management

Planning work for this repository is tracked on the [Templating Engine project board](https://github.com/users/betsalel-williamson/projects/5).

### Board

| Setting       | Value                                                                        |
| ------------- | ---------------------------------------------------------------------------- |
| Project       | [Templating Engine](https://github.com/users/betsalel-williamson/projects/5) |
| Owner         | `betsalel-williamson`                                                        |
| Status values | Todo, In Progress, Done                                                      |
| Epics         | Parent issues with linked sub-issues                                         |

### Epics

| Epic                    | Issue                                                                     | Child issues |
| ----------------------- | ------------------------------------------------------------------------- | ------------ |
| Modern Syntax Migration | [#40](https://github.com/betsalel-williamson/Templating-Engine/issues/40) | #16–#30      |
| CLI Interface           | [#41](https://github.com/betsalel-williamson/Templating-Engine/issues/41) | #31          |
| Tooling and CI          | [#42](https://github.com/betsalel-williamson/Templating-Engine/issues/42) | #32–#38      |

Epic issues were created by `scripts/configure-project-management.sh`. Re-run the script safely if you need to backfill a fresh board; it skips existing epics.

### Adding issues to the board

- **Issue templates** — `.github/ISSUE_TEMPLATE/*.yml` include `projects: [betsalel-williamson/5]` so template-created issues land on the board immediately.
- **Epics** — use the **Epic** issue template, then link child issues via **Set parent issue** in the GitHub UI or `gh` sub-issue APIs.
- **Backfill** — run `scripts/configure-project-management.sh` to add existing open issues to the board ([one-time setup](#one-time-setup)).

### One-time setup

After cloning or when bootstrapping a fresh project board:

```bash
chmod +x scripts/configure-project-management.sh
./scripts/configure-project-management.sh
```

This script:

1. Creates epic issues (if missing)
2. Links child issues under the correct epic
3. Adds all open repository issues to the project board

Requires `gh` authenticated with `project`, `read:project`, and `repo` scopes.

### Working conventions

- File work as issues; use epics for multi-issue initiatives.
- Keep one feature branch and PR per issue (see [agent work-item tracking](#agent-work-item-tracking)).
- Move project **Status** when starting or completing work.
- Reference issues in PRs with `Closes #N`.

## Agent work-item tracking

How coding agents load tracker issues and delivery conventions **for this repository**. Task-type prompts in `docs/.caches/mdcp/prompts/` point here via `WORK_ITEM_LOOKUP`.

### Tracker

```text
Host=GitHub (betsalel-williamson/Templating-Engine)
Issue base URL=https://github.com/betsalel-williamson/Templating-Engine/issues/
Issue templates=.github/ISSUE_TEMPLATE/ (bug, feature, docs, maintenance, epic)
Project board=https://github.com/users/betsalel-williamson/projects/5
WORK_ITEM=issue number (e.g. 42) or full issue URL
```

### Load scope

**GitHub CLI** (when `gh` is on `PATH` and authenticated):

```bash
gh issue view <number> --comments
```

**GitHub MCP** (when enabled): use GitHub issue tools to fetch the issue named in `WORK_ITEM`.

### Git and delivery

```text
Integration branch=main (pull before branching)
Feature branches=descriptive (e.g. feature/issue-42-mdcp-docs)
One branch per WORK_ITEM=do not mix unrelated features in one PR
Branch before work=create the feature branch before shards, tests, or code
Commits=conventional; atomic and logically grouped
Release notes=changeset in .changeset/ for user-facing package changes
Docs=describe current behavior only; breaking changes belong in changeset notes
Code review=gh pr create; link WORK_ITEM in PR body (Closes #N when appropriate)
```

### Example prompt header

```text
WORK_ITEM=42
WORK_ITEM_LOOKUP=Branch from main (pull first). One issue per branch. Load WORK_ITEM per docs/developer/agent-work-item-tracking.md.
```

## legacy syntax

**Stable, shipped** template surface derived from [mergeEngine](#mergeengine): tags such as `<#name#>`, `<~ ... ~>`, `<*>`, and `<{fn(...)}>`. Parsed by `parseLegacy` in `@bwilliamson/template-engine-core`. Default for the CLI and stable API.

This RPL-style surface preserves mergeEngine's mathematical transformation semantics. It is not the long-term [V2](#v2) destination—active design moves presentation toward [logic-less presentation](#logic-less-presentation) with [host layer](#host-layer) data prep—but legacy syntax remains supported for existing recipes.

## modern syntax

**Experimental parser surface** — not the long-term language destination. The `parseModern` API in `@bwilliamson/template-engine-core` parses Jinja2/Handlebars-inspired `{{ ... }}` output tags and `{% ... %}` control blocks. The grammar is incomplete and **implementation in flux**; imperative control flow in template text is exploratory, not the intended [logic-less presentation](#logic-less-presentation) model.

The **destination direction** for Version 2 is Mustache-style logic-less presentation with branching and iteration planned in the [host layer](#host-layer). See [V2 design goals](docs/features/architecture/v2_design_goals.md).

The CLI and stable API use [legacy syntax](#legacy-syntax) via `parseLegacy`.

## V2

**Active design** toward a Mustache-inspired, [logic-less presentation](#logic-less-presentation) template language with a JavaScript/TypeScript-first [host layer](#host-layer), optimized for **code generation** use cases.

V2 is **not** a synonym for [modern syntax](#modern-syntax): the experimental `parseModern` grammar is exploratory. Normative goals are in [V2 design goals](docs/features/architecture/v2_design_goals.md); the on-paper language specification is in [V2 language spec](docs/features/language-spec/index.md). Decision record: [ADR-002](docs/features/architecture/adr-002-mustache-js-first-code-generation.md); [Pkl](https://pkl-lang.org/) is **not** a recommended path.

[Legacy syntax](#legacy-syntax) remains the stable shipped surface until V2 syntax lands.

## logic-less presentation

Template design principle inspired by [Mustache](https://mustache.github.io/): template text **renders prepared data**; branching, iteration, aggregation, and side effects belong in the [host layer](#host-layer) (JavaScript/TypeScript) that builds [data context](#data-context) before render.

Destination for [V2](#v2)—not fully expressed in any single shipped syntax surface yet. Exploratory `{% if %}` / `{% for %}` blocks in [modern syntax](#modern-syntax) are implementation in flux, not normative direction. See [V2 design goals](docs/features/architecture/v2_design_goals.md).

## host layer

The JavaScript/TypeScript program or build step that prepares template [data context](#data-context) before rendering: shaping arrays for sections, computing flags for conditionals, registering safe functions, and orchestrating **code generation** workflows.

[V2](#v2) design puts control decisions here rather than in template text ([logic-less presentation](#logic-less-presentation)). The engine does not execute arbitrary JavaScript inside template strings—the host prepares values; templates project and format them.

## Templating terms

- [AST](#ast)
- [cross-product](#cross-product)
- [data context](#data-context)
- [host layer](#host-layer)
- [legacy syntax](#legacy-syntax)
- [logic-less presentation](#logic-less-presentation)
- [mergeEngine](#mergeengine)
- [modern syntax](#modern-syntax)
- [Mustache section](#mustache-section)
- [output expression](#output-expression)
- [TrustedTemplate](#trustedtemplate)
- [secure evaluator](#secure-evaluator)
- [V2](#v2)

## Protocol terms

- [mdcp](#mdcp)
- [shard](#shard)

## shard

Single-topic Markdown source file under a guide directory (`docs/features/`, `docs/client/`, etc.). Shards are the source of truth; compiled monoliths and publish outputs are generated by `mdcp compile`.

## mdcp

**MarkDown Context Protocol** — sharded documentation with compile, validation, and export for agents and CI. This repository uses mdcp for `docs/features/`, `docs/developer/`, and `docs/client/`.

## mergeEngine

Classic **Recipe Programming Language (RPL)**-style templating by Jordan Henderson (original implementation in TCL). Templates treat text and data as operands—projection (`<*>`), conditionals (`<+>`), and indirection (`<##...##>`) express transformation rather than imperative programs.

This repository ports mergeEngine semantics to TypeScript with a Peggy parser and a [secure evaluator](#secure-evaluator). The **destination** keeps RPL's transformation power without a TCL-first template surface; see [V2](#v2) and [logic-less presentation](#logic-less-presentation).

## data context

Named values a template reads at evaluation time. The [host layer](#host-layer) prepares context before render; the core library uses `Map` keys and values. Nested objects from JSON should be converted to nested `Map` instances before evaluation.

## AST

**Abstract Syntax Tree** — the canonical tree structure produced by a template parser. [Legacy syntax](#legacy-syntax) and experimental [modern syntax](#modern-syntax) grammars map to the same AST node types so one evaluator can render either surface.

## cross-product

Legacy iteration pattern: a loop walks an array and renders a sub-template for each element. Named after the original mergeEngine cross-product construct (`<*>` with `<[array]>`).

In [V2](#v2) destination design, the [host layer](#host-layer) prepares arrays and templates use section-style rendering rather than reimplementing loop control flow in template text.

## Mustache section

**Proposed** V2 construct: `{} … {{/name}}` (positive) and `{{^name}} … {{/name}}` (inverted) blocks that render over host-prepared context.

When the host supplies an **array**, the engine iterates the block; when it supplies a **boolean** or truthy/falsy scalar, the block acts as conditional; inverted sections cover missing/false cases. Replaces legacy RPL iteration/branch operators and **replaces** exploratory Jinja `{% for %}` / `{% if %}` as destination syntax.

**Not shipped** as the V2 Mustache parser destination today. See [surface syntax](docs/features/language-spec/surface-syntax.md) and [logic-less presentation](#logic-less-presentation).

## output expression

**Proposed** V2 and **partially shipped** experimental construct: text inside `{{ … }}` delimiters that evaluates to a value, applies optional filter pipelines, escapes, and appends to template output.

Destination surface for variable lookup, literals, filter chains (`| upper`, `| length`), and allowlisted function calls — not for imperative control flow. Control flow belongs in [Mustache sections](#mustache-section) over host-prepared context or in the [host layer](#host-layer).

**Shipped (experimental):** `parseModern` supports output expressions with dot access and filters. Function-call shape and full V2 grammar are **proposed**.

See [surface syntax](docs/features/language-spec/surface-syntax.md).

## TrustedTemplate

**Status:** **Proposed** V2 host contract — not fully enforced in product code.

Explicit wrapper type for output from host functions or macros that **intentionally contains template syntax** and may be expanded (rescanned) by the evaluator. Plain string returns are treated as **data**: escaped and written without rescan.

Only developer-controlled host code may construct TrustedTemplate; untrusted user content must never be promoted. Prevents SSTI and uncontrolled m4-style blind rescan. Spec: [host layer contracts](docs/features/language-spec/host-layer-contracts.md); architecture: [ADR-002](docs/features/architecture/adr-002-mustache-js-first-code-generation.md), [V2 mathematical design §4](docs/features/architecture/v2_mathematical_design.md).

Issue input: [#21](https://github.com/betsalel-williamson/Templating-Engine/issues/21).

## secure evaluator

Evaluation kernel created by `createSecureEvaluator`. The function registry is frozen at creation time so templates cannot mutate host capabilities at runtime. See [secure templating](docs/features/architecture/secure_templating_guide.md).
