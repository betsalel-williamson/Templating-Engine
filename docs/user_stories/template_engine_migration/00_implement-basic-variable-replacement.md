# Story 0: Implement Basic Variable Replacement

- **Project**: `template-engine-ts`
- **As a** Developer,
- **I want to** replace simple `<#variable#>` placeholders with values from a data context,
- **so that** the most fundamental feature of the template engine is functional, establishing the core parse-and-evaluate pipeline.

## Acceptance Criteria

-   A template containing `<#name#>` with a context `new Map([['name', 'World']])` must produce output with `World` in its place.
-   A template containing a variable not present in the context, like `<#missing#>`, must leave the placeholder unchanged in the final output.
-   The implementation must include unit tests covering both successful replacement and missing variables.
-   The Peggy grammar must correctly identify and parse `Literal` and `Variable` nodes.
-   The evaluator must correctly process `Literal` and `Variable` nodes from the AST.

## Metrics for Success

- **Primary Metric**: Achieve >90% unit test coverage for `VariableNode` and `LiteralNode` evaluation logic.
- **Secondary Metrics**: Establish a baseline for Change Lead Time for the new `template-engine-ts` project.
