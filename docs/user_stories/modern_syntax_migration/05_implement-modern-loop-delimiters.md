# Story 5: Implement Modern Loop Delimiters

- **Project**: `template-engine-ts`
- **Status**: `todo`
- **As a** Developer generating a SQL `CREATE TABLE` statement,
- **I want to** add a comma after each column definition except the last one using conditional logic within the loop,
- **so that** I can generate syntactically correct code for lists without writing brittle post-processing logic to remove trailing delimiters.

## Acceptance Criteria

- Within a `{% for ... %}` loop, the `loop.last` variable must be available and resolve to `true` for the last iteration and `false` otherwise.
- The new grammar must support combining `{% if %}` logic within loop bodies to conditionally render text based on `loop.last`.
- A template that generates a comma-separated list like `attr1, attr2, attr3` (without a trailing comma) must be possible using `{% if not loop.last %},{% endif %}` or similar patterns.
- The SQL `create table` example from `mergeTemplate.README` must be implementable as a successful unit test using the new syntax.

## Metrics for Success

- **Primary Metric**: "Reduce the number of open legacy feature parity gaps by 1 (for conditional delimiters)."
- **Secondary Metrics**: "No new high-priority bugs are reported against the engine within one week of this feature's deployment."
