# Story 8: Implement Array Slicing for Cross-Products

- **Project**: `template-engine-ts`
- **As a** Developer building a paginated list,
- **I want to** apply a template to a specific slice of a data array using a `{offset,limit}` syntax (e.g., `<~{10,20}...~>`),
- **so that** I can generate content for a single page of results without modifying the source data array.

## Acceptance Criteria

- The grammar for `CrossProductBody` must be updated to optionally parse a slicing expression like `{offset,limit}`.
- Supported formats: `{limit}` (from start), `{offset,limit}`.
- The evaluator must correctly slice the target array before starting iteration.
- If the slice range is out of bounds, the evaluator should handle it gracefully (e.g., iterate over fewer items, or none).
- The special `numberofelements` variable within the loop context must reflect the length of the *original* array, not the slice, for accurate pagination display (e.g., "Showing 10-20 of 100").
- Unit tests must validate slicing with `{limit}`, `{offset,limit}`, and out-of-bounds cases.

## Metrics for Success

- **Primary Metric**: Change Failure Rate for this feature is 0%.
- **Secondary Metrics**: Decommission the need for manual array pre-slicing in services that use the template engine, reducing boilerplate code.
