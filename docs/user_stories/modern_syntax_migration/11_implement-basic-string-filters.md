# Story 11: Implement Basic String Filters

- **Project**: `template-engine-ts`
- **Status**: `todo`
- **As a** Developer performing common text formatting,
- **I want to** use filters like `upper`, `lower`, and `trim` on my variables,
- **so that** I can handle basic string manipulations directly in my templates without needing to write boilerplate logic in my host application.

## Acceptance Criteria

- Following the new pluggable architecture:
- An `upper.ts` file must be created in `src/filters/`. `{{ "hello" | upper }}` must produce `HELLO`.
- A `lower.ts` file must be created in `src/filters/`. `{{ "WORLD" | lower }}` must produce `world`.
- A `trim.ts` file must be created in `src/filters/`. `{{ "  spaced  " | trim }}` must produce `spaced`.
- Each new filter file must be correctly registered in `src/filters/index.ts`.
- Each filter must have dedicated unit tests covering its functionality.

## Metrics for Success

- **Primary Metric**: "100% unit test coverage for the implemented string filters."
- **Secondary Metrics**: "Increase developer satisfaction score related to 'ease of use' in team surveys."
