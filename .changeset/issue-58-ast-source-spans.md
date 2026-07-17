---
'@bwilliamson/template-engine-core': minor
---

AST nodes now carry optional parse-time source spans (`location`), and unknown-filter evaluation errors on modern syntax can be formatted with `formatTemplateEvaluationError` using the same path:line:column caret layout as parse diagnostics.
