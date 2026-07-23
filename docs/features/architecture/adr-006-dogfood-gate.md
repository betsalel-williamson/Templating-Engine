# ADR-006: Dogfood Gate Before Broad V2 Engine TDD

- **Status**: Accepted (process and success bar); **outcome pending** pilot evidence
- **Date**: 2026-07-23
- **Related**: [V2 language specification](../language-spec/index.md), [ADR-002](./adr-002-mustache-js-first-code-generation.md), [ADR-004](./adr-004-abstract-host-invocation.md), [#96](https://github.com/betsalel-williamson/Templating-Engine/issues/96)

## Context

The paper-first V2 language specification is complete enough to judge fitness on paper. Broad engine TDD for destination surfaces (for example function registry / TrustedTemplate, filters, and related slices) is expensive. Paper completeness alone does not prove the language improves how artisan programmers **use, build, and run** this product.

We need a **dogfood gate**: prove the proposed surface is worth implementing by measuring agent work on a real in-repo build slice under controlled A/B conditions, with fail-closed QA. A **no-go** or **slim-go** outcome is valid.

This gate is **not** [docs dogfooding](../../developer/docs-dogfooding.md) (sharded docs workflow). It is a productivity and trust proof for the templating language itself.

## Decision Drivers

- Avoid months of engine work on a language we will not trust enough to adopt ourselves.
- Prefer higher abstraction (host + logic-less presentation + classical expansion) only when measurements support it.
- Fail closed: no false-green comfort from weak checks or mid-run human rescue.
- Prefer thin harness ownership: Cursor SDK first; we own task defs, treatment skill, scorers, and a thin runner.

## Considered Options

1. **Skip dogfood; start broad V2 engine TDD** — fastest to code, highest risk of building an unused surface.
2. **Toy demos / recipe-only dogfood** — weak fitness function; easy to game; not our maintenance loop.
3. **Design + thin Cursor A/B harness on this repo as consumer** — measure tokens, time, and correctness building toward V2 before broad TDD.

## Decision Outcome

**Chosen option: Design + thin Cursor A/B harness (Approach 1).**

Broad engine TDD for paused implementation issues remains **PREOP-PAUSE** until a written **go / slim-go / no-go** decision is recorded from pilot evidence (unless a minimal spike is explicitly required to run the pilot).

### §1 Consumer and non-goals

| Item | Choice |
| --- | --- |
| **Consumer** | This template system itself (legacy path = working baseline) |
| **What we measure** | Tokens, wall-clock, and correctness while agents **build toward V2** on a fixed slice |
| **Secondary later** | Recipe fixtures — not the primary dogfood consumer |
| **Out of scope** | Broad #21 / #27 / #28 (and related) before the decision; other vendor SDKs before solid Cursor evidence; editor/epics/Node engine work; treating docs-mdcp dogfooding as a substitute |

**ICP:** artisan programmers who already value codegen and can think at host/spec abstraction.

### §2 A/B arms and isolation

| Arm | Treatment |
| --- | --- |
| **A (baseline)** | Same fixed V2 build slice; freeform; **no** V2 treatment skill |
| **B (treatment)** | Same task + purpose-built Agent Skill (V2 language-spec / ADR contracts; host + logic-less + classical expansion; TrustedTemplate rules; stop when tests pass) |

**Constants:** same model, Cursor runtime, scorers, timeouts, and shared task body.

**Isolation:** parallel separate workspaces (git worktrees under `.worktrees/` and/or Cursor sandboxes). Arms must not share a dirty tree. Serial A-then-B is fallback only.

### §3 Scorers, metrics, and no-HITL

**Primary metrics** (from Cursor SDK): `result.usage` (input / output / cache / total tokens) and wall-clock duration.

**Correctness** (fail-closed, post-run in each workspace):

1. Acceptance tests for the fixed slice must pass.
2. Spec-alignment assertions (automated; not LLM-as-judge as the sole gate).
3. Optional dirty-scope allowlist guard.

**Aggregation:** only **valid** (correct) runs compare on tokens/time.

**No human-in-the-loop:** runs are start-to-stop autonomous — no mid-run approvals, clarifying questions, or manual merges. A run that receives mid-run human help is **invalid**.

### §4 Thin harness layout and treatment skill

Maintainer-owned tree (not a publishable package):

```text
evals/dogfood/
  tasks/<slice>/
    task.md
    acceptance/
  skills/<treatment-skill>/   # Arm B only
    SKILL.md
    references/
  scorers/
  runner/
```

- **Arm B skill** is authored with Anthropic `skill-creator` and Superpowers `writing-skills` (RED without skill → GREEN with skill → refactor loopholes).
- Skill body points at paper contracts under `docs/features/`; it does not dump implementation.
- Runner creates the workspace pair, injects the treatment skill only into B, enforces no-HITL permissions, scores both arms, and writes a report.
- Authoring tooling: keep `skill-creator` available under `.agents/skills/` via `skills-lock.json`.

Durable docs for this decision live here (ADR). A short developer runbook for running the harness lands with the harness implementation — not before.

### §5 Go / no-go / slim-go

| Outcome | When | Meaning |
| --- | --- | --- |
| **Go** | B valid, and B wins on tokens **or** wall-clock while the other metric is not worse beyond the noise band, with no correctness regression vs A | Broad V2 engine TDD is justified |
| **Slim-go** | B valid but gains are mixed/narrow, or a thinner skill/contract set is required to stay competitive | Reduced V2 surface or one focused TDD slice; re-dogfood before widening |
| **No-go** | A valid and B invalid; or both valid and B worse on tokens **and** time; or repeated B failures after task/skill fixes | Do not open broad engine TDD; keep legacy; park or rewrite the paper language |

### Hard rules

1. Both invalid → no language decision; fix task, acceptance, or harness; re-run.
2. Invalid B + valid A → against the hypothesis (leans no-go or slim-go with a written “skill/contracts not enough” rationale).
3. No-HITL violations → run invalid; do not count.
4. Record the decision on [#96](https://github.com/betsalel-williamson/Templating-Engine/issues/96) with run ids, usage, durations, correctness logs, and which outcome row applied.

**Noise band (default):** ≤10% difference on a single metric is a tie unless the other metric clearly favors one arm.

## Consequences

### Positive

- Fitness function between paper completeness and TDD spend.
- Fail-closed QA and no-HITL reduce green-but-wrong comfort.
- Thin ownership: Cursor SDK + task/skill/scorers/runner only.

### Trade-offs

- Pilot cost before engine velocity.
- Autonomous runs constrain task design (permissions, stop conditions, non-interactive tools).
- Single-slice evidence may force slim-go rather than a sweeping language bet.

## Related documents

- [V2 language specification index](../language-spec/index.md)
- [Overview and non-goals](../language-spec/overview-and-non-goals.md)
- [Host layer contracts](../language-spec/host-layer-contracts.md)
- [Evaluation, security, and diagnostics](../language-spec/evaluation-security-diagnostics.md)
- [Docs dogfooding](../../developer/docs-dogfooding.md) (distinct workflow — not this gate)
- Tracker: [#96](https://github.com/betsalel-williamson/Templating-Engine/issues/96)
