# Recipe 2: Multi-Environment Kubernetes ConfigMap

## Use Case

You need to manage configuration files (e.g., a Kubernetes `ConfigMap`) for multiple environments (`dev`, `staging`, `prod`). The structure is identical, but the values differ. Maintaining separate files violates the DRY principle.

## Key Feature: Deep Indirection (`<##...##>`)

Deep indirection allows a variable's *value* to become the *name* of the next variable to look up. By setting a single `env` variable, we can make the entire template pull from a different set of configuration values.

This "data as metadata" approach is a powerful differentiator, enabling highly dynamic and generic templates that adapt based on a single high-level switch.

Template: `API_URL: <##<#env#>-api-url##>`
If `env` is `prod`, this resolves as:

1. `<#env#>` -> `"prod"`
2. `<##prod-api-url##>` -> (looks up the key `prod-api-url`) -> `"https://api.myapp.com"`
