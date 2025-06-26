# ADR-001: Adopting Pkl for Future Work

- **Status**: Accepted
- **Date**: 2025-06-25

## Context: The Journey So Far

This project began as an effort to port the classic `mergeEngine` TCL templating language to modern TypeScript. The initial goal was to achieve feature parity and then evolve it with a more modern syntax.

During this process, I explored other templating tools like `m4`, `ninja`, and `django` templates, but found they didn't quite capture the "data as metadata" power of the original `mergeEngine`'s indirection features.

Recently, I discovered Apple's Pkl (<https://pkl-lang.org/>), a new open-source language built specifically for configuration. A review of Pkl shows that it not only covers all the powerful features of `mergeEngine` (like dynamic lookups and template generation) but also provides a much richer, safer, and more robust ecosystem out of the box.

## Rationale for Switching

Continuing to build a custom engine from scratch feels like reinventing the wheel, especially when a tool as well-designed as Pkl exists. Adopting it has several key advantages:

- **It's a Better Tool**: Pkl is a purpose-built, statically-typed configuration language. This provides safety and validation that a simple text-templating engine could never offer.
- **Rich Feature Set**: It includes first-class modules, excellent tooling (CLI, REPL, IDE support), and multiple output formats (JSON, YAML, etc.) by default. These are all things that would have to be built and maintained for this project.
- **Focus on the "Why"**: Using Pkl allows the focus to shift from *building* a tool to *using* a great tool to solve interesting configuration problems.

## The Path Forward

The recommendation is to archive this project as a successful learning exercise in parsing and language migration, and to adopt Pkl for all future configuration tasks.

### Consequences

- **This Project**: Will be marked as deprecated and archived. It will remain available on GitHub as a reference for anyone interested in the `mergeEngine` language or a Peggy-based parser implementation. No new features will be added.
- **Next Steps**: The immediate next step is to perform a small proof-of-concept, migrating our most complex recipes to Pkl to confirm it handles all our critical use cases as expected.

This pivot represents a natural evolution of the project, driven by the discovery of a superior tool that better aligns with the original goals.
