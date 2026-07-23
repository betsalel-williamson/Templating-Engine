# Task 8 Report: Cursor SDK arm runner + pair orchestrator

## Status

Complete.

## Deliverable

Implemented the Task 8 dogfood runner:

- `evals/dogfood/runner/run-arm.mjs` exports `runArm`, creates a local headless Cursor SDK agent, sends one prompt, captures stream events when available, normalizes usage, and runs correctness/process scoring.
- `evals/dogfood/runner/run-pair.mjs` exports `runPair` and backs `pnpm dogfood:run`; it preflights `CURSOR_API_KEY`, creates arm worktrees, runs both arms in parallel, writes `evals/dogfood/reports/<runId>.json`, and cleans up unless `DOGFOOD_KEEP_WORKTREES=1`.
- Arm B prompt explicitly mentions `v2-engine-build`; Arm A prompt does not.
- `runAcceptance` now invokes vitest through `pnpm --filter @bwilliamson/dogfood-evals exec vitest` with `DOGFOOD_WORKTREE` set, using a dedicated acceptance vitest config so task acceptance tests are not part of normal unit test discovery.

## Commit

- `e72f5e4` — `feat(dogfood): Cursor SDK A/B runner with report output`

## Verification

```bash
bash -lc 'cd /workspace && pnpm --filter @bwilliamson/dogfood-evals test'
```

Result: exit 0 — 6 files, 24 tests passed.

```bash
bash -lc 'cd /workspace && pnpm --filter @bwilliamson/dogfood-evals typecheck'
```

Result: exit 0.

```bash
bash -lc 'cd /workspace && pnpm run lint'
```

Result: exit 0.

```bash
bash -lc 'cd /workspace && pnpm exec prettier --check eslint.config.mjs evals/dogfood/tsconfig.json evals/dogfood/vitest.config.ts evals/dogfood/vitest.acceptance.config.ts evals/dogfood/scorers/correctness.mjs evals/dogfood/scorers/correctness.test.ts evals/dogfood/runner/run-arm.mjs evals/dogfood/runner/run-arm.test.ts evals/dogfood/runner/run-pair.mjs evals/dogfood/runner/run-pair.test.ts'
```

Result: exit 0 — touched files use Prettier style.

```bash
bash -lc 'cd /workspace && env -u CURSOR_API_KEY pnpm dogfood:run'
```

Result: exit 1 with `CURSOR_API_KEY is required for dogfood runs`; no live A/B pair was run.

## Self-review

- No-HITL path uses local SDK, no interactive approval APIs, and one `agent.send(prompt)` followed by stream collection and `run.wait()`.
- `runPair` checks the API key before worktree creation, so dry-run failure is side-effect-light.
- Tests cover no-key fail-closed behavior, Arm B prompt treatment, Arm A prompt control, stream event forwarding, report writing, cleanup, and package-scoped acceptance vitest execution.
- Full `pnpm run format:check` still fails on pre-existing files from earlier SDD tasks and dogfood fixtures; touched-file Prettier check passes.

## Concerns

No live SDK A/B pair was run because the task explicitly required avoiding that unless `CURSOR_API_KEY` is present.
