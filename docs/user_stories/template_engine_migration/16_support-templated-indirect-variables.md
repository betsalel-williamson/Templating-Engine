# Story 16: Support Templated Names in Indirect Variables

- **Project**: `template-engine-ts`
- **Status**: `todo`
- **As a** DevOps Engineer,
- **I want to** construct the key for an indirect variable lookup using a nested template (e.g., `<##<#env#>-db-host##>`),
- **so that** I can create a single, highly reusable configuration template that dynamically selects values for different environments based on a single `env` variable.

## Acceptance Criteria

- The grammar must be updated to parse a nested template within an `IndirectVariable` tag (`<##...##>`).
- The `IndirectVariableNode` in the AST must be updated to hold a `TemplateNode` for its name.
- The evaluator must first evaluate the nested template to resolve the key's name, then perform the indirect lookup using that resolved name.
- A template like `<##<#env#>-config##>` with context `{ env: 'prod' }` must first resolve the key to `"prod-config"` and then look up the value for `"prod-config"`.
- Unit tests must be created to validate this new capability.

## Metrics for Success

- **Primary Metric**: "Unblock the 'Multi-Environment Kubernetes ConfigMap' recipe, enabling its successful execution."
- **Secondary Metrics**: "Reduce configuration file duplication by 75% for projects adopting this pattern."
