# TrustedTemplate

**Status:** **Proposed** V2 host contract — not fully enforced in product code.

Explicit wrapper type for output from host functions or macros that **intentionally contains template syntax** and may be expanded (rescanned) by the evaluator. Plain string returns are treated as **data**: escaped and written without rescan.

Only developer-controlled host code may construct TrustedTemplate; untrusted user content must never be promoted. Prevents SSTI and uncontrolled m4-style blind rescan. Spec: [host layer contracts](../features/language-spec/host-layer-contracts.md); architecture: [ADR-002](../features/architecture/adr-002-mustache-js-first-code-generation.md), [V2 mathematical design §4](../features/architecture/v2_mathematical_design.md).

Issue input: [#21](https://github.com/betsalel-williamson/Templating-Engine/issues/21).
