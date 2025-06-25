# Story 13: Implement Advanced `reduce` Filter

- **Project**: `template-engine-ts`
- **Status**: `todo`
- **As a** Developer performing complex data aggregation,
- **I want to** use a `reduce` filter to perform calculations over an array, like summing a list of item prices,
- **so that** I can handle advanced data transformations directly within the template, demonstrating the power and orthogonality of the filter architecture.

## Acceptance Criteria

- The system must provide a `reduce` filter that can be applied to an array.
- The filter must accept two arguments: an `initial_value` for the reduction and a `reducer_template` provided as a string.
- For each item in the input array, the filter must evaluate the `reducer_template`.
- During the evaluation of the `reducer_template`, two special variables must be available in a temporary context:
  - `accumulator`: The value returned from the previous iteration, or the `initial_value` on the first iteration.
  - `current`: The current item being processed from the input array.
- The final result of the last evaluation must be the output of the filter.
- The filter's behavior must be verifiable against the following example:
  - **Context:** `{ items: [ { price: 10 }, { price: 20 }, { price: 5 } ] }`
  - **Template:** `{{ items | reduce:0:'{{ accumulator | add:current.price }}' }}`
  - **Expected Output:** `35`
- The implementation must include comprehensive unit tests covering the specified example and edge cases such as empty arrays.

## Metrics for Success

- **Primary Metric**: "Prove the extensibility of the filter architecture by implementing a higher-order function, with 100% test coverage."
- **Secondary Metrics**: "This implementation must not require any changes to the core evaluator loop, only the addition of a new filter to the registry."
