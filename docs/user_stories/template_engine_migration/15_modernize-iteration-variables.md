# Story 15: Modernize Iteration Variables

- **Project**: `template-engine-ts`
- **As a** Developer,
- **I want to** use modern, intuitive variable names like `<#arrayName.index#>` and `<#arrayName.length#>` within cross-product loops,
- **so that** I can write more readable templates that align with JavaScript/TypeScript conventions, while maintaining backward compatibility for existing templates.

## Acceptance Criteria

-   Within a cross-product loop:
    -   `<#arrayName.index#>` must resolve to the 1-based index of the current element in the *original* array.
    -   `<#arrayName.length#>` must resolve to the total number of elements in the *original* array.
-   The legacy variables (`<#arrayName.elementindex#>` and `<#arrayName.numberofelements#>`) must continue to function exactly as before, providing backward compatibility.
-   Unit tests must be added to verify the functionality of the new `index` and `length` variables.
-   The `README.md` documentation must be updated to recommend the new variable names as the preferred standard, while noting the continued support for the legacy names.

## Metrics for Success

- **Primary Metric**: "Achieve 95% adoption rate of the new iteration variable names in new templates created after this feature's release within one month."
- **Secondary Metrics**: "Zero regressions reported on existing templates that use legacy iteration variables."
