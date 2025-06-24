# Recipe 3: Generic Report with Dynamic Data Source

## Use Case
You need a single, generic template to generate reports, but the data source might change. For example, one run might display "monthly sales," while the next displays "user activity logs."

## Key Feature: Templated Array Names (`<[<#...#>]>`)

This engine allows the name of the array in a cross-product loop to be generated from a variable or expression. This lets you switch the entire data source for a loop by changing a single variable.

This powerful feature allows for creating highly reusable, data-agnostic components.
