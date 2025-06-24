# Story 1: Implement Recursive Variable Replacement

- **Project**: `template-engine-ts`
- **As a** Developer,
- **I want to** have variables that resolve to the names of other variables be fully expanded,
- **so that** I can create complex, multi-layered template configurations in parity with the legacy engine.

## Acceptance Criteria

-   A template `<#var1#>` with a context `{ var1: 'var2', var2: 'Final Value' }` must produce `Final Value`.
-   The system must detect circular references (e.g., `{ varA: 'varB', varB: 'varA' }`) and throw a specific, informative error.
-   The evaluator's variable resolution logic must handle multi-step lookups correctly.
-   Unit tests must exist to validate both successful recursive replacement and the circular reference error condition.

## Metrics for Success

- **Primary Metric**: Rework Rate for this feature is 0%. (The logic is implemented correctly the first time based on tests).
- **Secondary Metrics**: No degradation in test coverage for the evaluator module.
