---
title: 'Implement Modern Conditional Logic'
project_name: template-engine-ts
epic_name: modern_syntax_migration
story_id: 04
labels: modern_syntax
status: todo
date_created: 2025-07-13T00:00:00-07:00
date_verified_completed: 
touched: *
---

- **As a** Developer generating a user profile display,
- **I want to** show an "Admin" badge using `{% if ... %}` and `{% else %}` blocks based on a user's `isAdmin` property,
- **so that** I can render different UI components based on data without creating separate templates or writing complex display logic in the host language.

## Acceptance Criteria

- The new grammar must parse `{% if condition %}`, `{% else %}` (optional), and `{% endif %}` structures.
- The evaluator must first evaluate the `condition` part of the node.
- If the result of the `condition` is truthy (non-empty string, non-zero string, `true`), the `if` block is evaluated.
- Otherwise, if an `else` block exists, it is evaluated.
- The blocks and condition themselves can contain nested expressions which must be evaluated correctly.
- Unit tests must cover true/false paths, with and without `else` blocks, and with various truthy/falsy condition values.

## Metrics for Success

- **Primary Metric**: "Rework Rate for templates using conditional logic is 0%."
- **Secondary Metrics**: "This feature unlocks the ability to replicate more complex legacy templates, accelerating the migration."
