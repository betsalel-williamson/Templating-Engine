# host layer

The JavaScript/TypeScript program or build step that prepares template [data context](./data-context.md) before rendering: shaping arrays for sections, computing flags for conditionals, registering safe functions, and orchestrating **code generation** workflows.

[V2](./v2.md) design puts control decisions here rather than in template text ([logic-less presentation](./logic-less-presentation.md)). The engine does not execute arbitrary JavaScript inside template strings—the host prepares values; templates project and format them.
