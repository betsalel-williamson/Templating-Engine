# Story 6: Implement Modern Function Calls

- **Project**: `template-engine-ts`
- **Status**: `todo`
- **As a** Developer creating dynamic content,
- **I want to** call a registered JavaScript function from within a template using `{{ functionName(arg1,...) }}` syntax,
- **so that** I can incorporate runtime-generated data like the current timestamp or perform simple data transformations without complex pre-processing.

## Acceptance Criteria

- The new grammar must be updated to parse `{{ functionName(arg1,arg2,...) }}` into a `FunctionCallNode`.
- The evaluator must continue to use the existing `FunctionRegistry` map for function execution.
- Arguments passed to the function within the template can be literals or variables/expressions, and must be fully evaluated before the function is called.
- The return value of the function must be injected into the template output.
- The system must throw a clear error if a template calls a function that is not present in the `FunctionRegistry`.
- **Security**: Adherence to the principles in `docs/secure_templating_guide.md` is paramount. No built-in functions should provide file system, network, or shell access.

## Metrics for Success

- **Primary Metric**: Achieve feature parity with the legacy engine's function call capability, unblocking migration of templates that use this feature.
- **Secondary Metrics**: Increase test coverage of the evaluator module by at least 5% (for new syntax paths), with specific tests covering the unregistered function error case.
