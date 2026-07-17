---
'@bwilliamson/template-engine-core': patch
---

Circular alias evaluation errors on modern syntax now carry source spans and can be formatted with `formatTemplateEvaluationError` using the same path:line:column caret layout as parse diagnostics and unknown-filter errors.
