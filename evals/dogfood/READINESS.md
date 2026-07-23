# Dogfood gate readiness report (#96)

**Date:** 2026-07-23 (closure)  
**PRs:** [#103](https://github.com/betsalel-williamson/Templating-Engine/pull/103) (engine harness), [#104](https://github.com/betsalel-williamson/Templating-Engine/pull/104) (app experiment + ADR-007)  
**ADRs:** [ADR-006](../../docs/features/architecture/adr-006-dogfood-gate.md), [ADR-007](../../docs/features/architecture/adr-007-shelve-v2-agent-codegen.md)

## Verdict (issue #96 closure)

| Question                                             | Answer                                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------------------ |
| Design locked (§1–§5)?                               | **Yes** — ADR-006 accepted                                               |
| Harness + scorers + pilot task + Arm B skill landed? | **Yes** — PR #103                                                        |
| Unit / package tests green?                          | **Yes** — `pnpm dogfood:test` → 36/36 (PR #104)                          |
| Live A/B pilot complete?                             | **Yes** — `pilot-2026-07-23-b775` (engine gate)                          |
| Follow-up app codegen pilot?                         | **Yes** — `calc-ts-codegen-pilot-b775` (PR #104)                         |
| Written go / slim-go / no-go on #96?                 | **Ready to post** — see paste block below                                |
| Roadmap decision?                                    | **ADR-007 accepted** — shelve V2 destination + template-as-agent-codegen |

**Bottom line:** Two valid no-go pairs. Treatment skills produced correct artifacts but at higher token cost and duration than plain TypeScript. Per ADR-007, broad V2 engine TDD and template meta-language as agent authoring surface are shelved; legacy product, MDCP docs, and dogfood harnesses continue.

## Pilot 1 — engine gate `pilot-2026-07-23-b775`

| Field        | Value                                              |
| ------------ | -------------------------------------------------- |
| Task         | `v2-trusted-template-gate`                         |
| Treatment    | `v2-engine-build` skill                            |
| Model        | `composer-2`                                       |
| Arm A run id | `run-73aa65c3-1a70-4d52-9b78-5496dfb4a655`         |
| Arm B run id | `run-01fb1c06-2d28-4144-bf92-c05a03690602`         |
| Arm A        | valid=**true** tokens=2,993,819 durationMs=111,329 |
| Arm B        | valid=**true** tokens=3,938,093 durationMs=142,263 |
| Outcome      | **no-go**                                          |
| Rationale    | B worse on both tokens and duration.               |

### Harness note

First scoring pass was **inconclusive** (both arms invalid) because `runAcceptance` pointed at the main-repo acceptance path instead of the worktree copy. Fixed in `correctness.mjs`; rescored against kept worktrees.

## Pilot 2 — app codegen `calc-ts-codegen-pilot-b775`

| Field        | Value                                               |
| ------------ | --------------------------------------------------- |
| Task         | `calculator-cli`                                    |
| Treatment    | `legacy-template-codegen` (build-time TS expansion) |
| Model        | `composer-2`                                        |
| Arm A run id | `run-b8f02538-20bd-4f1b-b6e4-542aff869580`          |
| Arm B run id | `run-ce7c7468-b3f0-4510-a275-a5ad01c139f9`          |
| Arm A        | valid=**true** tokens=486,745 durationMs=45,314     |
| Arm B        | valid=**true** tokens=4,668,015 durationMs=195,294  |
| Outcome      | **no-go**                                           |
| Rationale    | B worse on both tokens and duration (~9.6× tokens). |

Arm B produced `templates/*.template` → `scripts/codegen.mjs` → `src/generated/*.ts` with all acceptance tests passing; compact template source did not translate to lower SDK spend.

## Issue #96 acceptance checklist

- [x] Dogfood consumer(s) and non-goals — ADR-006 (consumer = this template system)
- [x] Meaningful QA criteria — fail-closed correctness + process checks; ≤10% noise band
- [x] Pilot executed — two valid pairs (engine + app codegen)
- [x] Written **no-go** with rationale — below + ADR-007

## Paste onto GitHub issue #96

Post this comment, then **close #96** with reason _completed_ (outcome: no-go; ADR-007 supersedes broad TDD).

```markdown
## Dogfood decision — **no-go** (ADR-006 + ADR-007)

**PRs:** https://github.com/betsalel-williamson/Templating-Engine/pull/103 · https://github.com/betsalel-williamson/Templating-Engine/pull/104  
**ADRs:** `docs/features/architecture/adr-006-dogfood-gate.md` · `docs/features/architecture/adr-007-shelve-v2-agent-codegen.md`  
**Report shard:** `evals/dogfood/READINESS.md`

### Acceptance checklist

- [x] Dogfood consumer(s) and non-goals — ADR-006 (consumer = this template system; PREOP-PAUSE on broad engine TDD)
- [x] Meaningful QA criteria — fail-closed acceptance + spec-alignment + dirty-scope; process checks; no mid-run HITL
- [x] Pilot executed — two valid A/B pairs (engine gate + app codegen follow-up)
- [x] Written **no-go** with rationale — this comment

### Pilot 1 — engine gate `pilot-2026-07-23-b775`

- Task: `v2-trusted-template-gate`
- Treatment: `v2-engine-build` skill
- Model: `composer-2`
- Arm A: valid=true tokens=2993819 durationMs=111329 runId=run-73aa65c3-1a70-4d52-9b78-5496dfb4a655
- Arm B: valid=true tokens=3938093 durationMs=142263 runId=run-01fb1c06-2d28-4144-bf92-c05a03690602
- Outcome: **no-go** — B worse on both tokens and duration; both implemented TrustedTemplate correctly.

Harness note: first scoring pass was inconclusive (acceptance path bug in worktrees). Fixed in `correctness.mjs`; rescored to valid pair above.

### Pilot 2 — app codegen `calc-ts-codegen-pilot-b775`

Follow-up experiment: does **legacy template meta-language** (build-time expansion into TypeScript) help agents build a real CLI vs plain TS?

- Task: `calculator-cli`
- Treatment: `legacy-template-codegen` skill (`templates/*.template` → `scripts/codegen.mjs` → `src/generated/*.ts`)
- Model: `composer-2`
- Arm A: valid=true tokens=486745 durationMs=45314 runId=run-b8f02538-20bd-4f1b-b6e4-542aff869580
- Arm B: valid=true tokens=4668015 durationMs=195294 runId=run-ce7c7468-b3f0-4510-a275-a5ad01c139f9
- Outcome: **no-go** — B ~9.6× tokens and ~4.3× duration; both passed acceptance.

### Roadmap decision (ADR-007)

**Shelved:** V2 destination parser/evaluator TDD (#21 / #27 / #28 and related); template meta-language as primary agent authoring surface.

**Continues:** Legacy shipped product (`parseLegacy`, CLI); MDCP docs; test/dogfood harnesses; V2 paper spec as archived reference only.

**Agentic default:** native TypeScript + task specs + acceptance tests + docs — not compact template codegen.

PREOP-PAUSE issues remain paused unless a future, larger dogfood slice produces go/slim-go evidence (see ADR-007 revisit criteria).

### Next steps

- Merge PR #103 (harness) and PR #104 (app experiment + ADR-007).
- Close this issue as **completed** (outcome: no-go).
```
