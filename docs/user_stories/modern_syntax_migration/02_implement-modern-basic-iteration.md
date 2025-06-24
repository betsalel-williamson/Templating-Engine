# Story 2: Implement Modern Basic Iteration

- **Project**: `template-engine-ts`
- **Status**: `todo`
- **As a** Developer generating an HTML list,
- **I want to** apply a template snippet (e.g., `<li>{{ item.name }}</li>`) to each item in a data array using `{% for ... in ... %}` syntax,
- **so that** I can generate repetitive structures like `<li>` tags for any number of items without duplicating template code, adhering to the DRY principle.

## Acceptance Criteria

- The new grammar must correctly parse `{% for item in collection %}` and `{% endfor %}`.
- The evaluator must iterate over the specified array in the data context.
- For each item in the array, a new sub-context must be created, making the item's properties directly accessible (e.g., `{{ item.name }}`).
- The nested template within the loop must be evaluated using this sub-context for each iteration.
- The final output must be a concatenation of the results from each iteration.
- The loop context must expose `loop.index` (0-based) and `loop.length` (total elements) variables.
- Unit tests must validate iteration over an array of objects (maps).

## Metrics for Success

- **Primary Metric**: Achieve >90% adoption rate of `{% for %}` loops in new templates created after this feature's release within one month.
- **Secondary Metrics**: Reduce average lines of boilerplate code for list rendering by 30%.
