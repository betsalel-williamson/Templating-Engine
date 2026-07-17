# Host Layer Contracts

**Status:** **Proposed** architecture contracts. **Shipped today:** `Map`-based [data context](../../glossary/data-context.md), secure evaluator with private function registry copy, partial filter support in experimental `parseModern`. TrustedTemplate and Mustache sections are **not** shipped.

Normative intent also recorded in [ADR-002 § Design contracts](../architecture/adr-002-mustache-js-first-code-generation.md#design-contracts-normative-intent-not-product-implementation).

## Artisan / worker split

| Role                         | Responsibility                                                                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Artisan (host TS)**        | Shape arrays, flags, joins, pagination; register filters and functions; construct TrustedTemplate when intentional re-parse is required |
| **Worker (template author)** | Write literals, sections, output expressions, and partial references over prepared context                                              |

The engine **asks the host context for keys**; it does not execute free-form JavaScript embedded in template text.

## DataContext

**Proposed contract** (logical name; **shipped** implementation uses `Map<string, unknown>`):

| Responsibility | Rule                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Key lookup     | Dot and bracket paths resolve against nested maps/objects prepared by host                                                   |
| Section values | Arrays drive iteration; booleans/scalars drive conditional sections; functions drive lambda/macro expansion                  |
| Immutability   | Templates must not mutate context; transforms happen in host code before or during lookup                                    |
| Live data      | Host may supply proxies, async resolvers, or signals — resolution semantics are host-defined within evaluator async contract |
| Nesting        | Section evaluation pushes a child context frame; pop on section close                                                        |

Nested JSON from CLI `--data` must be converted to nested `Map` instances before evaluation (**shipped** integrator rule).

## FilterRegistry

**Proposed** — pluggable, allowlisted transforms invoked only from [output expressions](./surface-syntax.md).

| Contract     | Detail                                                                                                                                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Registration | Host supplies filter name → implementation at evaluator creation; unknown names → diagnostic (see [evaluation shard](./evaluation-security-diagnostics.md))                                                             |
| Composition  | Filters chain left-to-right; each step receives prior step output                                                                                                                                                       |
| Typing       | Filters declare expected input; graceful coercion rules per filter (e.g. `length` on non-array → `0`) — [#28](https://github.com/betsalel-williamson/Templating-Engine/issues/28)                                       |
| Built-ins    | Initial set: `upper`, `lower`, `trim`, `length`, `first`, `last` — [#27](https://github.com/betsalel-williamson/Templating-Engine/issues/27), [#28](https://github.com/betsalel-williamson/Templating-Engine/issues/28) |
| Platform     | Implementations may use host runtime internally; template language exposes **abstract** filter names only ([host environment integration](../architecture/host_environment_integration.md))                             |

**Shipped (experimental):** filter registry exists for `parseModern` with a subset of behavior; parity with this contract is not guaranteed until V2 lands.

## FunctionRegistry

**Proposed** — allowlisted host functions callable from output expressions — [#21](https://github.com/betsalel-williamson/Templating-Engine/issues/21).

| Contract            | Detail                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Syntax              | `{{ functionName(arg1, arg2) }}` in output expressions                                                                                                              |
| Argument evaluation | All arguments fully evaluated (literals, variables, nested expressions) before invocation                                                                           |
| Dispatch            | Only registered names; unregistered → fail-safe empty output **or** explicit diagnostic — **product choice at implementation** (document both; pick one before TDD) |
| Return handling     | Plain values escaped and written; TrustedTemplate follows separate contract                                                                                         |
| Safety              | No built-in functions for file system, network, or shell                                                                                                            |
| Purity guidance     | Prefer pure functions; see [secure templating guide](../architecture/secure_templating_guide.md) for closure and registry poisoning                                 |

**Shipped today:** legacy `<{fn()}>` calls via secure evaluator; modern function-call AST shape is **proposed**, not destination-complete.

## TrustedTemplate boundary

**Proposed** — explicit opt-in for output that may contain template syntax requiring rescan.

| Return type                       | Behavior                                                                                            |
| --------------------------------- | --------------------------------------------------------------------------------------------------- |
| Plain string / serializable value | Treated as **data**: escape (per domain policy) and write to buffer **without** rescanning for tags |
| TrustedTemplate wrapper           | Treated as **template fragment**: may be merged into output and expanded under strict rules         |

Rules:

1. Only developer-controlled host code may construct TrustedTemplate; untrusted user strings **must never** be promoted.
2. Prevents SSTI and uncontrolled m4-style blind rescan ([V2 mathematical design §4](../architecture/v2_mathematical_design.md), [secure templating guide](../architecture/secure_templating_guide.md)).
3. Use cases: pagination partials, macro-generated section scaffolding — not general escape hatch.

**Shipped today:** concept documented; typed wrapper and evaluator enforcement are **not** product-complete.

## PartialRegistry

**Proposed:** host supplies named partial templates for `{{> name}}` inclusion. Contract details (nesting, cycle detection, TrustedTemplate in partials) tie to [evaluation shard](./evaluation-security-diagnostics.md).

## Secure evaluator setup

**Shipped pattern:** `createSecureEvaluator` copies the function registry into a private closure; optional deep clone for higher assurance.

**Proposed extension:** single setup surface registers filters, functions, partials, escaping policy, and depth limits before any template evaluation — freeze registries after creation.

## Spec inputs cross-reference

| Issue                                                                     | Contract section                                       |
| ------------------------------------------------------------------------- | ------------------------------------------------------ |
| [#21](https://github.com/betsalel-williamson/Templating-Engine/issues/21) | FunctionRegistry, argument evaluation, TrustedTemplate |
| [#27](https://github.com/betsalel-williamson/Templating-Engine/issues/27) | FilterRegistry string filters                          |
| [#28](https://github.com/betsalel-williamson/Templating-Engine/issues/28) | FilterRegistry array filters                           |

Implementation of these issues waits on acceptance of this paper spec.
