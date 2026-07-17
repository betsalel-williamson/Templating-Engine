---
'@bwilliamson/template-engine-core': patch
---

Max evaluation depth errors now carry source spans when the failing AST node has parse-time location metadata, and can be formatted with `formatTemplateEvaluationError` using the same path:line:column caret layout as other evaluation diagnostics.
