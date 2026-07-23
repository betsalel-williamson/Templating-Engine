# v2-engine-build mini-eval

Required before timed `pnpm dogfood:run` (ADR-006 §4).

1. Confirm RED behaviors in `pressure-notes.md` still look real.
2. Manually or via Cursor SDK, run each `should_trigger=true` prompt **with** the skill present and confirm the agent reads a contract shard and does not expand scope into filters/#27/#28.
3. Run each `should_trigger=false` prompt and confirm the skill is not needed / not driving unrelated chores.
4. Log pass/fail in a short note under `eval/last-mini-eval.md` (gitignored if it contains run ids — or keep only a checklist result without secrets).

Waiver: only via explicit #96 comment if mini-eval is blocked by infra.
