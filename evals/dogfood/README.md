# Dogfood gate evals

Harness for the language dogfood gate ([ADR-006](../../docs/features/architecture/adr-006-dogfood-gate.md)). Full maintainer runbook: [`docs/developer/dogfood-gate.md`](../../docs/developer/dogfood-gate.md).

## Pilot run (issue #96)

**Before posting a decision:** reopen [#96](https://github.com/betsalel-williamson/Templating-Engine/issues/96) if it is still closed (it was incorrectly closed by unrelated PRs #100/#101).

### Preflight

1. Complete the pre-A/B skill mini-eval: [`skills/v2-engine-build/eval/README.md`](skills/v2-engine-build/eval/README.md).
2. `bash -lc 'pnpm dogfood:test'` must pass.
3. Export `CURSOR_API_KEY` with SDK access.

### Run the A/B pair

```bash
bash -lc 'cd /workspace && DOGFOOD_KEEP_WORKTREES=1 pnpm dogfood:run'
```

Report JSON: `evals/dogfood/reports/<runId>.json` (gitignored).

### Post decision on #96

Paste the decision comment from the Task 10 report (`.superpowers/sdd/task-10-report.md` on the harness branch), filling placeholders from the report JSON. If both arms are invalid due to harness bugs, fix infra (Tasks 4–8) and re-run — do **not** record a language no-go.
