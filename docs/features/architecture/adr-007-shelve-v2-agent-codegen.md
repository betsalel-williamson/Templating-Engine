# ADR-007: Shelve V2 Destination Language and Template-as-Agent-Codegen

- **Status**: Accepted
- **Date**: 2026-07-23
- **Supersedes for active roadmap**: [ADR-002](./adr-002-mustache-js-first-code-generation.md) as implementation north star; closes [ADR-006](./adr-006-dogfood-gate.md) dogfood outcomes
- **Related**: [V2 language specification](../language-spec/index.md), [#96](https://github.com/betsalel-williamson/Templating-Engine/issues/96), [PR #103](https://github.com/betsalel-williamson/Templating-Engine/pull/103), [PR #104](https://github.com/betsalel-williamson/Templating-Engine/pull/104)

## Context

This repository explored a **destination V2 templating language** (Mustache logic-less presentation, host-layer contracts, paper-first specification) and whether a **compact template meta-language** helps **agentic coding** — agents authoring smaller template sources that expand into TypeScript or engine code instead of writing target code directly.

[ADR-006](./adr-006-dogfood-gate.md) established a fail-closed A/B harness to measure that bet before broad engine TDD. Two valid pilot pairs now exist:

| Experiment        | Task                       | Treatment                                                 | Outcome   | Evidence                                                                                                    |
| ----------------- | -------------------------- | --------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| Engine gate (#96) | `v2-trusted-template-gate` | `v2-engine-build` skill                                   | **no-go** | `pilot-2026-07-23-b775` — Arm A faster and lower tokens; both implemented TrustedTemplate                   |
| App codegen gate  | `calculator-cli`           | `legacy-template-codegen` skill (build-time TS expansion) | **no-go** | `calc-ts-codegen-pilot-b775` — Arm A 487k tokens / 45s vs Arm B 4.67M tokens / 195s; both passed acceptance |

Arm B **did** produce correct artifacts (including `templates/*.template` → `scripts/codegen.mjs` → `src/generated/*.ts`), but at substantially higher agent cost. Compact template **source** was smaller than hand-written TypeScript; **SDK token spend** was dominated by exploration overhead, not output bytes.

In the current agentic-coding era, a separate codegen metalanguage plus expansion pipeline did not outperform **native TypeScript with good docs and test harnesses** on these slices.

## Decision Drivers

- **Measured productivity:** Two independent no-go pairs with valid arms and fail-closed scorers.
- **Maintenance surface:** V2 engine TDD, treatment skills, and template→code pipelines add complexity without demonstrated agent leverage at small-to-medium slice size.
- **Better leverage:** MDCP shards, client/developer guides, acceptance tests, and dogfood harnesses improve agent outcomes more than introducing a compact template authoring layer.
- **Shipped product:** [Legacy syntax](../../glossary/legacy-syntax.md) remains the stable, CLI-supported surface consumers use today.

## Considered Options

1. **Continue V2 engine TDD** — implement paper spec despite dogfood no-go; high cost, no supporting evidence.
2. **Slim-go: legacy-only agent codegen** — keep template expansion for agents but shelve V2 destination; still pays template+codegen tax; pilots already no-go on legacy TS expansion.
3. **Shelve V2 destination and template-as-agent-codegen; invest in docs + harnesses** — maintain legacy product; archive V2 as design reference; prefer plain code for agent tasks unless a future, larger-scale experiment reverses the decision.

## Decision Outcome

**Chosen option: Shelve V2 destination language implementation and template-as-agent-codegen for the agentic-coding roadmap.**

### Shelved (active work stops)

- Broad **V2 destination parser/evaluator TDD** (issues paused under ADR-006 PREOP-PAUSE, including #21 / #27 / #28 and related engine slices).
- **Template meta-language as the primary agent authoring surface** (compact `.template` sources that expand into application or engine TypeScript).
- **Treatment skills whose value proposition is “write templates instead of TS.”**

### Continues (in scope)

- **Legacy templating engine** — `parseLegacy`, CLI, core library, security model, recipes as **consumer-facing** codegen (humans/tools render SQL/config from data), not as agent metalanguage.
- **Documentation** — MDCP shards, client guide, developer guide, glossary.
- **Test and eval harnesses** — unit tests, acceptance tests, `evals/dogfood/` as a **maintained measurement tool** (not a mandate to adopt templates).
- **Paper V2 specification** — retained as **archived design reference** (see [language spec index](../language-spec/index.md)); not a commitment to implement.

### Agentic development default

For in-repo agent tasks: **author native TypeScript (or the task’s host language) directly**, with:

- Clear task specs and allowlists
- Black-box acceptance tests
- Pointers to client/feature shards — not an intermediate template metalanguage

## Consequences

### Positive

- Roadmap honesty: effort shifts to docs, tests, and the shipped legacy surface.
- Avoids multi-month V2 engine work without adoption evidence.
- Dogfood harness remains for **future** experiments if a larger or different slice might change the conclusion.

### Negative

- V2 destination and ADR-002 north-star implementation path are set aside; exploratory `parseModern` stays experimental, not promoted.
- Personal/research interest in the template language does not translate to active product investment at this time.

### Revisit criteria (not scheduled)

Re-open only with **new valid dogfood evidence** (go or slim-go) on a **materially larger** slice — for example a multi-module service or substantial boilerplate table — where template source size and agent tokens both favor treatment. Until then, default remains native code plus docs/harnesses.

## Evidence pointers

| Run id                       | Report (gitignored locally)                             | Branch / PR |
| ---------------------------- | ------------------------------------------------------- | ----------- |
| `pilot-2026-07-23-b775`      | `evals/dogfood/reports/pilot-2026-07-23-b775.json`      | PR #103     |
| `calc-ts-codegen-pilot-b775` | `evals/dogfood/reports/calc-ts-codegen-pilot-b775.json` | PR #104     |

Record closure on [#96](https://github.com/betsalel-williamson/Templating-Engine/issues/96): **no-go** on V2 engine gate; **ADR-007** supersedes broad TDD.

## Related documents

- [ADR-006: Dogfood gate](./adr-006-dogfood-gate.md) — process used; outcomes recorded here
- [ADR-002](./adr-002-mustache-js-first-code-generation.md) — historical north star; shelved for implementation
- [V2 language specification](../language-spec/index.md) — archived reference
- [Dogfood gate runbook](../../developer/dogfood-gate.md)
- [App codegen experiment README](../../../evals/dogfood/README.md#app-codegen-pilot-calculator-cli)
