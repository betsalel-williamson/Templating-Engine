---
'@bwilliamson/template-engine-core': minor
---

docs: update architecture design for V2.1 Mustache/m4 hybrid

Pivoted the V2 mathematical design documentation from a procedural Jinja/Twig architecture to a logic-less Mustache and m4-style recursive macro expansion architecture. This update pushes data transformation logic entirely into the TypeScript runtime context, increasing performance, reducing engine complexity, and enabling seamless integration with live data runtimes. Includes a documented security boundary using `TrustedTemplate` to prevent SSTI and Domain Injection risks.
