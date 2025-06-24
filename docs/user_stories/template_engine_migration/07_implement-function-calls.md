# Story 7: Implement Function Calls

- **Project**: `template-engine-ts`
- **As a** Developer creating dynamic content,
- **I want to** call a registered JavaScript function from within a template (e.g., `<{now()}>`),
- **so that** I can incorporate runtime-generated data like the current timestamp or perform simple data transformations without complex pre-processing.

## Acceptance Criteria

-   The grammar must be updated to parse `<{functionName(arg1,arg2,...)}>` into a `FunctionCallNode`.
-   The evaluator's `evaluate` function must accept a `FunctionRegistry` map as an argument. This is the **only** source of executable functions.
-   When a `FunctionCallNode` is encountered, the evaluator must execute the corresponding registered function from the provided registry.
-   Arguments passed to the function within the template can be literals or variables, and must be fully evaluated before the function is called.
-   The return value of the function must be injected into the template output.
-   The system must throw a clear error if a template calls a function that is not present in the `FunctionRegistry`.

## Security Considerations

This feature introduces a potential code execution vector. The following principles are **mandatory**:

-   **SAFE BY DEFAULT**: The template engine itself MUST NOT include any built-in functions that interact with the file system, network, or shell. It must be a pure data transformation engine.
-   **EXPLICIT REGISTRATION AS A SECURITY GATE**: The `FunctionRegistry` is a security boundary. Only functions explicitly added to this registry by the host application can be called. There is no other mechanism for executing code.
-   **HOST APPLICATION RESPONSIBILITY**: The developer of the host application is 100% responsible for the security of the functions they choose to register. A function that executes `eval()` or `child_process.exec()` on its input creates a vulnerability in the *host application*, not the template engine.
-   **FUNCTION-LEVEL SANITIZATION**: Registered functions are responsible for validating and sanitizing their own arguments. The engine's role is only to deliver the evaluated arguments to the function.

## Metrics for Success

- **Primary Metric**: Achieve feature parity with the legacy engine's function call capability, unblocking migration of templates that use this feature.
- **Secondary Metrics**: Increase test coverage of the evaluator module by at least 5%, with specific tests covering the unregistered function error case.
