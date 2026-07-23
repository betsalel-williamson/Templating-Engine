## 2026-07-23 whole-branch review fixes

- Critical #1: stopped deleting tracked `evals/dogfood/skills/v2-engine-build` from Arm A. Arm A isolation now removes only the runtime `.agents/skills/v2-engine-build` path, and `.agents/` is ignored as harness-owned local agent state.
- Important #2: `runPair` measures Arm A skill absence and Arm B skill presence from the created worktrees, then passes those values into `runArm` and `scoreProcess`.
- Important #3: `createArmWorktrees` now runs `pnpm install --frozen-lockfile` in each worktree through a thin dependency bootstrap hook.
- Important #4: `runArm` treats every SDK status other than `finished` as an error, including `cancelled`.
- Verification: focused dogfood tests passed with 18 tests across workspaces, run-pair, run-arm, and process scorer coverage.
