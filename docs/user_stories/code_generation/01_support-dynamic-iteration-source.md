# Story 20: Support Dynamic Iteration Source for Generic Reports

- **Project**: `template-engine-ts`
- **Status**: `verified completed`
- **As a** Data Analyst,
- **I want to** create a single, generic report template where the data source can be switched with a single variable (e.g., `report_source`),
- **so that** I can generate different reports (like "monthly sales" or "user activity") without duplicating template logic, which saves time and reduces errors.

## Acceptance Criteria

- The system must correctly iterate over an array when its name is dynamically constructed from a variable (e.g., `<[<#report_source#>]>`).
- Given a `report_source` variable with the value `"user_activity_logs"`, the template must iterate over the `user_activity_logs` array in the data context.
- The iteration variables (e.g., `<#user_activity_logs.index#>`) must be correctly populated using the resolved array name.
- The final rendered output must match the expected report format for the dynamically selected data source.

## Metrics for Success

- **Primary Metric**: "Reduce time to generate a new type of report using an existing template by 90%."
- **Secondary Metrics**: "Increase template reusability, leading to a 50% reduction in the number of similar-but-distinct report templates."
