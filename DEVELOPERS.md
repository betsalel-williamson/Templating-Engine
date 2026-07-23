# Developer Guide

<!-- mdcp-shard: start docs/developer/about-this-guide.md -->

**Audience:** Contributors and maintainers working in this monorepo.

**Scope:** Setup, layout, validation, releases, and the MDCP documentation pipeline — not end-user template tutorials. Product behavior is documented under [features](docs/features/index.md) and [client](docs/client/index.md).

**Planning and delivery:** Open work lives in [GitHub Issues](https://github.com/betsalel-williamson/Templating-Engine/issues) on the [project board](https://github.com/users/betsalel-williamson/projects/5). Agents and contributors load scope and delivery conventions from [agent work-item tracking](#agent-work-item-tracking).

<!-- mdcp-shard: end docs/developer/about-this-guide.md -->

<!-- mdcp-shard: start docs/glossary/index.md -->

## Glossary

Shared terms for the Templating Engine documentation. Spell out on first use in a shard and link the short form here.

Each term is its own shard under `docs/glossary/`. Sub-indexes group related terms.

**Inclusion bar:** Add a glossary entry when a term is project-specific jargon, overloaded in general English, or when two docs use the same word for different ideas (for example **modern syntax** vs **V2** destination).

**Terminology:** [Legacy syntax](#legacy-syntax) is the stable, shipped template surface today. [Modern syntax](#modern-syntax) names the experimental `parseModern` grammar in the codebase—not the long-term language destination. [V2](#v2) and [logic-less presentation](#logic-less-presentation) describe the active design direction (Mustache-inspired presentation, JS/TS-first [host layer](#host-layer), code-generation use cases). Do not treat exploratory `{% ... %}` control blocks or superseded ADR-001 Pkl guidance as current product direction.

### Templating terms

See [index-templating](#templating-terms).

### Documentation terms

See [index-protocol](#protocol-terms).

<!-- mdcp-shard: end docs/glossary/index.md -->

<!-- mdcp-shard: start docs/developer/local-setup.md -->

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

<!-- mdcp-shard: end docs/developer/local-setup.md -->

<!-- mdcp-shard: start docs/developer/repository-layout.md -->

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

<!-- mdcp-shard: end docs/developer/repository-layout.md -->

<!-- mdcp-shard: start docs/developer/common-commands.md -->

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
pnpm run docs:compile # compile shards to monoliths
pnpm run docs:check   # compile, refs, xrefs, markdownlint
pnpm run docs:context # print features monolith for agent context
```

List link slugs from compiled output:

```bash
pnpm docs:refs
```

<!-- mdcp-shard: end docs/developer/common-commands.md -->

<!-- mdcp-shard: start docs/developer/pre-commit-hooks.md -->

## Pre-commit hooks

- `lint-staged` formats and lints staged files.
- `scripts/pre-commit-affected.mjs` typechecks, builds, and runs related tests for touched packages only.
- `commitlint` enforces Conventional Commits on commit messages.

<!-- mdcp-shard: end docs/developer/pre-commit-hooks.md -->

<!-- mdcp-shard: start docs/developer/changesets-and-releases.md -->

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

Record removed or breaking behavior in the **changeset**, not in feature or client shards.

<!-- mdcp-shard: end docs/developer/changesets-and-releases.md -->

<!-- mdcp-shard: start docs/developer/docs-dogfooding.md -->

## Docs dogfooding

Documentation is sharded under [`docs/`](../). [Shards](docs/glossary/shard.md) are the **source of truth**; compiled output is generated by [mdcp](docs/glossary/mdcp.md).

This shard is about the **sharded docs** workflow only. Proving the V2 templating language is worth implementing is a separate gate: [ADR-006: Dogfood gate](docs/features/architecture/adr-006-dogfood-gate.md).

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
3. Commit shard changes. Regenerated `docs/_build/` and `docs/.caches/refs.json` (from `docs:compile` / `docs:check`) are gitignored.
4. Commit `DEVELOPERS.md` when `developer/` shards change.

### Agent context

```bash
pnpm docs:compile
pnpm docs:context
```

Prints the **features** monolith (`docs/_build/features.md`). Prefer reading individual shards via the MDCP Agent Skill when possible (`npx skills add betsalel-williamson/mdcp --skill mdcp`).

### Bootstrap prompts

MDCP 0.6+ no longer ships `mdcp export --llms-index` / `--fetch`. Use the installed Agent Skills under `.agents/skills/` (refresh with `npx skills add betsalel-williamson/mdcp -y --skill "*"`).

Set `WORK_ITEM_LOOKUP` in task prompts to [agent work-item tracking](#agent-work-item-tracking).

### Linting

- **markdownlint** — shard preset from `@bwilliamson/mdcp-presets` plus compiled preset (`DEVELOPERS.md`, `_build/*.md`)
- **xref lint** — `mdcp check` flags broken cross-references in shards
- **link lint** — runs on every `docs:check` with default error severity

Use `mdcp refs-list --format json` (or `pnpm docs:refs`) before inserting `[text](#slug)` — slugs come from **compiled** output.

<!-- mdcp-shard: end docs/developer/docs-dogfooding.md -->

<!-- mdcp-shard: start docs/developer/dogfood-gate.md -->

## Dogfood gate harness

Maintainer workflow for the language dogfood gate ([ADR-006](docs/features/architecture/adr-006-dogfood-gate.md)). This is **not** [docs dogfooding](#docs-dogfooding).

### Prerequisites

- Node >= 24 via nvm / login shell
- `CURSOR_API_KEY` with SDK access
- Repo dependencies installed (`pnpm install`)

### Commands

```bash
bash -lc 'pnpm dogfood:test'   # scorer unit tests
bash -lc 'pnpm dogfood:run'    # A/B pair for default task
```

Optional env:

| Variable                 | Meaning                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `DOGFOOD_TASK`           | Task id under `evals/dogfood/tasks/` (default `v2-trusted-template-gate`)          |
| `DOGFOOD_MODEL`          | Cursor model id (default `composer-2`)                                             |
| `DOGFOOD_NOISE_BAND`     | Relative tie band (default `0.1`; invalid or values above `0.1` clamp per ADR-006) |
| `DOGFOOD_KEEP_WORKTREES` | Set `1` to keep `.worktrees/dogfood-*` after the run                               |
| `DOGFOOD_RUN_ID`         | Stable id for worktree/report names                                                |

### Reading results

Reports land in `evals/dogfood/reports/<runId>.json` (gitignored). Each arm includes outcome correctness, **process-check results** (Arm B skill injection and contract engagement when observability is available), and usage/duration. Runs with **no-HITL** violations or failed process checks when observable are invalid and do not count toward go / slim-go / no-go.

Record the outcome on GitHub issue #96 with run ids, usage, durations, correctness details, process-check results, and the `outcome` field — use the comment template in [`evals/dogfood/README.md`](evals/dogfood/README.md#post-decision-on-96).

### Preflight

1. Run the pre-A/B skill mini-eval under `evals/dogfood/skills/v2-engine-build/eval/` (ADR-006 §4) before timed pairs — see that directory’s `README.md`.
2. `pnpm dogfood:test` must pass.
3. Broken harness / both-invalid → fix infra; do **not** record language no-go.

<!-- mdcp-shard: end docs/developer/dogfood-gate.md -->

<!-- mdcp-shard: start docs/developer/project-management.md -->

## Project management

Open work for this repository lives in [GitHub Issues](https://github.com/betsalel-williamson/Templating-Engine/issues) and on the [Templating Engine project board](https://github.com/users/betsalel-williamson/projects/5). The tracker is the source of truth — not local bootstrap scripts or durable docs backlogs.

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

Create new epics with the **Epic** issue template (`.github/ISSUE_TEMPLATE/epic.yml`). Link child issues via **Set parent issue** in the GitHub UI or the `gh` sub-issue APIs.

### File and track work

#### Issue templates

Templates under `.github/ISSUE_TEMPLATE/` cover bug reports, features, documentation, maintenance, and epics. Each template includes `projects: [betsalel-williamson/5]`, so issues created from a template land on the board immediately.

Create an issue from the web UI (**New issue** → pick a template) or with `gh`:

```bash
gh issue create --repo betsalel-williamson/Templating-Engine --template feature_request.yml
```

#### Add an existing issue to the board

When an issue was not created from a template, add it to the project with `gh`:

```bash
gh project item-add 5 --owner betsalel-williamson \
  --url https://github.com/betsalel-williamson/Templating-Engine/issues/<number>
```

#### View and update status

Browse or drag cards on the [project board](https://github.com/users/betsalel-williamson/projects/5), or use `gh issue view` / `gh issue edit` for issue fields. Move **Status** to **In Progress** when starting work and **Done** when the linked PR merges or the issue closes.

#### Agents and automation

Coding agents load issue scope via [agent work-item tracking](#agent-work-item-tracking):

- **`gh`** — `gh issue view <number> --comments` when the CLI is authenticated
- **GitHub MCP** — issue and project tools when the MCP server is enabled in the agent host

### Working conventions

- File work as issues; use epics for multi-issue initiatives.
- Keep one feature branch and PR per issue (see [agent work-item tracking](#agent-work-item-tracking)).
- Move project **Status** when starting or completing work.
- Reference issues in PRs with `Closes #N`.

<!-- mdcp-shard: end docs/developer/project-management.md -->

<!-- mdcp-shard: start docs/developer/agent-work-item-tracking.md -->

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

<!-- mdcp-shard: end docs/developer/agent-work-item-tracking.md -->

<!-- mdcp-shard: start docs/glossary/legacy-syntax.md -->

## legacy syntax

**Stable, shipped** template surface derived from [mergeEngine](#mergeengine): tags such as `<#name#>`, `<~ ... ~>`, `<*>`, and `<{fn(...)}>`. Parsed by `parseLegacy` in `@bwilliamson/template-engine-core`. Default for the CLI and stable API.

This RPL-style surface preserves mergeEngine's mathematical transformation semantics. It is not the long-term [V2](#v2) destination—active design moves presentation toward [logic-less presentation](#logic-less-presentation) with [host layer](#host-layer) data prep—but legacy syntax remains supported for existing recipes.

<!-- mdcp-shard: end docs/glossary/legacy-syntax.md -->

<!-- mdcp-shard: start docs/glossary/modern-syntax.md -->

## modern syntax

**Experimental parser surface** — not the long-term language destination. The `parseModern` API in `@bwilliamson/template-engine-core` parses Jinja2/Handlebars-inspired `{{ ... }}` output tags and `{% ... %}` control blocks. The grammar is incomplete and **implementation in flux**; imperative control flow in template text is exploratory, not the intended [logic-less presentation](#logic-less-presentation) model.

The **destination direction** for Version 2 is Mustache-style logic-less presentation with branching and iteration planned in the [host layer](#host-layer). See [V2 design goals](docs/features/architecture/v2_design_goals.md).

The CLI and stable API use [legacy syntax](#legacy-syntax) via `parseLegacy`.

<!-- mdcp-shard: end docs/glossary/modern-syntax.md -->

<!-- mdcp-shard: start docs/glossary/v2.md -->

## V2

**Active design** toward a Mustache-inspired, [logic-less presentation](#logic-less-presentation) template language with a JavaScript/TypeScript-first [host layer](#host-layer), optimized for **code generation** use cases.

V2 is **not** a synonym for [modern syntax](#modern-syntax): the experimental `parseModern` grammar is exploratory. Normative goals are in [V2 design goals](docs/features/architecture/v2_design_goals.md); the on-paper language specification is in [V2 language spec](docs/features/language-spec/index.md). Decision record: [ADR-002](docs/features/architecture/adr-002-mustache-js-first-code-generation.md); [Pkl](https://pkl-lang.org/) is **not** a recommended path.

[Legacy syntax](#legacy-syntax) remains the stable shipped surface until V2 syntax lands.

<!-- mdcp-shard: end docs/glossary/v2.md -->

<!-- mdcp-shard: start docs/glossary/logic-less-presentation.md -->

## logic-less presentation

Template design principle inspired by [Mustache](https://mustache.github.io/): template text **renders prepared data**; branching, iteration, aggregation, and side effects belong in the [host layer](#host-layer) (JavaScript/TypeScript) that builds [data context](#data-context) before render.

Destination for [V2](#v2)—not fully expressed in any single shipped syntax surface yet. Exploratory `{% if %}` / `{% for %}` blocks in [modern syntax](#modern-syntax) are implementation in flux, not normative direction. See [V2 design goals](docs/features/architecture/v2_design_goals.md).

<!-- mdcp-shard: end docs/glossary/logic-less-presentation.md -->

<!-- mdcp-shard: start docs/glossary/host-layer.md -->

## host layer

The JavaScript/TypeScript program or build step that prepares template [data context](#data-context) before rendering: shaping arrays for sections, computing flags for conditionals, registering safe functions, and orchestrating **code generation** workflows.

[V2](#v2) design puts control decisions here rather than in template text ([logic-less presentation](#logic-less-presentation)). The engine does not execute arbitrary JavaScript inside template strings—the host prepares values; templates project and format them.

<!-- mdcp-shard: end docs/glossary/host-layer.md -->

<!-- mdcp-shard: start docs/glossary/index-templating.md -->

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

<!-- mdcp-shard: end docs/glossary/index-templating.md -->

<!-- mdcp-shard: start docs/glossary/index-protocol.md -->

## Protocol terms

- [mdcp](#mdcp)
- [shard](#shard)

<!-- mdcp-shard: end docs/glossary/index-protocol.md -->

<!-- mdcp-shard: start docs/glossary/shard.md -->

## shard

Single-topic Markdown source file under a guide directory (`docs/features/`, `docs/client/`, etc.). Shards are the source of truth; compiled monoliths and publish outputs are generated by `mdcp compile`.

<!-- mdcp-shard: end docs/glossary/shard.md -->

<!-- mdcp-shard: start docs/glossary/mdcp.md -->

## mdcp

**MarkDown Context Protocol** — sharded documentation with compile, validation, and export for agents and CI. This repository uses mdcp for `docs/features/`, `docs/developer/`, and `docs/client/`.

<!-- mdcp-shard: end docs/glossary/mdcp.md -->

<!-- mdcp-shard: start docs/glossary/merge-engine.md -->

## mergeEngine

Classic **Recipe Programming Language (RPL)**-style templating by Jordan Henderson (original implementation in TCL). Templates treat text and data as operands—projection (`<*>`), conditionals (`<+>`), and indirection (`<##...##>`) express transformation rather than imperative programs.

This repository ports mergeEngine semantics to TypeScript with a Peggy parser and a [secure evaluator](#secure-evaluator). The **destination** keeps RPL's transformation power without a TCL-first template surface; see [V2](#v2) and [logic-less presentation](#logic-less-presentation).

<!-- mdcp-shard: end docs/glossary/merge-engine.md -->

<!-- mdcp-shard: start docs/glossary/data-context.md -->

## data context

Named values a template reads at evaluation time. The [host layer](#host-layer) prepares context before render; the core library uses `Map` keys and values. Nested objects from JSON should be converted to nested `Map` instances before evaluation.

<!-- mdcp-shard: end docs/glossary/data-context.md -->

<!-- mdcp-shard: start docs/glossary/ast.md -->

## AST

**Abstract Syntax Tree** — the canonical tree structure produced by a template parser. [Legacy syntax](#legacy-syntax) and experimental [modern syntax](#modern-syntax) grammars map to the same AST node types so one evaluator can render either surface.

<!-- mdcp-shard: end docs/glossary/ast.md -->

<!-- mdcp-shard: start docs/glossary/cross-product.md -->

## cross-product

Legacy iteration pattern: a loop walks an array and renders a sub-template for each element. Named after the original mergeEngine cross-product construct (`<*>` with `<[array]>`).

In [V2](#v2) destination design, the [host layer](#host-layer) prepares arrays and templates use section-style rendering rather than reimplementing loop control flow in template text.

<!-- mdcp-shard: end docs/glossary/cross-product.md -->

<!-- mdcp-shard: start docs/glossary/mustache-section.md -->

## Mustache section

**Proposed** V2 construct: `{} … {{/name}}` (positive) and `{{^name}} … {{/name}}` (inverted) blocks that render over host-prepared context.

When the host supplies an **array**, the engine iterates the block; when it supplies a **boolean** or truthy/falsy scalar, the block acts as conditional; inverted sections cover missing/false cases. Replaces legacy RPL iteration/branch operators and **replaces** exploratory Jinja `{% for %}` / `{% if %}` as destination syntax.

**Not shipped** as the V2 Mustache parser destination today. See [surface syntax](docs/features/language-spec/surface-syntax.md) and [logic-less presentation](#logic-less-presentation).

<!-- mdcp-shard: end docs/glossary/mustache-section.md -->

<!-- mdcp-shard: start docs/glossary/output-expression.md -->

## output expression

**Proposed** V2 and **partially shipped** experimental construct: text inside `{{ … }}` delimiters that evaluates to a value, applies optional filter pipelines, escapes, and appends to template output.

Destination surface for variable lookup, literals, filter chains (`| upper`, `| length`), and allowlisted function calls — not for imperative control flow. Control flow belongs in [Mustache sections](#mustache-section) over host-prepared context or in the [host layer](#host-layer).

**Shipped (experimental):** `parseModern` supports output expressions with dot access and filters. Function-call shape and full V2 grammar are **proposed**.

See [surface syntax](docs/features/language-spec/surface-syntax.md).

<!-- mdcp-shard: end docs/glossary/output-expression.md -->

<!-- mdcp-shard: start docs/glossary/trusted-template.md -->

## TrustedTemplate

**Status:** **Proposed** V2 host contract — not fully enforced in product code.

Explicit wrapper type for output from host functions or macros that **intentionally contains template syntax** and may be expanded (rescanned) by the evaluator. Plain string returns are treated as **data**: escaped and written without rescan.

Only developer-controlled host code may construct TrustedTemplate; untrusted user content must never be promoted. Prevents SSTI and uncontrolled m4-style blind rescan. Spec: [host layer contracts](docs/features/language-spec/host-layer-contracts.md); architecture: [ADR-002](docs/features/architecture/adr-002-mustache-js-first-code-generation.md), [V2 mathematical design §4](docs/features/architecture/v2_mathematical_design.md).

Issue input: [#21](https://github.com/betsalel-williamson/Templating-Engine/issues/21).

<!-- mdcp-shard: end docs/glossary/trusted-template.md -->

<!-- mdcp-shard: start docs/glossary/secure-evaluator.md -->

## secure evaluator

Evaluation kernel created by `createSecureEvaluator`. The function registry is frozen at creation time so templates cannot mutate host capabilities at runtime. See [secure templating](docs/features/architecture/secure_templating_guide.md).

<!-- mdcp-shard: end docs/glossary/secure-evaluator.md -->
