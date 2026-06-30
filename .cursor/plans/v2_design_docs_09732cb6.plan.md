---
name: V2.1 Design Docs (Mustache/m4 Hybrid)
overview: Create the V2.1 mathematical design documentation shard and integrate it into the MDCP architecture guide.
todos:
  - id: branch
    content: Create feature branch feature/v2.1-mustache-m4-design-docs
    status: completed
  - id: write-shard
    content: Update docs/features/architecture/v2_mathematical_design.md with the new Mustache/m4 Hybrid philosophy
    status: completed
  - id: commit-shard
    content: 'Commit: docs: update v2 mathematical design for mustache/m4 hybrid (v2.1)'
    status: completed
  - id: validate
    content: Run MDCP compile and check commands to validate the documentation
    status: completed
  - id: create-changeset
    content: 'Commit: docs: add changeset for v2.1 mathematical design architecture update'
    status: completed
isProject: false
---

# V2.1 Design Documentation Plan

**WORK_ITEM**: V2.1 Mathematical Design Docs (Mustache/m4 Hybrid)
**WORK_ITEM_LOOKUP**: "v2 design", "mustache m4 hybrid", "mathematical operators"

**End-User Value**:
Provides clear, design-first documentation on how the new template syntax (V2.1) leverages Mustache's logic-less sections and m4's recursive macro expansion, shifting execution logic safely into the TypeScript context while preventing SSTI.

**Workflow Steps**:

- **Branch first**: Create a new feature branch `feature/v2.1-mustache-m4-design-docs`.
- **Revise & write**:
  - Update `[docs/features/architecture/v2_mathematical_design.md](docs/features/architecture/v2_mathematical_design.md)`.
  - Document the core operators relying on TS evaluation instead of custom procedural grammar.
  - Document security architecture and boundaries (`TrustedTemplate`).
- **Atomic Commits**:
  - `docs: update v2 mathematical design for mustache/m4 hybrid (v2.1)`
- **Validate**: Run the MDCP validation commands:
  - `npx mdcp compile --config docs/mdcp.config.json --docs-root docs`
  - `npx mdcp check --config docs/mdcp.config.json --docs-root docs --require-lint --skip-vale`
- **Wrap-up**: Make a final atomic commit for the generated changeset:
  - `docs: add changeset for v2.1 mathematical design architecture update`