# Story 5: Implement Conditional Replacement

- **Project**: `template-engine-ts`
- **As a** Developer,
- **I want to** use conditional blocks of the form `<+true_branch<->false_branch<?condition?>>` to control template output,
- **so that** I can implement basic control flow within my templates.

## Acceptance Criteria

-   The grammar must parse the full conditional structure into a `ConditionalNode` with `trueBranch`, `falseBranch`, and `condition` ASTs.
-   The evaluator must first evaluate the `condition` part of the node.
-   If the result of the `condition` is not "0" and not an empty string, the `trueBranch` is evaluated and returned.
-   If the result of the `condition` is "0" or an empty string, the `falseBranch` is evaluated and returned.
-   The branches and condition themselves can contain nested expressions which must be evaluated correctly.
-   Unit tests must cover both the true and false paths.

## Metrics for Success

- **Primary Metric**: Rework Rate for this feature is 0%.
- **Secondary Metrics**: This feature unlocks the ability to replicate more complex legacy templates, accelerating the migration.
