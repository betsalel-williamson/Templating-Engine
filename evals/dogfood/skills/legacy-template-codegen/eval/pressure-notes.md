# RED pressure notes (Arm A / no skill)

1. **String concat help** — building usage by concatenating lines in a loop instead of a template over a registry.
2. **Logic in templates** — putting `eval` expression parsing inside `.template` files.
3. **Fake template use** — one static `.template` with no context variables.
4. **Modern syntax** — using `{{ }}` / `parseModern` on a legacy-only task.
5. **Scope creep** — adding unrelated packages or moving CLI outside allowlist.

Arm B should avoid these while still using real templates for help + runtime output.
