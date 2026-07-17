# logic-less presentation

Template design principle inspired by [Mustache](https://mustache.github.io/): template text **renders prepared data**; branching, iteration, aggregation, and side effects belong in the [host layer](./host-layer.md) (JavaScript/TypeScript) that builds [data context](./data-context.md) before render.

Destination for [V2](./v2.md)—not fully expressed in any single shipped syntax surface yet. Exploratory `{% if %}` / `{% for %}` blocks in [modern syntax](./modern-syntax.md) are implementation in flux, not normative direction. See [V2 design goals](../features/architecture/v2_design_goals.md).
