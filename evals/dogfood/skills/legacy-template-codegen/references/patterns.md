# Legacy template patterns (quick reference)

| Goal             | Host prepares                       | Template                                               |
| ---------------- | ----------------------------------- | ------------------------------------------------------ |
| CLI help         | `commands[]` with `name`, `summary` | Iterate `<*><[commands]>` with `<#name#>: <#summary#>` |
| Conditional line | `showHint: true`                    | `<+><?showHint?>Hint: ...<->`                          |
| Joined list      | `items[]`                           | `<~<*?`, `:><#value#><*><[items]>~>`                   |
| Safe function    | register `upper` in `functions` map | `<{upper(<#label#>)}>`                                 |

Canonical recipe: `packages/template-engine-core/recipes/01-dynamic-sql-generation.md`.
