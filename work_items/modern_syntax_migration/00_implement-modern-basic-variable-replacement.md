# Story 0: Implement Modern Basic Variable Replacement

- **Project**: `template-engine-ts`
- **Status**: `verified completed`
- **As a** Developer writing a configuration file,
- **I want to** substitute a placeholder like `{{ hostname }}` with a value from a data context,
- **so that** I can create a single template for multiple environments (e.g., dev, prod) and just change the data, applying the DRY principle to my configuration.

## Acceptance Criteria

- A template containing `{{ name }}` with a context `new Map([['name', 'World']])` must produce output with `World` in its place.
- A template containing a variable not present in the context, like `{{ missing }}`, must leave the placeholder unchanged in the final output.
- The implementation must include unit tests covering both successful replacement and missing variables, utilizing the new parser.
- The new Peggy grammar (`src/grammar_new.peggy`) must correctly identify and parse `Literal` and `Variable` nodes for `{{...}}` syntax.
- The evaluator must correctly process these nodes from the AST.

## Metrics for Success

- **Primary Metric**: "Achieve >95% unit test coverage for `VariableNode` and `LiteralNode` evaluation logic for the new syntax."
- **Secondary Metrics**: "Ease of use feedback from initial adopters is positive (e.g., 'easy to understand')."
