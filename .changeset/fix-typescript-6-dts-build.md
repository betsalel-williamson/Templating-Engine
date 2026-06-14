---
'@bwilliamson/template-engine-core': patch
'@bwilliamson/template-engine-cli': patch
---

Fix CI build failure under TypeScript 6 by silencing tsup's deprecated baseUrl injection during DTS generation.
