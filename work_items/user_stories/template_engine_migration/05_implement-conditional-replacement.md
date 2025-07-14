---
title: 'Implement Conditional Replacement'
project_name: template-engine-ts
epic_name: template_engine_migration
story_id: 05
labels: legacy_syntax
status: verified completed
date_created: 2025-07-13T00:00:00-07:00
date_verified_completed: 
touched: *
---

- **As a** Developer generating a user profile display,
- **I want to** show an "Admin" badge using a conditional `<~<+Admin Badge<?<#isAdmin#>?>>~>` only if a user's `isAdmin` property is true,
- **so that** I can render different UI components based on data without creating separate templates or writing complex display logic in the host language.

## Acceptance Criteria

- The grammar must parse the full conditional structure `<~<+true_branch<->false_branch<?condition?>>~>` into a `ConditionalNode`.
- The evaluator must first evaluate the `condition` part of the node.
- If the result of the `condition` is not "0" and not an empty string, the `trueBranch` is evaluated and returned.
- If the result of the `condition` is "0" or an empty string, the `falseBranch` is evaluated and returned.
- The branches and condition themselves can contain nested expressions which must be evaluated correctly.
- Unit tests must cover both the true and false paths, including with optional branches.

## Metrics for Success

- **Primary Metric**: "Rework Rate for this feature is 0%."
- **Secondary Metrics**: "This feature unlocks the ability to replicate more complex legacy templates, accelerating the migration."
