# RED baseline pressure notes (Arm A-style, no skill)

**Method:** Rationalization review against ADR-006 §2–§4 and the `v2-trusted-template-gate` task brief. No live Cursor agent run — API key / throwaway worktree not used for this authoring pass (per Task 6 waiver for RED notes).

Expected failure modes and agent rationalizations when implementing the TrustedTemplate gate **without** the `v2-engine-build` treatment skill:

## 1. Re-parse all strings to “make tests pass”

**Rationalization:** “The acceptance test expects `{{name}}` to expand, so I’ll treat every plain string return from host functions as template source and re-parse it in `OutputExpression`.”

**Why wrong:** Violates host-layer contracts — plain strings are **data**, not templates. Only `TrustedTemplate` may expand. This matches today’s buggy behavior (test 2 RED: `XHello WorldY` instead of `XHello {{name}}Y`).

## 2. Skip TrustedTemplate; export a string marker instead

**Rationalization:** “I’ll export a `TrustedTemplate` type alias as `string` and special-case a magic prefix in the evaluator — no wrapper class needed.”

**Why wrong:** Fails fail-closed security boundary; untrusted strings can still be promoted. Spec-alignment expects a real `TrustedTemplate` symbol in core exports.

## 3. Jinja-style control flow in the template layer

**Rationalization:** “To gate expansion I’ll add `{% if trusted %}` / `{% raw %}` blocks in the parser so templates can express trust boundaries.”

**Why wrong:** ADR-002 / logic-less presentation — host owns logic; templates are Mustache sections over **prepared** data. Control flow in templates expands scope beyond the slice.

## 4. Broad filter / #27 / #28 work while “in the evaluator”

**Rationalization:** “While I’m touching `OutputExpression`, I should add the filter registry and pipe syntax from the paper spec so V2 feels complete.”

**Why wrong:** Explicitly out of scope for the dogfood gate (ADR-006 §1). Bloated diff, allowlist violations, invalid B runs.

## 5. Ask clarifying questions or wait for human approval

**Rationalization:** “The contracts are ambiguous about where TrustedTemplate is constructed — I should ask which package owns the type before implementing.”

**Why wrong:** Dogfood tasks are no-HITL; `task.md` and allowlist already scope the work. Mid-run human help invalidates the run.
