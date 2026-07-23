# Template → TypeScript codegen patterns

| Output file                 | Template                         | Context                                              |
| --------------------------- | -------------------------------- | ---------------------------------------------------- |
| `src/generated/help.ts`     | `templates/help.ts.template`     | `title`, `commands[]` with `name`, `args`, `summary` |
| `src/generated/dispatch.ts` | `templates/dispatch.ts.template` | `commands[]` with `name`, `op`, `handler`            |
| SQL file                    | `*.template`                     | rows to INSERT (recipe 01)                           |

**Rule:** template output is **TypeScript source text** written to disk by `scripts/codegen.mjs`, then compiled. Runtime CLI imports generated modules only.

Minimal codegen driver shape:

```javascript
// scripts/codegen.mjs — imports core, reads templates, writes src/generated/*.ts
```

See `packages/template-engine-core/recipes/01-dynamic-sql-generation.md` for the same expand-from-data idea (SQL instead of TS).
