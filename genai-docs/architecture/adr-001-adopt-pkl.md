# ADR-001: Adopting Pkl for Future Work

- **Status**: Accepted
- **Date**: 2025-06-25

## Context and Problem Statement

This project began as an effort to port the classic `mergeEngine` TCL templating language to modern TypeScript. The initial goal was to achieve feature parity and then evolve it with a more modern syntax.

During this process, I explored other templating tools like `m4`, `ninja`, and `django` templates, but found they didn't quite capture the "data as metadata" power of the original `mergeEngine`'s indirection features.

Recently, I discovered Apple's Pkl (<https://pkl-lang.org/>), a new open-source language built specifically for configuration. A review of Pkl shows that it not only covers all the powerful features of `mergeEngine` but also provides a much richer, safer, and more robust ecosystem out of the box.

## Decision Drivers

- **User-Centricity**: A mature tool with better features and documentation will improve productivity for our users (developers, DevOps engineers).
- **Software Delivery Stability**: Pkl's static type system can prevent entire classes of configuration errors before deployment, directly improving our Change Failure Rate.
- **Reduced Maintenance**: Offloading the maintenance of the language and its tooling allows us to focus on our core business logic.

## Considered Options

1. **Continue developing `template-engine-ts`**: Build out the modern syntax and tooling as planned.
2. **Adopt Pkl**: Halt development on `template-engine-ts`, deprecate it, and adopt Pkl as the standard.

## Decision Outcome

**Chosen option: "Adopt Pkl"**.

For now, we will halt active feature development on `template-engine-ts` and adopt Pkl as our standard for configuration and templating.

## Proof-of-Concept Analysis

The decision was validated by migrating all four to Pkl and comparing the two implementations. The Pkl version proved to be superior across all key engineering metrics.

<!-- prettier-ignore -->
| Criterion | Pkl Version | mergeEngine Version | Analysis & Recommendation |
| :--- | :--- | :--- | :--- |
| **Readability & Maintainability** | ```pkl data.columns.toList().map(...)``` | ```tcl <~...<*?, :>...~>``` | **Pkl is vastly superior.** The Pkl code uses standard, well-understood functional concepts (`toList`, `map`). A new developer can immediately grasp the intent. The `mergeEngine` version is a dense, symbol-heavy DSL that requires specialized knowledge, making maintenance difficult and error-prone. |
| **Safety & Type System** | **Strongly-typed.** Pkl understands the data structure. A misspelled property (`data.colums`) would throw a clear error at evaluation time. This prevents silent failures. | **Untyped.** `mergeEngine` performs string substitution. A misspelled array name (`<[colums]>`) would result in an empty string and syntactically invalid SQL, which might only be caught much later. | **Pkl is the clear winner.** Its type system prevents an entire class of common configuration errors, directly improving our Change Failure Rate and aligning with our "Design for Failure" principle. |
| **Expressiveness & Power** | **High & General.** The `map().joinToString()` pattern is a standard, powerful, and composable way to solve this class of problems. `foldIndexed` provides even more power for complex aggregations. | **High but Narrow.** The `<*?delimiter:terminator>` construct is extremely expressive *for this specific problem* but is a specialized shortcut. | **Pkl's power is more general and maintainable.** Instead of bespoke shortcuts, it provides a standard library of functions that can be combined to solve a much wider range of problems in a readable way. |
| **Debugging** | **Excellent.** Pkl provides structured error messages with line and column numbers. The errors encountered during the PoC were specific and guided us to the correct idiomatic solution. | **Difficult.** Debugging often involves deciphering cryptic tag mismatches or dealing with silent failures. It is effectively a "black box" of string replacement. | **Pkl is dramatically better.** Fast, clear feedback loops are essential for productivity. Pkl provides the debugging experience of a modern programming language. |
| **Ecosystem & Tooling** | **Rich.** Pkl has an official language server (LSP) for IDE support, build tool plugins, and a package manager. | **Nonexistent.** We would be responsible for building all tooling from scratch, violating the DRY principle at a project level. | **Pkl wins by a landslide.** Adopting Pkl allows us to leverage a mature ecosystem instead of building one, freeing us to focus on delivering actual value. |

## Consequences

- **Positive**:
  - We are no longer responsible for maintaining a custom language, parser, and evaluator.
  - We gain a superior tool with static typing, a rich module system, and a mature tooling ecosystem.
  - Pkl's features are a better fit for our use cases and will lead to higher-quality, more maintainable configurations.
- **Negative**:
  - The team and our users will need to learn Pkl. The cost is deemed acceptable due to Pkl's quality and comprehensive documentation.
  - Existing templates written for `mergeEngine` must be migrated to Pkl. This effort will be managed through a structured migration plan.

## Plan

1. **Halt and Deprecate**: Cease new feature work on `template-engine-ts`. The `README.md` will be updated to mark the project as deprecated. The repository will be archived once all consumers have migrated.
2. **Proof of Concept**: This ADR documents the successful completion of the PoC.
3. **Plan Migration**: Develop a new migration plan for moving any remaining `mergeEngine` templates to Pkl.
