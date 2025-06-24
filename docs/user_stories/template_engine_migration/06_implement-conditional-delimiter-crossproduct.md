# Story 6: Implement Cross-Product with Conditional Delimiter

- **Project**: `template-engine-ts`
- **As a** Developer generating a SQL `CREATE TABLE` statement,
- **I want to** add a comma after each column definition except the last one using the `<*?true:false>` syntax,
- **so that** I can generate syntactically correct code for lists without writing brittle post-processing logic to remove trailing delimiters.

## Acceptance Criteria

-   The grammar must be extended to parse the conditional cross-product syntax `<~template~><*?delimiter:terminator><[array]>~>`.
-   The evaluator must apply the main template to each element.
-   The evaluator must insert the `delimiter` text between each element's output, but not after the last one.
-   The evaluator must append the `terminator` text after the final element's output (this is often an empty string).
-   The SQL `create table` example from `mergeTemplate.README` must be implemented as a successful unit test.

## Metrics for Success

- **Primary Metric**: Reduce the number of open legacy feature parity gaps by 1, as this is a major, complex feature.
- **Secondary Metrics**: No new high-priority bugs are reported against the engine within one week of this feature's deployment.
