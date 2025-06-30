# Story 19: Support Multi-line Templates for Complex Code Generation

- **Project**: `template-engine-ts`
- **Status**: `verified completed`
- **As a** Developer generating a complex SQL script,
- **I want to** define a multi-line template that generates a list of values with correct delimiters,
- **so that** I can generate syntactically correct, human-readable code from a single template, adhering to the DRY principle.

## Acceptance Criteria

- The system must correctly parse a template string that spans multiple lines.
- A template containing nested SubTemplate blocks (e.g., `<`...`>`) inside a CrossProductNode (`<~...~>`) must evaluate correctly.
- The engine must successfully generate a comma-separated list of SQL values without a trailing comma, using a multi-line template.
- The final output must match the expected, correctly formatted SQL script, preserving newlines and indentation from the template.

## Metrics for Success

- **Primary Metric**: "Reduce the time required for a developer to create a complex code-generation template (like the SQL example) by 25%."
- **Secondary Metrics**: "Achieve a 90% 'ease of use' score in developer feedback for multi-line template creation."
