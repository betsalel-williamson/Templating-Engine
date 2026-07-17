# modern syntax

**Experimental parser surface** — not the long-term language destination. The `parseModern` API in `@bwilliamson/template-engine-core` parses Jinja2/Handlebars-inspired `{{ ... }}` output tags and `{% ... %}` control blocks. The grammar is incomplete and **implementation in flux**; imperative control flow in template text is exploratory, not the intended [logic-less presentation](./logic-less-presentation.md) model.

The **destination direction** for Version 2 is Mustache-style logic-less presentation with branching and iteration planned in the [host layer](./host-layer.md). See [V2 design goals](../features/architecture/v2_design_goals.md).

The CLI and stable API use [legacy syntax](./legacy-syntax.md) via `parseLegacy`.
