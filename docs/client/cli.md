# CLI

`@bwilliamson/template-engine-cli` renders [legacy syntax](../glossary/legacy-syntax.md) templates with JSON [data context](../glossary/data-context.md). Prepare data in the JSON file before render — the CLI does not run host JavaScript/TypeScript or register template functions.

## Install

```bash
npm install -g @bwilliamson/template-engine-cli
# or without a global install:
npx @bwilliamson/template-engine-cli --template template.txt --data data.json
```

npm and npx are the supported install paths on all platforms. See [ADR-005](../features/architecture/adr-005-retire-sea-binaries.md).

## Usage

```bash
template-engine --template template.txt --data data.json
cat template.txt | template-engine --data data.json
template-engine --help
```

## Options

| Flag                | Required | Description                             |
| ------------------- | -------- | --------------------------------------- |
| `--data <file>`     | Yes      | JSON file for the template data context |
| `--template <file>` | No       | Template file; reads stdin when omitted |
| `--help`            | No       | Show usage                              |

Rendered output goes to stdout. Parse and evaluation errors go to stderr.

## Parse errors

Syntax errors use compiler-style diagnostics: message, `path:line:column`, the source line, and a caret. The CLI passes the `--template` path (or `<stdin>` when reading from stdin) as the source label. These diagnostics are designed to be self-contained; pasting them into an LLM prompt is typically sufficient for an AI assistant to fix the syntax issue.

Example (`template.txt` line 2 is malformed):

```text
Error: Expected end of input but "<" found.
 --> template.txt:2:12
  |
2 | This is an <#malformed
  |           ^
```

Integrators embedding the library should follow the same pattern via `formatTemplateParseError` — see [core library](./core-library.md) and [Parse diagnostics](../features/architecture/parse_diagnostics.md).

## Example

### data.json

```json
{ "name": "World" }
```

### template.txt

```txt
Hello, <#name#>!
```

```bash
template-engine --template template.txt --data data.json
# Hello, World!
```

## Behavior notes

**Stdin:** The CLI reads the entire stdin stream before parsing. If the stream closes mid-tag, parsing fails with a syntax error.

**Functions:** The CLI registers no template functions. Use the core library when custom functions are required.
