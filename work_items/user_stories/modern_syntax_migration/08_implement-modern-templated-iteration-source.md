---
title: 'Implement Modern Templated Iteration Source'
project_name: template-engine-ts
epic_name: modern_syntax_migration
story_id: 08
labels: modern_syntax
status: todo
date_created: 2025-07-13T00:00:00-07:00
date_verified_completed: 
touched: *
---

- **As a** Developer building highly generic templates,
- **I want to** construct the name of an array to iterate over using a mix of variables and literals (e.g., `{% for item in {{ prefix }}_data %}`),
- **so that** I can dynamically select data sources based on complex naming conventions without pre-computing the array name in the host application.

## Acceptance Criteria

- The `{% for ... in ... %}` iteration source must support a nested expression that evaluates to the final array name string (e.g., `{% for item in {{ var_prefix }}_list %}`).
- The evaluator must first evaluate the nested expression within the `for` loop's `in` clause to get the final array name.
- A template like `{% for user in {{ entity }}_list %}` with context `{ entity: 'users' }` must correctly resolve the array name to "users_list" and iterate over that array.
- Unit tests must validate this complex dynamic source capability for the new syntax.

## Metrics for Success

- **Primary Metric**: "Rework Rate for this feature is 0%."
- **Secondary Metrics**: "This feature unlocks more advanced dynamic template patterns, reducing the logic required in the calling code."
