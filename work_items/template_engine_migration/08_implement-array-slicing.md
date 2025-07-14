# Story 8: Implement Array Slicing for Cross-Products

- **Project**: `template-engine-ts`
- **Status**: `verified completed`
- **As a** Developer building a paginated list,
- **I want to** apply a template to a specific slice of a data array using a `{offset,limit}` syntax (e.g., `{1,10}` for first 10, `{6,5}` for 5 elements starting at element 6),
- **so that** I can generate content for a single page of results without modifying the source data array.

## Acceptance Criteria

- The grammar for `CrossProductBody` must be updated to optionally parse a slicing expression like `{offset,limit}`.
- Supported formats: `{limit}` (from start), `{offset,limit}`.
- **Parity Note**: The `offset` is **1-based**, aligning with the original `mergeEngine` language. The `limit` refers to the number of elements to take.
- The evaluator must correctly slice the target array before starting iteration.
- If the slice range is out of bounds, the evaluator should handle it gracefully (e.g., iterate over fewer items, or none).
- The special iteration variables (`.length`, `.index`, etc.) must reflect the properties of the _original_ array, not the slice.
- Unit tests must validate slicing with `{limit}`, `{offset,limit}`, and out-of-bounds cases, all using **1-based offsets**.

## Metrics for Success

- **Primary Metric**: "Change Failure Rate for this feature is 0%."
- **Secondary Metrics**: "Decommission the need for manual array pre-slicing in services that use the template engine, reducing boilerplate code."
