# Story 12: Add VS Code Syntax Highlighting

- **Project**: `template-engine-ts`
- **Status**: `todo`
- **As a** Developer / Template Author,
- **I want to** have syntax highlighting for our template files in VS Code,
- **so that** I can write, read, and debug templates more easily and efficiently, reducing errors and improving productivity.

## Acceptance Criteria

- A VS Code extension is created (or a configuration is provided) that recognizes our template file types (e.g., `.tmpl`, `.tpl` or a new suggested extension like `.mge`).
- The extension provides accurate syntax highlighting for all our templating constructs, including:
  - Literal text
  - Variables (`<#...#>`, `<##...##>`)
  - Expressions (`<~...~>`)
  - Conditional tags (`<+>`, `<->`, `<?...?>`)
  - Cross-product tags (`<*>` `<*?...:..>`)
  - Function calls (`<{...}>`)
- The highlighting should visually differentiate between template logic/variables and plain text content.
- Clear installation instructions for the VS Code extension are added to the project's developer documentation (e.g., in a new `docs/tooling/README.md` or updated `README.md`).

## Metrics for Success

- **Primary Metric**: "Achieve a 15% reduction in template-related syntax errors caught during code review or CI."
- **Secondary Metrics**: "Developer survey feedback indicates an average score of 4.5/5 or higher for 'Ease of editing template files in VS Code'."
