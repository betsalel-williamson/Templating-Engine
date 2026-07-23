# Dogfood gate harness

Maintainer workflow for the language dogfood gate ([ADR-006](../features/architecture/adr-006-dogfood-gate.md)). This is **not** [docs dogfooding](./docs-dogfooding.md).

## Prerequisites

- Node >= 24 via nvm / login shell
- `CURSOR_API_KEY` with SDK access
- Repo dependencies installed (`pnpm install`)

## Commands

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

## Reading results

Reports land in `evals/dogfood/reports/<runId>.json` (gitignored). Each arm includes outcome correctness, **process-check results** (Arm B skill injection and contract engagement when observability is available), and usage/duration. Runs with **no-HITL** violations or failed process checks when observable are invalid and do not count toward go / slim-go / no-go.

Record the outcome on GitHub issue #96 with run ids, usage, durations, correctness details, process-check results, and the `outcome` field — use the comment template in [`evals/dogfood/README.md`](../../evals/dogfood/README.md#post-decision-on-96). Harness readiness (pre-pilot) is summarized in [`evals/dogfood/READINESS.md`](../../evals/dogfood/READINESS.md).

## Preflight

1. Run the pre-A/B skill mini-eval under `evals/dogfood/skills/v2-engine-build/eval/` (ADR-006 §4) before timed pairs — see that directory’s `README.md`.
2. `pnpm dogfood:test` must pass.
3. Broken harness / both-invalid → fix infra; do **not** record language no-go.
