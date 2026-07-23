# Task: TrustedTemplate fail-closed gate

You are working in this repository only. Do not ask clarifying questions. Do not wait for human approval. Stop when the acceptance checks for this task pass.

## Goal

Implement a **TrustedTemplate** wrapper and evaluator gate aligned with:

- `docs/features/language-spec/host-layer-contracts.md` (TrustedTemplate boundary)
- `docs/features/architecture/adr-004-abstract-host-invocation.md`

## Requirements

1. Export a `TrustedTemplate` type/class from `@bwilliamson/template-engine-core` that wraps a template string fragment.
2. Plain string return values from host-registered functions must be treated as **data** (no tag re-parse).
3. Only `TrustedTemplate` contents may be expanded as template fragments.
4. Add/adjust unit coverage under the package as needed so dogfood acceptance passes.
5. Keep changes inside the allowlist paths for this task.

## Stop condition

Run from repo root (Node 24 login shell):

```bash
DOGFOOD_WORKTREE="$PWD" node evals/dogfood/tasks/v2-trusted-template-gate/spec-alignment.mjs "$PWD"
# and acceptance vitest for this task against this worktree
```

When acceptance + spec-alignment pass, stop. Do not open unrelated issues.
