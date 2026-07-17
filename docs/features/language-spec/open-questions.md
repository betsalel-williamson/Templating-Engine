# Open Questions and Constraints

**Status:** **Proposed** — explicit uncertainty so the paper spec does not fake precision. Resolve during spec review **before** TDD slices begin.

## Product choices (pick before implementation)

| Question              | Options                                               | Affects                                                                                 |
| --------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Unregistered function | Fail-safe empty output vs throw with diagnostic       | [#21](https://github.com/betsalel-williamson/Templating-Engine/issues/21), evaluator UX |
| Unknown filter        | Throw (current modern tendency) vs empty              | Consistency with function policy                                                        |
| V2 parser entrypoint  | New `parseV2` vs evolve `parseModern` without `{% %}` | Migration, API surface                                                                  |
| CLI exposure          | When V2 lands, default parser for CLI vs opt-in flag  | Breaking change timing                                                                  |

## Syntax and grammar

| Question               | Notes                                                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| String literal rules   | Multiple options analyzed in [modern syntax technical overview §5](../architecture/new_syntax_technical_overview.md); no decision |
| Filter argument syntax | Colon-separated (`slice:1:5`) vs parentheses; must stay abstract in template language                                             |
| Bracket expressions    | Concatenation and dynamic keys in `{{ settings[env + '-host'] }}` — operator set in output expressions                            |
| Unescaped output       | Whether triple-brace raw tags or a dedicated raw filter is the explicit unescaped channel                                         |
| Comments               | `{{! }}` only vs HTML-style — Mustache-aligned default proposed                                                                   |
| Partial paths          | Logical names only vs file-relative paths in host registry                                                                        |

## Evaluation semantics

| Question                | Notes                                                                          |
| ----------------------- | ------------------------------------------------------------------------------ |
| Async section iteration | Sequential await vs parallel batch for array sections                          |
| Lambda vs function call | Section functions vs `{{ fn() }}` — overlap and naming                         |
| Partial recursion       | Cycle detection; shared vs separate stack counters (raise/disable is settled)  |
| TrustedTemplate nesting | Depth counting for rescan inside rescan                                        |
| Empty vs falsy          | Mustache rules for `[]`, `0`, `""` in sections — confirm for code-gen contexts |

## Migration and coexistence

| Constraint        | Detail                                                                              |
| ----------------- | ----------------------------------------------------------------------------------- |
| Legacy support    | `parseLegacy` remains until explicit deprecation policy; V2 is additive destination |
| Modern `{% %}`    | Not migrated to V2; host prepares data for sections instead                         |
| Recipe porting    | Legacy RPL → host array/boolean + Mustache sections; not automatic                  |
| AST compatibility | V2 should target canonical AST nodes where possible to reuse evaluator investment   |

## Non-negotiable constraints (from ADR-002)

These are **not** open for re-litigation in implementation slices:

- No Jinja `{% %}` as V2 destination control flow.
- No Pkl adoption path.
- No arbitrary JavaScript execution inside template text.
- No template-registry I/O capabilities.
- Logic-less presentation: branching/iteration planning in host TS.

## Go/no-go inputs

Use this list plus [overview and non-goals](./overview-and-non-goals.md) to estimate effort:

| Slice                               | Depends on resolving                           |
| ----------------------------------- | ---------------------------------------------- |
| Mustache parser + sections          | Section falsy rules, partial contract          |
| Output expression parity            | String literals, function-call grammar         |
| Filter registry MVP                 | #27 + #28 set, argument syntax                 |
| Function registry + TrustedTemplate | #21, unregistered policy, TrustedTemplate type |
| Diagnostics                         | Span coverage for new node kinds               |
| Tooling                             | Delimiter freeze, manifest schema              |

Acceptance of this paper spec means questions marked **pick before implementation** have owner decisions recorded (issue comment or ADR addendum) — not silent defaults during coding.
