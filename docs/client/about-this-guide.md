# About this guide

**Persona:** Advanced coder comfortable with meta-programming and template languages — especially JavaScript/TypeScript hosts that prepare [data context](../glossary/data-context.md) before render.

**Scope:** How to install, render templates with the CLI or core library, and integrate the [secure evaluator](../glossary/secure-evaluator.md). Design rationale and maintainer workflows live in [features](../features/index.md) and [developer](../developer/index.md).

**Shipped today:** [Legacy syntax](../glossary/legacy-syntax.md) (`<#name#>`, `<~ ... ~>`, etc.) — stable and used by the CLI. The core library also exposes `parseModern` for an **experimental** [modern syntax](../glossary/modern-syntax.md) surface; it is library-only, incomplete, and not the long-term destination.

**Direction (not fully shipped):** Active design targets **Mustache logic-less presentation** with a **JavaScript/TypeScript-first host layer** for code generation workloads (SQL, configs, reports, batch artifacts). Normative decision: [ADR-002](../features/architecture/adr-002-mustache-js-first-code-generation.md). Goals and operator mapping: [V2 design goals](../features/architecture/v2_design_goals.md).
