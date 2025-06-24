# Story 2: Implement Indirect Variable Replacement

- **Project**: `template-engine-ts`
- **As a** Developer generating code for multiple target languages (e.g., C#, Java),
- **I want to** use a variable's *value* as the name of the next variable to look up (e.g., `lang = "java"`, `<##<#lang#>-for-loop-template##>`),
- **so that** I can use a high-level configuration value to select from a wide range of code-generation snippets dynamically.

## Acceptance Criteria

-   The grammar must be updated to parse `<##name##>` into an `IndirectVariable` AST node.
-   The evaluator must handle the `IndirectVariable` node.
-   Given the context from `mergeTemplate.README`, a template `See Indirection -- <##indirection-0##>` must produce `See Indirection -- The real value we are seeking`.
-   The resolution must continue until the looked-up value is no longer a key in the data context.
-   The system must detect and throw an error for circular indirect references.
-   Unit tests must cover successful indirection and the circular reference error condition.

## Metrics for Success

- **Primary Metric**: A 5% decrease in the overall Rework Rate for the project, indicating increasing maturity.
- **Secondary Metrics**: Test coverage for indirection logic is >95%.
