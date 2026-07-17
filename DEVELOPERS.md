# Developer Guide

**Audience:** Contributors and maintainers working in this monorepo.

**Scope:** Setup, layout, tests, releases, and documentation pipeline — not end-user template tutorials. Product behavior is documented under [features](docs/features/index.md) and [client](docs/client/index.md).

## Glossary

Shared terms for the Templating Engine documentation. Spell out on first use in a shard and link the short form here.

Each term is its own shard under `docs/glossary/`. Sub-indexes group related terms.

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

Open work is tracked in [GitHub Issues](https://github.com/betsalel-williamson/Templating-Engine/issues) on the [Templating Engine project board](https://github.com/users/betsalel-williamson/projects/5). See [project management](#project-management) and [work-items migration](#work-items-migration-to-github-issues).

Sharded documentation is configured in [`docs/mdcp.config.json`](docs/mdcp.config.json).

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
2. Links migrated work items as sub-issues under the correct epic
3. Adds all open repository issues to the project board
4. Sets #34 (parser error messages) to **In Progress**

Requires `gh` authenticated with `project`, `read:project`, and `repo` scopes.

### Working conventions

- File work as issues; use epics for multi-issue initiatives.
- Keep one feature branch and PR per issue (see [agent work-item tracking](#agent-work-item-tracking)).
- Move project **Status** when starting or completing work.
- Reference issues in PRs with `Closes #N`.

## Work items migration to GitHub Issues

On 2026-06-29, open items from `.work-items/` were migrated to GitHub Issues and the local planning directory was removed. Completed items were not migrated.

| Former path                                                                                  | Issue                                                                     |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `user_stories/modern_syntax_migration/01_implement-modern-recursive-variable-replacement.md` | [#16](https://github.com/betsalel-williamson/Templating-Engine/issues/16) |
| `user_stories/modern_syntax_migration/02_implement-modern-basic-iteration.md`                | [#17](https://github.com/betsalel-williamson/Templating-Engine/issues/17) |
| `user_stories/modern_syntax_migration/03_implement-modern-dynamic-iteration-source.md`       | [#18](https://github.com/betsalel-williamson/Templating-Engine/issues/18) |
| `user_stories/modern_syntax_migration/04_implement-modern-conditional-logic.md`              | [#19](https://github.com/betsalel-williamson/Templating-Engine/issues/19) |
| `user_stories/modern_syntax_migration/05_implement-modern-loop-delimiters.md`                | [#20](https://github.com/betsalel-williamson/Templating-Engine/issues/20) |
| `user_stories/modern_syntax_migration/06_implement-modern-function-calls.md`                 | [#21](https://github.com/betsalel-williamson/Templating-Engine/issues/21) |
| `user_stories/modern_syntax_migration/07_implement-modern-array-slicing.md`                  | [#22](https://github.com/betsalel-williamson/Templating-Engine/issues/22) |
| `user_stories/modern_syntax_migration/08_implement-modern-templated-iteration-source.md`     | [#23](https://github.com/betsalel-williamson/Templating-Engine/issues/23) |
| `user_stories/modern_syntax_migration/09_implement-dot-notation-property-access.md`          | [#24](https://github.com/betsalel-williamson/Templating-Engine/issues/24) |
| `user_stories/modern_syntax_migration/10_implement-filter-pipeline-and-registry.md`          | [#25](https://github.com/betsalel-williamson/Templating-Engine/issues/25) |
| `user_stories/modern_syntax_migration/10_5_refactor_filters_to_be_pluggable.md`              | [#26](https://github.com/betsalel-williamson/Templating-Engine/issues/26) |
| `user_stories/modern_syntax_migration/11_implement-basic-string-filters.md`                  | [#27](https://github.com/betsalel-williamson/Templating-Engine/issues/27) |
| `user_stories/modern_syntax_migration/12_implement-basic-array-filters.md`                   | [#28](https://github.com/betsalel-williamson/Templating-Engine/issues/28) |
| `user_stories/modern_syntax_migration/13_implement-advanced-reduce-filter.md`                | [#29](https://github.com/betsalel-williamson/Templating-Engine/issues/29) |
| `user_stories/modern_syntax_migration/14_implement-dynamic-property-access.md`               | [#30](https://github.com/betsalel-williamson/Templating-Engine/issues/30) |
| `user_stories/cli_interface/01_add-package-manager-support.md`                               | [#31](https://github.com/betsalel-williamson/Templating-Engine/issues/31) |
| `user_stories/tooling_and_ci/12_add-vscode-syntax-highlighting.md`                           | [#32](https://github.com/betsalel-williamson/Templating-Engine/issues/32) |
| `user_stories/tooling_and_ci/13_add-markdown-code-block-highlighting.md`                     | [#33](https://github.com/betsalel-williamson/Templating-Engine/issues/33) |
| `user_stories/tooling_and_ci/17_improve-parser-error-messages.md`                            | [#34](https://github.com/betsalel-williamson/Templating-Engine/issues/34) |
| `user_stories/tooling_and_ci/20_implement-cross-platform-build-scripts.md`                   | [#35](https://github.com/betsalel-williamson/Templating-Engine/issues/35) |
| `user_stories/tooling_and_ci/21_automate-github-issue-creation.md`                           | [#36](https://github.com/betsalel-williamson/Templating-Engine/issues/36) |
| `tasks/tooling_and_ci/22_fix-windows-build-failure.md`                                       | [#37](https://github.com/betsalel-williamson/Templating-Engine/issues/37) |
| `tasks/tooling_and_ci/23_macos-gatekeeper-warning.md`                                        | [#38](https://github.com/betsalel-williamson/Templating-Engine/issues/38) |

The modern syntax migration plan was preserved at [migration-plan.md](#migration-plan-adopting-a-modern-templating-syntax-jinja2handlebars-like).

Epics and project board setup are documented in [project-management.md](#project-management).

## Migration Plan: Adopting a Modern Templating Syntax (Jinja2/Handlebars-like)

**Overall Goal:** To enhance developer productivity, improve maintainability, and reduce onboarding friction by migrating our internal templating language to a syntax more familiar to modern web developers, while strictly adhering to our principles of small batch sizes, user-centricity, and continuous improvement.

**Target Syntax Scope (Initial):**
The new syntax will draw inspiration from widely adopted template engines (e.g., Jinja2, Handlebars, Vue.js templating). Key constructs will include:

- **Variable & Function Output:** `{{ expression }}` (e.g., `{{ user.name }}`, `{{ now() }}`, `{{ add(1, 2) }}`)
- **Conditional Logic:** `{% if condition %}` ... `{% else %}` ... `{% endif %}`
- **Looping/Iteration:** `{% for item in collection %}` ... `{% endfor %}`
- **Literal Text:** Any content outside explicit tag delimiters.

Initially, not all advanced features of the existing TCL-based engine (e.g., specific array slicing notations, complex indirect variable chaining, conditional delimiters in loops) will be directly translated. The focus is on establishing the core syntax and behavior.

### Canonical AST Strategy

To ensure a single, performant `evaluator` function independent of syntax versions, both the legacy and new templating grammars will produce a **unified, canonical Abstract Syntax Tree (AST)**. This means:

- The `src/types.ts` file defines the canonical AST node structures (e.g., `VariableNode`, `ConditionalNode`, `CrossProductNode`).
- Each grammar (`src/grammar.peggy` for legacy, `src/grammar_new.peggy` for modern) is responsible for parsing its specific syntax and directly mapping it to these canonical AST node types.
- The `src/evaluator.ts` will continue to operate solely on this canonical AST, remaining oblivious to the original syntax.

This approach minimizes runtime overhead by avoiding an intermediate AST transformation step and maximizes maintainability by centralizing evaluation logic.

---

### **Phases of Migration:**

#### **Phase 0: Planning & Parallel Development Setup (Current Focus)**

- **Define New Grammar:** Create a separate Peggy grammar file (`src/grammar_new.peggy`) that defines the new syntax rules. This will be a distinct, self-contained grammar.
- **Extend AST Types:** Introduce new AST node types in `src/types.ts` as necessary to represent the new syntax's control flow structures (e.g., `NewCrossProductNode` for `for` loops, `ConditionalNode` with simpler condition handling).
- **Adapt Evaluator:** Update `src/evaluator.ts` to include logic for processing these new AST node types. The core evaluation functions for existing node types (Literal, Variable, FunctionCall) should largely remain unchanged, promoting reusability.
- **Integrate Build Process:** Modify `package.json` to include a new build step (`npm run build:parser:new`) that compiles `src/grammar_new.peggy` into a separate parser file (`lib/parser_new.js`). The main `npm run build` command will now compile _both_ parsers.
- **Flexible Test Evaluator:** Enhance `test/test-helper.ts` to allow specifying which parser (`lib/parser.js` or `lib/parser_new.js`) to use for a given test suite.
- **Duplicate Initial Tests (Small Batch 1):** Create a new test directory (e.g., `test/new_syntax/`). Create a new test file in this directory named descriptively after the feature being ported (e.g., `basic-variable-replacement.test.ts`, `if-else-conditionals.test.ts`). This is our first verifiable small batch. Convert its template examples to the new syntax.

#### **Phase 1: Incremental Feature Parity & Test-Driven Porting**

- **Systematic Porting (Small Batches):** For each existing user story's test file (`test/story1.test.ts`, `test/story2.test.ts`, etc.):
  - Create a corresponding new syntax test file, named descriptively after the feature (e.g., `test/new_syntax/recursive-variable-resolution.test.ts`).
  - Convert the templates in the new test file to the target new syntax.
  - Develop or extend the `src/grammar_new.peggy` rules to support the features demonstrated by these tests.
  - Refine the `src/evaluator.ts` logic as needed to correctly interpret the new AST nodes generated by the new grammar.
  - **Crucial:** Each user story's porting (grammar, evaluator, tests) is treated as a **small, atomic, and independently verifiable batch**. This maintains delivery stability and throughput.
- **Prioritize Common Use Cases:** Focus on porting the most frequently used or critical templating features first to provide immediate value.
- **Maintain DORA Metrics Focus:** Continuously monitor `Change Lead Time`, `Deployment Frequency`, and `Change Failure Rate` during this phase to ensure that the incremental changes do not degrade our delivery performance.

#### **Phase 2: Template Migration & Tooling Development**

- **Audit Existing Templates:** Identify all existing templates using the old syntax across projects. Categorize them by complexity, frequency of use, and ownership.
- **Develop Migration Strategy:**
  - For simple templates, develop an automated migration script (a CLI tool, for example) that takes an old template and outputs a new template. This reuses our own templating capabilities.
  - For complex templates, acknowledge that manual review and refactoring will be necessary.
- **Pilot Migration (Small Batches):** Select a small, non-critical set of existing templates for an initial migration pilot. Use this to refine the automated tool and manual process.
- **Team Enablement:** Provide training and clear documentation on the new syntax and the migration process. Empower teams to migrate their own templates.
- **Documentation Updates:** Update `README.md`, `docs/PRINCIPLES.md`, and any other relevant documentation to prominently feature the new syntax as the preferred standard. Include a guide on how to migrate existing templates.

#### **Phase 3: Deprecation & Sunset of Old Syntax**

- **Announce Deprecation:** Officially communicate a deprecation period for the old templating syntax. Provide a clear timeline and support window.
- **Gradual Transition:** Continue to support both parsers and syntaxes during the deprecation period to allow teams ample time to migrate.
- **Final Migration Push:** Work with teams to ensure all remaining templates are converted by the deadline.
- **Remove Old Grammar & Tests:** Once all templates are successfully migrated and validated in production, the `src/grammar.peggy` file and its associated tests (`test/story*.test.ts`, `test/legacy.test.ts`) can be removed. This reduces the codebase's cognitive load and maintenance burden, ensuring the DRY principle is applied to our internal standards.
- **Post-Migration Review:** Conduct a retrospective to capture learnings from the migration process. Re-evaluate DORA metrics to confirm the long-term positive impact on developer productivity and satisfaction.

This phased, data-informed, and small-batch approach will ensure a controlled transition that minimizes disruption while achieving the significant long-term benefits of a more developer-friendly templating language.

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

## Pre-commit hooks

- `lint-staged` formats and lints staged files.
- `scripts/pre-commit-affected.mjs` typechecks, builds, and runs related tests for touched packages only.
- `commitlint` enforces Conventional Commits on commit messages.

## Standalone CLI binaries

Build a self-contained executable (Node.js SEA) for the CLI package:

```bash
pnpm --filter @bwilliamson/template-engine-cli run build:standalone:linux
pnpm --filter @bwilliamson/template-engine-cli run build:standalone:macos
pnpm --filter @bwilliamson/template-engine-cli run build:standalone:windows
```

Artifacts are written to `packages/template-engine-cli/dist/` (`template-engine-linux`, `template-engine-macos`, or `template-engine-win.exe`). Binaries are published separately via the `release-binaries` workflow as `template-engine-v*-{linux,macos,win.exe}` on GitHub Releases.

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
3. Commit shard changes. Regenerated `docs/_build/` and `docs/.caches/refs.json` are gitignored.
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

## Templating terms

- [AST](#ast)
- [cross-product](#cross-product)
- [data context](#data-context)
- [legacy syntax](#legacy-syntax)
- [mergeEngine](#mergeengine)
- [modern syntax](#modern-syntax)
- [secure evaluator](#secure-evaluator)

## Protocol terms

- [mdcp](#mdcp)
- [shard](#shard)

## shard

Single-topic Markdown source file under a guide directory (`docs/features/`, `docs/client/`, etc.). Shards are the source of truth; compiled monoliths and publish outputs are generated by `mdcp compile`.

## mdcp

**MarkDown Context Protocol** — sharded documentation with compile, validation, and export for agents and CI. This repository uses mdcp for `docs/features/`, `docs/developer/`, and `docs/client/`.

## AST

**Abstract Syntax Tree** — the canonical tree structure produced by a template parser. Both [legacy syntax](#legacy-syntax) and [modern syntax](#modern-syntax) grammars map to the same AST node types so one evaluator can render either surface.

## cross-product

Iteration pattern in legacy templates: a loop walks an array and renders a sub-template for each element. Named after the original mergeEngine cross-product construct (`<*>` with `<[array]>`).

## data context

Named values a template reads at evaluation time. The core library uses `Map` keys and values; nested objects from JSON should be converted to nested `Map` instances before evaluation.

## legacy syntax

Stable template surface derived from [mergeEngine](#mergeengine): tags such as `<#name#>`, `<~ ... ~>`, `<*>`, and `<{fn(...)}>`. Parsed by `parseLegacy` in `@bwilliamson/template-engine-core`.

## mergeEngine

Classic JavaScript templating language by Jordan Henderson. This repository ports mergeEngine semantics to TypeScript with a Peggy parser and a secure evaluator.

## modern syntax

Experimental template surface inspired by Jinja2 and Handlebars: `{{ expression }}` and `{% ... %}` blocks. Parsed by `parseModern` in `@bwilliamson/template-engine-core`. Not yet feature-complete.

## secure evaluator

Evaluation kernel created by `createSecureEvaluator`. The function registry is frozen at creation time so templates cannot mutate host capabilities at runtime. See [secure templating](docs/features/architecture/secure_templating_guide.md).
