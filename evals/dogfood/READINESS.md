# Dogfood gate readiness report (#96)

**Date:** 2026-07-23 (updated after live pilot)  
**Branch / PR:** [`cursor/dogfood-gate-design-1558`](https://github.com/betsalel-williamson/Templating-Engine/pull/103)  
**Agent runs:** https://cursor.com/agents/bc-09d65cc5-8630-4d0b-90d8-39dd0de51558 (harness), continuation agent (pilot)  
**ADR:** [ADR-006](../../docs/features/architecture/adr-006-dogfood-gate.md)

## Verdict (demo checkpoint)

| Question                                             | Answer                                                                 |
| ---------------------------------------------------- | ---------------------------------------------------------------------- |
| Design locked (§1–§5)?                               | **Yes** — ADR-006 accepted                                             |
| Harness + scorers + pilot task + Arm B skill landed? | **Yes** — on this PR                                                   |
| Unit / package tests green?                          | **Yes** — `pnpm dogfood:test` → 32/32                                  |
| Fail-closed without API key?                         | **Yes** — `pnpm dogfood:run` exits 1 with `CURSOR_API_KEY is required` |
| Live A/B pilot complete?                             | **Yes** — run `pilot-2026-07-23-b775` (rescored after harness fix)     |
| Written go / slim-go / no-go on #96?                 | **Ready to post** — see decision below                                 |
| Ready to **move forward** to pilot?                  | **Done**                                                               |
| Ready to **stop / decide language**?                 | **Yes** — **no-go** on treatment skill advantage (valid pair)          |

**Bottom line:** The dogfood gate ran end-to-end. After fixing an acceptance-path harness bug, both arms produced valid TrustedTemplate implementations; Arm A (no skill) beat Arm B (with `v2-engine-build`) on tokens and duration → **no-go** on the treatment hypothesis for this slice.

## Pilot run `pilot-2026-07-23-b775`

| Field        | Value                                              |
| ------------ | -------------------------------------------------- |
| Task         | `v2-trusted-template-gate`                         |
| Model        | `composer-2`                                       |
| Arm A run id | `run-73aa65c3-1a70-4d52-9b78-5496dfb4a655`         |
| Arm B run id | `run-01fb1c06-2d28-4144-bf92-c05a03690602`         |
| Arm A        | valid=**true** tokens=2,993,819 durationMs=111,329 |
| Arm B        | valid=**true** tokens=3,938,093 durationMs=142,263 |
| Outcome      | **no-go**                                          |
| Rationale    | B worse on both tokens and duration.               |

### Harness note

The first scoring pass reported **inconclusive** (both arms invalid) because `runAcceptance` pointed at the main-repo acceptance path instead of the worktree copy — vitest found no test files. Fixed in `correctness.mjs` (resolve `acceptanceDir` under `worktreeRoot`). Rescored against kept worktrees; both arms pass acceptance, spec-alignment, and dirty-scope.

### Process checks

| Arm | skillInjected | contractsEngaged | valid process |
| --- | ------------- | ---------------- | ------------- |
| A   | false         | true             | pass          |
| B   | true          | true             | pass          |

## What shipped (evidence)

1. **ADR-006** — consumer = this repo; A/B isolation; Cursor SDK metrics; no mid-run HITL; process checks; go / slim-go / no-go + ≤10% noise band; both-invalid → inconclusive.
2. **`evals/dogfood/`** (`@bwilliamson/dogfood-evals`) — usage / correctness / process / decide scorers; worktree pair runner; TrustedTemplate gate task; Arm B skill `v2-engine-build` + mini-eval pack.
3. **Isolation fixes** — Arm A strips tracked treatment skill; process scoring; frozen `pnpm install` in worktrees; cancelled SDK runs invalid.
4. **Hook / CI gap** — lint-staged covers `evals/**`; husky pre-push `format:check`.
5. **Runbook** — [`docs/developer/dogfood-gate.md`](../../docs/developer/dogfood-gate.md); decision template in [`README.md`](./README.md).

## Verification snapshot (latest agent turn)

```text
pnpm dogfood:test  →  Test Files 7 passed; Tests 32 passed
pnpm dogfood:run   →  pilot-2026-07-23-b775 (inconclusive raw → no-go after harness fix)
```

## Paste onto GitHub issue #96

```markdown
## Dogfood decision (ADR-006) — pilot complete

**PR:** https://github.com/betsalel-williamson/Templating-Engine/pull/103  
**Report shard:** `evals/dogfood/READINESS.md`

### Pilot `pilot-2026-07-23-b775`

- Task: `v2-trusted-template-gate`
- Model: `composer-2`
- Arm A: valid=true tokens=2993819 durationMs=111329 runId=run-73aa65c3-1a70-4d52-9b78-5496dfb4a655
- Arm B: valid=true tokens=3938093 durationMs=142263 runId=run-01fb1c06-2d28-4144-bf92-c05a03690602
- Outcome: **no-go**
- Rationale: B worse on both tokens and duration. Both arms implemented TrustedTemplate correctly; treatment skill did not improve efficiency on this slice.

### Harness fix (same PR)

First scoring pass was inconclusive (acceptance path bug). Fixed `correctness.mjs` to resolve acceptance tests in the worktree; rescored to valid pair above.

### Next steps

- Merge PR #103 (design + harness).
- Per ADR-006 PREOP-PAUSE: revisit broad V2 engine TDD only after maintainer accepts this no-go or chooses slim-go follow-up experiments.
```
