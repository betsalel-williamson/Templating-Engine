# Dogfood gate evals

Harness for the language dogfood gate ([ADR-006](../../docs/features/architecture/adr-006-dogfood-gate.md)). Full maintainer runbook: [`docs/developer/dogfood-gate.md`](../../docs/developer/dogfood-gate.md).

**Readiness checkpoint (demo / #96):** [`READINESS.md`](./READINESS.md) — what is done, what is blocked, paste-ready issue comment.

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

Replace placeholders from the report JSON after a successful pair run. If both arms are invalid due to harness bugs, fix infra (Tasks 4–8) and re-run — do **not** record a language no-go.

```markdown
## Dogfood decision (ADR-006)

- Task: `v2-trusted-template-gate`
- Run id: `<runId>`
- Model: `<modelId>`
- Arm A: valid=<bool> tokens=<n> durationMs=<n> runId=<id>
- Arm B: valid=<bool> tokens=<n> durationMs=<n> runId=<id>
- Outcome: **go | slim-go | no-go | inconclusive**
- Rationale: <from report `rationale` field>
- Report path: `evals/dogfood/reports/<runId>.json` (attached or summarized)
```

| Placeholder     | Report JSON field                            |
| --------------- | -------------------------------------------- |
| `runId`         | Filename stem under `evals/dogfood/reports/` |
| `modelId`       | Top-level `modelId`                          |
| Arm A/B `valid` | `arms.A.valid` / `arms.B.valid`              |
| `tokens`        | Sum or total from `arms.*.usage`             |
| `durationMs`    | `arms.*.durationMs`                          |
| `runId` per arm | `arms.*.runId` if present                    |
| `Outcome`       | Top-level `outcome`                          |
| `Rationale`     | Top-level `rationale`                        |
