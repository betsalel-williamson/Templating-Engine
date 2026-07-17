# Tooling Goals

**Status:** **Proposed** — architecture goals from [ADR-002](../architecture/adr-002-mustache-js-first-code-generation.md). Editor implementation issues (**#32**, **#33**) stay **blocked** until the V2 language spec is accepted and syntax freezes enough to implement highlighting and navigation reliably.

Tooling does **not** change the logic-less / JS-first split; it supports the **compact pipeline** (spec intent → host meta-code → template → product) for humans and LLMs — shared diagnostics, navigation, and scannable diffs ([overview](./overview-and-non-goals.md)).

## VS Code syntax highlighting

**Proposed** grammar scope:

| Token class                 | Examples                                   |
| --------------------------- | ------------------------------------------ |
| Output delimiters           | `{{`, `}}`                                 |
| Section tags                | `{{#`, `{{^`, `{{/`, partial `{{>`         |
| Comments                    | `{{!`                                      |
| Identifiers / paths         | section names, dot paths, bracket segments |
| Filter pipes and names      | `\|`, `upper`, `length`                    |
| String and numeric literals | inside output expressions                  |
| Literal template text       | outside tag regions                        |

**Explicitly not in destination grammar:** `{%`, `%}` control-flow highlighting as first-class template statements.

**Shipped today:** legacy syntax may have partial editor support; Mustache destination grammar is **not** finalized in extensions.

## Go-to-definition and hover

**Proposed** when host exposes a schema or registry manifest:

| Symbol                           | Navigation target                           |
| -------------------------------- | ------------------------------------------- |
| Context key in `{{ user.name }}` | Host context type or JSON schema property   |
| Section name `{{#items}}`        | Array or boolean field definition           |
| Filter upper                     | Filter registry entry or docs               |
| Function `formatId(...)`         | Function registry entry / TS implementation |
| Partial `{{> row}}`              | Partial template file or registry entry     |

Requirements:

- Manifest is **host-supplied** (project-specific); the engine core does not hard-code business keys.
- Language server or extension reads manifest + template path to resolve symbols.
- Hover shows type hints and doc strings where available.

## Diagnostics in editor

**Proposed:** surface the same compiler-style messages as CLI/integrators ([parse diagnostics](../architecture/parse_diagnostics.md)) — squiggles on unknown filters, unregistered functions, syntax errors, depth violations.

**Shipped:** CLI and library formatters exist for several error kinds; LSP integration is **proposed**.

## Review and LLM workflows

Goals aligned with [V2 design goals](../architecture/v2_design_goals.md) and the [overview compact pipeline](./overview-and-non-goals.md):

- Templates scannable in PR diffs with consistent delimiter highlighting.
- Canonical golden-file recipes linked from docs for pattern reference.
- Diagnostic output pasteable into LLM prompts without extra context.
- **Clean tool integration** — highlighting, go-to-definition, and shared diagnostics so agents and humans navigate host registries and template symbols without re-explaining the language each turn.
- **Compact review surface** — prefer reviewing short templates plus host prep over large imperative template bodies; tooling should reinforce that split rather than encourage logic in template text.

## Implementation sequencing (informative)

Suggested order after spec acceptance — not part of this WORK_ITEM:

1. TextMate grammar for Mustache destination tags + output expressions.
2. Manifest schema for context keys and registries.
3. Go-to-definition provider.
4. Diagnostic pull from parser/evaluator in extension or LSP.

## Deferred issues

| Issue | Scope                            | Blocker                                      |
| ----- | -------------------------------- | -------------------------------------------- |
| #32   | _(editor tooling — syntax)_      | Spec acceptance + delimiter freeze           |
| #33   | _(editor tooling — definitions)_ | Registry manifest contract + spec acceptance |

Track exact issue titles in GitHub; this shard records **intent only**.
