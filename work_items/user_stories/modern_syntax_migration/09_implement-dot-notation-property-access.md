---
title: 'Implement Dot Notation Property Access'
project_name: template-engine-ts
epic_name: modern_syntax_migration
story_id: 09
labels: modern_syntax
status: todo
date_created: 2025-07-13T00:00:00-07:00
date_verified_completed: 
touched: *
---

- **As a** Developer using nested data,
- **I want to** access properties of objects using dot notation, like `{{ user.address.city }}`,
- **so that** I can work with complex, structured data in a natural and intuitive way that mirrors modern programming languages.

## Acceptance Criteria

- The evaluator must be able to resolve a variable like `user.address.city`.
- The evaluator must traverse a chain of nested `Map` objects to find the final value.
- If any part of the path is invalid or does not exist, the expression must evaluate to an empty string (or be handled by a `default` filter later).
- The implementation must not break simple variable access (e.g., `{{ user }}`).
- Unit tests must validate successful deep access and graceful failure for invalid paths.

## Metrics for Success

- **Primary Metric**: "Achieve 100% test coverage for the dot-notation resolution logic."
- **Secondary Metrics**: "Reduce template complexity, measured by a 10% decrease in the need for data pre-flattening in host applications."
