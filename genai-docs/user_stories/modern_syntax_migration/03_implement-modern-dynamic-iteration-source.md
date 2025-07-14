# Story 3: Implement Modern Dynamic Iteration Source

- **Project**: `template-engine-ts`
- **Status**: `todo`
- **As a** Developer writing a generic report template,
- **I want to** use a variable or expression to determine which array to iterate over (e.g., `{% for item in {{ dynamic_source_name }} %}`),
- **so that** I can use the same report template to display data from different sources (`'monthly_sales'`, `'quarterly_revenue'`) by only changing one variable.

## Acceptance Criteria

- The `{% for ... in ... %}` syntax must support a nested variable or expression for the collection name.
- The evaluator, when processing the loop, must first resolve the collection name from the nested expression before fetching the array from the context.
- A template like `{% for user in {{ entity_list_name }} %}` with context `{ entity_list_name: 'users_data', users_data: [...] }` must correctly iterate over the `users_data` array.
- Unit tests must validate this dynamic source capability.

## Metrics for Success

- **Primary Metric**: "0% Change Failure Rate for deployments including this feature."
- **Secondary Metrics**: "Maintain >90% overall test coverage for the new parser and evaluator."
