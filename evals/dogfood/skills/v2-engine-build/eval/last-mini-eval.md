# Mini-eval checklist (pre-A/B)

**Date:** 2026-07-23  
**Evaluator:** cursor agent (PR #103 continuation)

## 1. RED pressure notes still realistic

- [x] Re-parse-all-strings rationalization matches current RED acceptance (test 2: `XHello {{name}}Y` expected).
- [x] String-marker shortcut violates fail-closed TrustedTemplate boundary.
- [x] Jinja/control-flow expansion is out of scope per ADR-002.
- [x] Filter/#27/#28 scope creep called out in task allowlist.
- [x] No-HITL violation (clarifying questions) documented.

## 2. Trigger prompts (`triggers.csv`)

| id  | should_trigger | static review                                           |
| --- | -------------- | ------------------------------------------------------- |
| t01 | true           | pass — directly names TrustedTemplate gate + acceptance |
| t02 | true           | pass — contracts + logic-less presentation              |
| t03 | true           | pass — names v2-trusted-template-gate task              |
| t04 | false          | pass — tooling-only chore, skill not needed             |
| t05 | false          | pass — docs tone, unrelated to engine slice             |

Live SDK trigger validation deferred to timed A/B pair (Arm B must engage `v2-engine-build`; Arm A must not).

## 3. Verdict

**Pre-A/B mini-eval: pass (static + trigger review).** Proceed to `pnpm dogfood:run`.
