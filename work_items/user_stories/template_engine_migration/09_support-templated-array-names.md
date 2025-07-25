---
title: 'Support Templated Array Names in Cross-Products'
project_name: template-engine-ts
epic_name: template_engine_migration
story_id: 09
labels: legacy_syntax
status: verified completed
date_created: 2025-07-13T00:00:00-07:00
date_verified_completed: 
touched: *
---

- **As a** Developer building highly generic templates,
- **I want to** construct the name of an array to iterate over using a mix of variables and literals (e.g., `<[<#prefix#>-data]>`),
- **so that** I can dynamically select data sources based on complex naming conventions without pre-computing the array name in the host application.

## Acceptance Criteria

- The grammar's `ArrayRule` must be updated to parse a full sub-template within the `<[...]>` brackets.
- The evaluator, when processing a `CrossProductNode`, must first evaluate the template inside the `ArrayRule` to get the final array name as a string.
- A template like `<~<...><*><[<#entity#>_list]>~>` with context `{ entity: 'users' }` must correctly resolve the array name to "users_list" and iterate over that array.
- The implementation must be backward compatible with existing `Ident` and `Variable` array names.
- Unit tests must validate this complex indirection capability.

## Metrics for Success

- **Primary Metric**: "Rework Rate for this feature is 0%."
- **Secondary Metrics**: "This feature unlocks more advanced dynamic template patterns, reducing the logic required in the calling code."
