# Dogfood gate readiness report (#96)

**Date:** 2026-07-23  
**Branch / PR:** [`cursor/dogfood-gate-design-1558`](https://github.com/betsalel-williamson/Templating-Engine/pull/103)  
**Agent run:** https://cursor.com/agents/bc-09d65cc5-8630-4d0b-90d8-39dd0de51558  
**ADR:** [ADR-006](../../docs/features/architecture/adr-006-dogfood-gate.md)

## Verdict (demo checkpoint)

| Question                                             | Answer                                                                 |
| ---------------------------------------------------- | ---------------------------------------------------------------------- |
| Design locked (§1–§5)?                               | **Yes** — ADR-006 accepted                                             |
| Harness + scorers + pilot task + Arm B skill landed? | **Yes** — on this PR                                                   |
| Unit / package tests green?                          | **Yes** — `pnpm dogfood:test` → 32/32                                  |
| Fail-closed without API key?                         | **Yes** — `pnpm dogfood:run` exits 1 with `CURSOR_API_KEY is required` |
| Live A/B pilot complete?                             | **No** — blocked on `CURSOR_API_KEY` in this cloud environment         |
| Written go / slim-go / no-go on #96?                 | **Not yet** — no valid pair report; decision would be premature        |
| Ready to **move forward** to pilot?                  | **Yes** — once a key with SDK access is exported                       |
| Ready to **stop / decide language**?                 | **No** — ADR-006 forbids language no-go without valid pair evidence    |

**Bottom line:** Infrastructure for the dogfood gate is ready to run. The language go/stop decision is **blocked only on credentials + one timed pair**, not on missing design or harness work.

## What shipped (evidence)

1. **ADR-006** — consumer = this repo; A/B isolation; Cursor SDK metrics; no mid-run HITL; process checks; go / slim-go / no-go + ≤10% noise band; both-invalid → inconclusive.
2. **`evals/dogfood/`** (`@bwilliamson/dogfood-evals`) — usage / correctness / process / decide scorers; worktree pair runner; TrustedTemplate gate task (intentional RED acceptance); Arm B skill `v2-engine-build` + mini-eval pack.
3. **Isolation fixes** — Arm A strips tracked treatment skill; process scoring; frozen `pnpm install` in worktrees; cancelled SDK runs invalid.
4. **Hook / CI gap** — lint-staged covers `evals/**`; husky pre-push `format:check`; pre-commit-affected format-checks prettier-covered staged files.
5. **Runbook** — [`docs/developer/dogfood-gate.md`](../../docs/developer/dogfood-gate.md); decision template in [`README.md`](./README.md).

## Verification snapshot (this agent turn)

```text
pnpm dogfood:test  →  Test Files 7 passed; Tests 32 passed
pnpm dogfood:run   →  CURSOR_API_KEY is required for dogfood runs (exit 1)
```

## Blockers to finish #96

1. **`CURSOR_API_KEY` unset** in the cloud agent environment — cannot run pre-A/B mini-eval via SDK or timed `DOGFOOD_KEEP_WORKTREES=1 pnpm dogfood:run`.
2. **GitHub issue write forbidden** for the agent token (`Resource not accessible by integration`) — cannot reopen or comment on [#96](https://github.com/betsalel-williamson/Templating-Engine/issues/96) directly. Progress is mirrored on [PR #103](https://github.com/betsalel-williamson/Templating-Engine/pull/103); paste the block below onto the issue.

## Unblock checklist (human / next agent with secrets)

1. Reopen #96 if still closed (incorrectly closed by #100/#101).
2. Export `CURSOR_API_KEY` with Cursor SDK access into the environment (or re-run the agent with that secret).
3. Complete pre-A/B mini-eval: `evals/dogfood/skills/v2-engine-build/eval/README.md`.
4. `bash -lc 'cd /workspace && DOGFOOD_KEEP_WORKTREES=1 pnpm dogfood:run'`
5. Fill and post the decision template from the report JSON (`evals/dogfood/reports/<runId>.json`).
6. Merge PR #103 when design + harness are accepted (pilot outcome can land as a follow-up comment even after merge).

## Paste onto GitHub issue #96

```markdown
## Dogfood gate readiness (2026-07-23) — not a language decision yet

**PR:** https://github.com/betsalel-williamson/Templating-Engine/pull/103  
**Agent:** https://cursor.com/agents/bc-09d65cc5-8630-4d0b-90d8-39dd0de51558  
**Report shard:** `evals/dogfood/READINESS.md`

### Status

- ADR-006 design locked; thin harness + TrustedTemplate pilot task + Arm B skill landed.
- `pnpm dogfood:test` → **32/32 pass**.
- Live A/B **not run** — `CURSOR_API_KEY` missing in cloud env; runner fail-closes correctly.
- **Outcome:** harness **ready to pilot**; language **go / slim-go / no-go deferred** (ADR-006: no language no-go without valid pair).

### Ask

1. Reopen this issue if still closed (#100/#101 were unrelated).
2. Provide `CURSOR_API_KEY` (SDK) to the next run so we can post the real decision template from `evals/dogfood/README.md`.

### Decision template (fill after pilot — leave blank until then)

- Task: `v2-trusted-template-gate`
- Run id: `<runId>`
- Model: `<modelId>`
- Arm A: valid=<bool> tokens=<n> durationMs=<n> runId=<id>
- Arm B: valid=<bool> tokens=<n> durationMs=<n> runId=<id>
- Outcome: **go | slim-go | no-go | inconclusive**
- Rationale: <from report>
```
