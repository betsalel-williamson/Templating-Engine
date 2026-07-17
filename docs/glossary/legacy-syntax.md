# legacy syntax

**Stable, shipped** template surface derived from [mergeEngine](./merge-engine.md): tags such as `<#name#>`, `<~ ... ~>`, `<*>`, and `<{fn(...)}>`. Parsed by `parseLegacy` in `@bwilliamson/template-engine-core`. Default for the CLI and stable API.

This RPL-style surface preserves mergeEngine's mathematical transformation semantics. It is not the long-term [V2](./v2.md) destination—active design moves presentation toward [logic-less presentation](./logic-less-presentation.md) with [host layer](./host-layer.md) data prep—but legacy syntax remains supported for existing recipes.
