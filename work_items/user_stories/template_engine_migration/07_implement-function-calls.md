---
title: 'Implement Function Calls'
project_name: template-engine-ts
epic_name: template_engine_migration
story_id: 07
labels: legacy_syntax
status: verified completed
date_created: 2025-07-13T00:00:00-07:00
date_verified_completed: 
touched: *
---

- **As a** Developer creating dynamic content,
- **I want to** call a registered JavaScript function from within a template (e.g., `<{now()}>`),
- **so that** I can incorporate runtime-generated data like the current timestamp or perform simple data transformations without complex pre-processing.

## Acceptance Criteria

- The grammar must be updated to parse `<{functionName(arg1,arg2,...)}>` into a `FunctionCallNode`.
- The evaluator's `evaluate` function must accept a `FunctionRegistry` map as an argument. This is the **only** source of executable functions.
- When a `FunctionCallNode` is encountered, the evaluator must execute the corresponding registered function from the provided registry.
- Arguments passed to the function within the template can be literals or variables, and must be fully evaluated before the function is called.
- The return value of the function must be injected into the template output.
- The system must throw a clear error if a template calls a function that is not present in the `FunctionRegistry`.

## Metrics for Success

- **Primary Metric**: "Achieve feature parity with the legacy engine's function call capability, unblocking migration of templates that use this feature."
- **Secondary Metrics**: "Increase test coverage of the evaluator module by at least 5%, with specific tests covering the unregistered function error case."
