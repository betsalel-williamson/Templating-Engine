---
'@bwilliamson/template-engine-core': patch
---

Unregistered function errors now carry source spans when the function call AST node has parse-time location metadata, and can be formatted with `formatTemplateEvaluationError` using the same path:line:column caret layout as other evaluation diagnostics.
