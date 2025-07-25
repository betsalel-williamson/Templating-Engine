---
title: 'Implement Basic Array Filters'
project_name: template-engine-ts
epic_name: modern_syntax_migration
story_id: 12
labels: modern_syntax
status: todo
date_created: 2025-07-13T00:00:00-07:00
date_verified_completed: 
touched: *
---

- **As a** Developer working with lists of data,
- **I want to** use filters like `length`, `first`, and `last` on my arrays,
- **so that** I can easily query array properties for display logic (like summaries) without needing to write loops or pre-calculate values.

## Acceptance Criteria

- Following the new pluggable architecture:
- A `length.ts` file must be created in `src/filters/`. `{{ my_array | length }}` must produce the number of items. This explicitly replaces the legacy `.length` property access.
- A `first.ts` file must be created in `src/filters/`. `{{ my_array | first }}` must return the first element.
- A `last.ts` file must be created in `src/filters/`. `{{ my_array | last }}` must return the last element.
- Each new filter file must be correctly registered in `src/filters/index.ts`.
- The filters must handle empty or non-array inputs gracefully (e.g., return 0 for length, or an empty string).
- Each filter must have dedicated unit tests.

## Metrics for Success

- **Primary Metric**: "Provide a clear, superior replacement for the legacy `.length` property access, unblocking future deprecation."
- **Secondary Metrics**: "Zero regressions in existing array-based iteration logic."
