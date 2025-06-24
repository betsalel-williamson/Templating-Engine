# Story 1: Implement Modern Recursive Variable Replacement

- **Project**: `template-engine-ts`
- **Status**: `todo`
- **As a** Developer managing a complex set of configuration aliases,
- **I want to** define an alias variable (e.g., `{{ active_db_host }}` ) that points to another environment-specific variable (e.g., `{{ prod_db_host }}` ),
- **so that** I can change a single alias to redirect a large part of my configuration, simplifying environment management.

## Acceptance Criteria

- A template `{{ var1 }}` with a context `{ var1: 'var2', var2: 'Final Value' }` must produce `Final Value`.
- The system must detect circular references (e.g., `{ varA: 'varB', varB: 'varA' }`) and throw a specific, informative error.
- The evaluator's variable resolution logic must handle multi-step lookups correctly for the new syntax.
- Unit tests must exist to validate both successful recursive replacement and the circular reference error condition for the new syntax.

## Metrics for Success

- **Primary Metric**: Rework Rate for new templates using recursive variables is 0%.
- **Secondary Metrics**: No degradation in test coverage for the evaluator module's core resolution logic.
