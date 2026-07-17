# ADR-001: Adopting Pkl for Future Work

- **Status**: Superseded
- **Superseded by**: ADR-002 — Mustache logic-less + JS/TS-first template language (forthcoming; tracked in issue #76)
- **Date**: 2025-06-25

> **Supersession:** This ADR is **fully dropped**. Pkl is **not** a recommended path for configuration, templating, or anything else in this project. Early exploration found Pkl helpful for templates/configs; the current north star is **code generation** with Mustache logic-less presentation and a JS/TS-first host layer. Active development continues on this TypeScript templating engine. ADR-002 will record the superseding decision.

## Historical context (archived)

This project began as a port of classic `mergeEngine` (TCL) templating to TypeScript, with a goal of feature parity and then a more modern syntax. While exploring alternatives (`m4`, `ninja`, Django templates, and others), Apple’s [Pkl](https://pkl-lang.org/) was evaluated as a configuration-oriented language that covered much of `mergeEngine`’s indirection power with a stronger type system and tooling.

At that time, the chosen outcome was to adopt Pkl and halt feature work on `template-engine-ts`. A proof-of-concept compared recipe migrations and ranked Pkl favorably on readability, safety, expressiveness, debugging, and ecosystem.

That decision and its follow-on plan (deprecate this engine, migrate consumers to Pkl) are **obsolete**. Do not treat the historical PoC analysis below as current guidance.

## Historical proof-of-concept summary

The PoC compared Pkl and `mergeEngine` implementations of the same recipes. At the time, Pkl scored better on readability, static typing, general expressiveness, diagnostics, and ecosystem tooling. That comparison informed the original (now superseded) adoption decision only.
