# Evaluation, Security, and Diagnostics

**Status:** **Proposed** V2 evaluation model. **Shipped today:** legacy + experimental modern parsers → shared canonical AST → secure evaluator; compiler-style diagnostics for parse and several runtime failures ([parse diagnostics](../architecture/parse_diagnostics.md)).

## Pipeline

```text
Template text → Parser (V2) → Canonical AST → Secure evaluator → Output string
                      ↑                              ↑
              sourcePath label              DataContext + registries
```

**Shipped:** `parseLegacy` and `parseModern` participate in this pipeline today. **Proposed:** a dedicated V2/Mustache parser producing the same AST family so evaluation logic stays unified.

## Order of expansion

**Proposed** deterministic rules (refinable during TDD):

1. **Parse** entire template; fail closed on invalid syntax — no partial render.
2. **Walk AST** in document order: literals copy; output expressions evaluate; sections recurse.
3. **Output expression:** resolve primary value (lookup, literal, or call) → apply filter pipeline left-to-right → apply context-aware escaping → append to buffer.
4. **Positive section:** resolve name in current context frame → if array, push element context and render body per item → if truthy non-array, render body once → if falsy, skip.
5. **Inverted section:** render body when value is falsy or missing.
6. **Function call:** evaluate arguments depth-first → dispatch registry → handle plain vs TrustedTemplate return.
7. **Partial:** resolve name in partial registry → parse/evaluate partial body with current context (or defined sub-context rule — open question).
8. **TrustedTemplate:** expand contained template text under rescan rules with depth accounting; nested untrusted data inside remains escaped when emitted as data.

Lambdas/macros that return section bodies follow the same frame push/pop rules as static sections.

## Escaping and domain safety

**Proposed** defaults aligned with [ADR-002](../architecture/adr-002-mustache-js-first-code-generation.md) and [secure templating guide](../architecture/secure_templating_guide.md):

| Channel                     | Policy                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Default `{{ }}` output      | Escaped for output domain (HTML, plain text, SQL literal context — policy selected at evaluator setup)                   |
| TrustedTemplate             | No automatic promotion; expansion still escapes **data** inserts unless explicit unescaped channel documented per domain |
| SQL / structured generation | Host context acts as parameter builder; prefer binding over concatenation                                                |

**Shipped:** escaping behavior exists for current surfaces; domain-aware policy matrix is **proposed** refinement.

## Recursion and depth limits

**Proposed:**

- Context stack depth counter for nested sections and partials.
- Maximum evaluation depth for nested expressions and alias expansion.
- Breach → `RecursionDepthError` or equivalent with source span — prevents billion-laughs and runaway macro expansion ([V2 mathematical design §4](../architecture/v2_mathematical_design.md)).

**Shipped:** max evaluation depth diagnostic exists for some paths ([parse diagnostics](../architecture/parse_diagnostics.md) coverage table).

## Failure modes

| Failure               | Behavior (proposed)                                                                                                           | Diagnostics                              |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Syntax error          | Throw; no output                                                                                                              | Compiler-style path, line, column, caret |
| Unknown filter        | Throw or empty — align with function unregistered policy                                                                      | Span on filter name                      |
| Unregistered function | Empty **or** throw — pick one before implementation [#21](https://github.com/betsalel-williamson/Templating-Engine/issues/21) | Span on function name                    |
| Unknown partial       | Throw with span                                                                                                               | Partial name location                    |
| Depth exceeded        | Throw                                                                                                                         | Span on triggering node                  |
| Async rejection       | Propagate; attach source metadata when available                                                                              | Message + location when present          |

Formatted diagnostics must remain **LLM-ready** — self-contained message, path, line, column, caret ([parse diagnostics](../architecture/parse_diagnostics.md)).

## Security summary

1. **Allowlisted registries** — filters and functions only.
2. **No JS in template text** — host prepares values.
3. **TrustedTemplate gate** — only explicit wrapper rescans.
4. **Private registry copy** — defeats registry poisoning (**shipped** baseline).
5. **Optional function cloning** — defeats closure poisoning for pure helpers (**shipped** option).
6. **No template-side I/O** — registries exclude dangerous capabilities.

## Async evaluation

**Proposed:** host functions and context lookups may return Promises; evaluator awaits in deterministic walk order. Exact async section semantics (parallel vs sequential iteration) are an [open question](./open-questions.md).

**Shipped:** evaluator supports async evaluation for registered functions in current API.

## Relationship to legacy and modern

| Surface                 | Evaluation notes                                                             |
| ----------------------- | ---------------------------------------------------------------------------- |
| Legacy **shipped**      | RPL operators map to AST nodes evaluated by shared secure evaluator          |
| Modern **experimental** | Output + filters evaluated; `{% %}` blocks **not** destination               |
| V2 **proposed**         | Mustache sections + output expressions; deprecate destination use of `{% %}` |

Golden-file recipes and parse diagnostics support human and LLM review ([V2 design goals](../architecture/v2_design_goals.md)).
