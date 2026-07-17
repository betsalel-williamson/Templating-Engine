# Mustache section

**Proposed** V2 construct: `{{#name}} … {{/name}}` (positive) and `{{^name}} … {{/name}}` (inverted) blocks that render over host-prepared context.

When the host supplies an **array**, the engine iterates the block; when it supplies a **boolean** or truthy/falsy scalar, the block acts as conditional; inverted sections cover missing/false cases. Replaces legacy RPL iteration/branch operators and **replaces** exploratory Jinja `{% for %}` / `{% if %}` as destination syntax.

**Not shipped** as the V2 Mustache parser destination today. See [surface syntax](../features/language-spec/surface-syntax.md) and [logic-less presentation](./logic-less-presentation.md).
