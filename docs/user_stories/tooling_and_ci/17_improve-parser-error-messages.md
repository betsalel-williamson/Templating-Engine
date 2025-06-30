# Story 17: Improve Parser Error Messages with Line and Column Numbers

- **Project**: `template-engine-ts`
- **Status**: `in-progress`
- **As a** Developer / Template Author,
- **I want to** see the exact file, line, column, and source code context when a template syntax error occurs,
- **so that** I can immediately locate and fix the error, improving my productivity and reducing debugging time.

## Acceptance Criteria

- When the CLI encounters a template with a syntax error, the error message written to `stderr` must be in a rich, multi-line format.
- The error message must include the file path, line, and column number in an IDE-clickable format.
- The error message must include the line of source code from the template where the error occurred.
- The error message must include a pointer (`^`) on a new line, precisely aligned with the column where the error was detected.
- The `runCli` function must be updated to read the template content and format this detailed error message.
- The unit test in `test/cli.test.ts` must be updated to assert the full multi-line error format for a malformed template.

## Metrics for Success

- **Primary Metric**: "Developer survey feedback on 'ease of debugging templates' improves by at least 1 point on a 5-point scale."
- **Secondary Metrics**: "Rework Rate on template-related commits decreases by 5% as developers can identify and fix syntax errors more effectively before committing."
