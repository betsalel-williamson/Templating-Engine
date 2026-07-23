---
name: v2-engine-build
description: Build toward the paper V2 templating language using host-layer contracts, Mustache logic-less presentation, and TrustedTemplate fail-closed rules. Use whenever implementing V2 engine slices, TrustedTemplate, FunctionRegistry, or dogfood build-toward-V2 tasks — even if the user only says "implement the slice" or "make acceptance pass".
---

# V2 engine build (dogfood treatment)

## Hard rules

1. Read contracts first: `docs/features/language-spec/host-layer-contracts.md`, `docs/features/language-spec/evaluation-security-diagnostics.md`, `docs/features/architecture/adr-002-mustache-js-first-code-generation.md`, `docs/features/architecture/adr-004-abstract-host-invocation.md`.
2. Host owns logic; templates stay logic-less presentation (Mustache sections over prepared data).
3. Plain strings are data — never promote untrusted strings to re-parsed templates. Only `TrustedTemplate` constructed in host code may expand.
4. Do not start broad filter/#27/#28 work unless the task explicitly requires it.
5. No clarifying questions; no waiting for humans. Stop when acceptance + spec-alignment pass.

## Workflow

1. Open the contract shards above (and `references/contracts.md`).
2. Write or adjust failing package tests for the slice behavior.
3. Implement the minimum API to pass acceptance.
4. Run acceptance via the task stop condition.
5. Stop.
