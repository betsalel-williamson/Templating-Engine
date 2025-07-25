---
title: 'Implement Basic Variable Replacement'
project_name: template-engine-ts
epic_name: template_engine_migration
story_id: 00
labels: legacy_syntax
status: verified completed
date_created: 2025-07-13T00:00:00-07:00
date_verified_completed: 
touched: *
---

- **As a** Developer writing a configuration file,
- **I want to** substitute a placeholder like `<#hostname#>` with a value from a data context,
- **so that** I can create a single template for multiple environments (e.g., dev, prod) and just change the data, applying the DRY principle to my configuration.

## Acceptance Criteria

- A template containing `<#name#>` with a context `new Map([['name', 'World']])` must produce output with `World` in its place.
- A template containing a variable not present in the context, like `<#missing#>`, must leave the placeholder unchanged in the final output.
- The implementation must include unit tests covering both successful replacement and missing variables.
- The Peggy grammar must correctly identify and parse `Literal` and `Variable` nodes.
- The evaluator must correctly process `Literal` and `Variable` nodes from the AST.

## Metrics for Success

- **Primary Metric**: "Achieve >90% unit test coverage for `VariableNode` and `LiteralNode` evaluation logic."
- **Secondary Metrics**: "Establish a baseline for Change Lead Time for the new `template-engine-ts` project."
