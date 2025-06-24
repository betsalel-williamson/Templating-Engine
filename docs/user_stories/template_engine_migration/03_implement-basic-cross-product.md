# Story 3: Implement Basic Cross-Product Expansion

- **Project**: `template-engine-ts`
- **As a** Developer,
- **I want to** iterate over an array of data using the `<~template~><*><[array]>~>` syntax,
- **so that** I can generate dynamic content from lists, a core feature of the engine.

## Acceptance Criteria

-   The grammar must correctly parse the cross-product syntax into a `CrossProductNode` containing a nested template AST and an `ArrayNode` iterator.
-   The evaluator must iterate over the specified array in the data context.
-   For each item in the array, a new sub-context must be created containing the item's data.
-   The nested template must be evaluated using this sub-context for each iteration.
-   The final output must be a concatenation of the results from each iteration.
-   Unit tests must validate the expansion of an array of objects (maps).

## Metrics for Success

- **Primary Metric**: Successful implementation allows for decommissioning of the corresponding TCL iteration logic, reducing project scope.
- **Secondary Metrics**: Change Lead Time for this feature is under the team's established baseline.
