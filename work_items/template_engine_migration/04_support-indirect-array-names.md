# Story 4: Support Indirect Array Names in Cross-Products

- **Project**: `template-engine-ts`
- **Status**: `verified completed`
- **As a** Developer writing a generic report template,
- **I want to** use a variable like `<#dataSource#>` to determine which array to iterate over in a cross-product (`<~...<*><[<#dataSource#>]>~>`),
- **so that** I can use the same report template to display data from different sources (`'monthly_sales'`, `'quarterly_revenue'`) by only changing one variable.

## Acceptance Criteria

- The grammar's `ArrayRule` must be updated to accept a `Variable` node as its name.
- The evaluator, when processing a `CrossProductNode`, must first resolve the array name if it's a variable before fetching the array from the context.
- A template `<~...<*><[<#arrayNameVar#>]>~>` with context `{ arrayNameVar: 'products', products: [...] }` must correctly iterate over the `products` array.
- Unit tests must validate this indirection capability.

## Metrics for Success

- **Primary Metric**: "0% Change Failure Rate for deployments including this feature."
- **Secondary Metrics**: "Maintain >90% overall test coverage."
