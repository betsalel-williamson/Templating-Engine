# Security

Template function calls are powerful and must be constrained in host applications.

## CLI

The CLI ships with an **empty** function registry. Templates cannot invoke host I/O through built-in functions.

## Core library

Use `createSecureEvaluator` and register only the functions your application needs. Read the [secure templating guide](../features/architecture/secure_templating_guide.md) before registering functions that touch files, network, or shell.

## Evaluation limits

- **Max evaluation depth** (default 50) prevents runaway recursion.
- **Circular indirect references** (`<##...##>`) are detected and reported with the cycle path.

See [template language](./template-language.md) for syntax-level safety notes.
