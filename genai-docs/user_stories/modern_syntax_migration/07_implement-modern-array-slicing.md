# Story 7: Implement Modern Array Slicing for Iteration

- **Project**: `template-engine-ts`
- **Status**: `todo`
- **As a** Developer building a paginated list,
- **I want to** apply a template to a specific slice of a data array using a filter or function (e.g., `{% for item in collection | slice(1, 3) %}`),
- **so that** I can generate content for a single page of results without modifying the source data array.

## Acceptance Criteria

- The new grammar must support applying a `slice` filter or function to an array within the `{% for ... in ... %}` declaration.
- The `slice` functionality must accept 0-based offset and an optional limit, consistent with modern array indexing.
- If the slice range is out of bounds, the evaluator should handle it gracefully (e.g., iterate over fewer items, or none).
- The `loop.index` and `loop.length` variables within the loop context must reflect the properties of the *original* array, not the sliced array, for accurate pagination display.
- Unit tests must validate slicing with various offset/limit combinations and out-of-bounds cases, all using **0-based offsets**.

## Metrics for Success

- **Primary Metric**: "Change Failure Rate for this feature is 0%."
- **Secondary Metrics**: "Decommission the need for manual array pre-slicing in services that use the template engine, reducing boilerplate code."
