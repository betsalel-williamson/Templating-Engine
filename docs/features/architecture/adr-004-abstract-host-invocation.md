# ADR-004: Abstract Host Invocation for Filters and Functions

- **Status**: Accepted
- **Date**: 2026-07-17
- **Related**: [ADR-002: Mustache logic-less + JS/TS-first](./adr-002-mustache-js-first-code-generation.md), [Host environment integration](./host_environment_integration.md), [Host layer contracts](../language-spec/host-layer-contracts.md)

## Context

The V2 template language presents **abstract** filter and function names (for example `| upper`, `formatId(...)`). The evaluator needs a host to supply implementations. Today that host is the TypeScript/Node runtime, which delivers immediate product value: running templates, allowlisted registries, and reviewable code generation.

It is also true that a filter or function is, at the language level, only a **name plus evaluated arguments**. That fact must stay visible in the architecture so later work can attach additional trusted host backends (reviewed native libraries, channel or container workers, and similar) under the same names—without rewriting templates or baking a single implementation technology into the language grammar.

Stability and utility come first. The architecture records **direction and reserved contracts** so builders avoid closing doors; it does not require shipping every possible backend now.

## Decision

1. **Templates invoke abstract names.** Filters and functions in template text are identifiers and arguments. The language remains independent of how a given host implements those names.
2. **The host supplies implementations and trust.** Registration, allowlisting, and which artifact is trusted to run are host responsibilities. The engine dispatches registered names through the active host path.
3. **The default host runtime is JavaScript/TypeScript.** That is the shipped path that runs templates and registries today.
4. **Value exchange uses JSON-serializable, immutable snapshots.** Arguments and results cross the invocation boundary as copy-in / copy-out data. This favors safety, reviewability, and interchangeable backends. A later `argMode` extension (for example handles for shared reference) may be added under the same registration model when performance needs justify it.
5. **Registrations declare a capability label** — at least `pure` or `io`. Host-trusted `io` registrations are allowed; tooling and diagnostics surface impure calls so humans and LLMs can review them.
6. **Direction for additional backends.** The same abstract names, capability labels, and JSON value contract remain the stable surface if the host later attaches further trusted backends (for example a reviewed static library for hot transforms, or a dedicated channel to a reviewed worker/container for isolated work). Prefer extending registration metadata over changing template syntax.
7. **Stability rule.** Prefer contracts that keep the language and evaluator invocation model open to those backends. Avoid coupling template grammar or core evaluation contracts to one implementation technology beyond naming JS/TS as the **current default host**.

## Design contracts (normative intent)

| Contract           | Intent                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------- |
| Abstract names     | Template authors see portable filter/function identifiers only                         |
| Host registration  | Name → implementation (+ capability, and later backend metadata) at evaluator setup    |
| Default backend    | In-process JS/TS functions and filters                                                 |
| Value codec (v1)   | JSON-serializable values; immutable snapshot semantics                                 |
| Capability         | `pure` or `io` on each registration; impure calls visible in manifests and diagnostics |
| Extension metadata | Reserve room for backend id and `argMode` (`json` first; handles when needed)          |

These contracts guide paper specs and future TDD slices. They are **architecture intent** until reflected in shipped APIs and tests.

## Consequences

### Positive

- Clear separation: language surface vs host execution path.
- Immediate value stays on the JS/TS host without speculative multi-backend machinery.
- Capability labels make impure registrations visible for LLM and human review.
- Future native or channel backends can share the same template text and value contract.

### Trade-offs

- JSON snapshots copy data; handle-based sharing is a later optimization when measured need appears.
- Host artisans must label and review `io` registrations; trust is a host policy, not an engine guess.

## Related documents

- [Host environment integration](./host_environment_integration.md)
- [Host layer contracts](../language-spec/host-layer-contracts.md)
- [Evaluation, security, and diagnostics](../language-spec/evaluation-security-diagnostics.md)
- [V2 design goals](./v2_design_goals.md)
