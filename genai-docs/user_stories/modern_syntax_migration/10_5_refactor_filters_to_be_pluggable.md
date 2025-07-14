# Story 10.5: Refactor Filter Implementation to be Modular and Pluggable

- **Project**: `template-engine-ts`
- **Status**: `todo`
- **As a** Principal Engineer,
- **I want to** architect the filter system so that each filter is a separate module in a dedicated directory, discoverable via an index file,
- **so that** we can add new filters with minimal, isolated changes, which improves maintainability, encourages contributions, and adheres to our Loose Coupling and Small Batch Size principles.

## Acceptance Criteria

- A new `src/filters/` directory must be created to house all filter modules.
- A new `src/filters/types.ts` file must be created, defining the `Filter` function signature.
- A new `src/filters/index.ts` file must be created. It must import all individual filter modules and export them as a single `FilterRegistry` map (`Map<string, Filter>`).
- As a proof of concept, a simple `upper` filter must be implemented in `src/filters/upper.ts`.
- The `createSecureEvaluator` function in `src/evaluator.ts` must be updated to import the `builtInFilters` map from `src/filters/index.ts` to build its private registry, instead of defining them inline.
- The process for adding a new filter must not require any modifications to `src/evaluator.ts`.

## Metrics for Success

- **Primary Metric**: "Change Lead Time for adding a new filter is reduced to under 10 minutes (create file, add logic, update index, write test)."
- **Secondary Metrics**: "Achieve 100% decoupling of filter logic from the core evaluator module."
