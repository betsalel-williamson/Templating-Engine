# Story 10: Implement Filter Pipeline and Registry

- **Project**: `template-engine-ts`
- **Status**: `todo`
- **As a** Principal Engineer,
- **I want to** implement the core filter pipeline (`|`) and a secure registry for built-in filter functions,
- **so that** we establish a robust, extensible, and architecturally sound mechanism for all data transformations in the new syntax.

## Acceptance Criteria

- The new parser must be updated to recognize the `| filterName` syntax within `{{ ... }}` tags.
- The evaluator must be updated to include a private, non-mutable `FilterRegistry`.
- When a `|` is encountered, the evaluator must pass the value from the left-hand side as the first argument to the named filter function from the registry.
- The system must support chained filters (e.g., `{{ var | trim | upper }}`).
- A clear error must be thrown if a template calls a filter that is not in the registry.
- An initial "passthrough" filter (e.g., `identity`) must be created for testing the pipeline itself.

## Metrics for Success

- **Primary Metric**: "Architectural soundness demonstrated by zero regressions in existing modern-syntax evaluation tests."
- **Secondary Metrics**: "Change Lead Time for adding new filters in subsequent stories is less than 1 hour."
