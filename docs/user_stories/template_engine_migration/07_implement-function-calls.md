# Story 7: Implement Function Calls

- **Project**: `template-engine-ts`
- **As a** Developer creating dynamic content,
- **I want to** call a registered JavaScript function from within a template (e.g., `<{now()}>`),
- **so that** I can incorporate runtime-generated data like the current timestamp or perform simple data transformations without complex pre-processing.

## Acceptance Criteria

-   The grammar must be updated to parse `<{functionName(arg1,arg2,...)}>` into a `FunctionCallNode`.
-   The evaluator must support a mechanism to register named, asynchronous JavaScript functions.
-   When a `FunctionCallNode` is encountered, the evaluator must execute the corresponding registered function.
-   Arguments passed to the function within the template can be literals or variables, and must be evaluated before the function is called.
-   The return value of the function must be injected into the template output.
-   The system must throw a clear error if a template calls a function that is not registered.
-   Unit tests must cover successful function calls (with and without arguments) and the error case for unregistered functions.

## Metrics for Success

- **Primary Metric**: Achieve feature parity with the legacy engine's function call capability, unblocking migration of templates that use this feature.
- **Secondary Metrics**: Increase test coverage of the evaluator module by at least 5%.
