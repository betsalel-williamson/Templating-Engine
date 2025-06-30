# Story 0: PoC - Validate Pkl Feature Parity for Critical Recipes

- **Project**: `template-engine-ts` (transitional)
- **Status**: `verified completed`
- **As a** Principal Engineer,
- **I want to** migrate our two most complex recipes (Dynamic SQL Generation, Multi-Env K8s Config) to Pkl,
- **so that** we can validate that Pkl provides equivalent or superior functionality to our legacy engine's key features (conditional delimiters, deep indirection) before committing to a full migration.

## Acceptance Criteria

- A Pkl template and data file are created that reproduce the output of `docs/recipes/01-dynamic-sql-generation.result`.
- A Pkl template and data file are created that reproduce the output of `docs/recipes/02-multi-env-config.result`.
- The Pkl solution for Recipe 01 must be more readable and maintainable than the legacy `<*?delimiter:terminator>` syntax.
- The Pkl solution for Recipe 02 must be more readable and maintainable than the legacy `<##<#env#>-key##>` syntax.
- The Pkl solutions must be evaluated using the standard `pkl eval` command.

## Metrics for Success

- **Primary Metric**: "Confidence in Pkl's ability to replace our legacy engine is rated >= 4.5/5 by the engineering team after reviewing the PoC."
- **Secondary Metrics**: "Time to implement the PoC is less than 4 hours, demonstrating rapid development and ease of use."
