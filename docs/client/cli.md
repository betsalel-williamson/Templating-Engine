# CLI

`@bwilliamson/template-engine-cli` renders [legacy syntax](../glossary/legacy-syntax.md) templates with JSON [data context](../glossary/data-context.md). Prepare data in the JSON file before render — the CLI does not run host JavaScript/TypeScript or register template functions.

## Install

```bash
npm install -g @bwilliamson/template-engine-cli
```

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

## Standalone binary

Pre-built executables for **Linux** and **macOS** are published on [GitHub Releases](https://github.com/betsalel-williamson/Templating-Engine/releases) as `template-engine-v*-linux` and `template-engine-v*-macos`. Use the same flags as the npm-installed CLI.

**Windows:** There is no published Windows standalone binary. Install and run the CLI via npm (`npm install -g @bwilliamson/template-engine-cli`). See [ADR-003](../features/architecture/adr-003-retire-windows-sea-ci.md).

### macOS Gatekeeper

macOS may block the downloaded macOS binary on first launch because it is **not** signed or notarized with Apple. Gatekeeper shows that the developer cannot be verified.

To grant a **one-time exception** for that file:

1. In Finder, **Control-click** (or right-click) the downloaded `template-engine-v*-macos` file.
2. Choose **Open**.
3. Click **Open** in the confirmation dialog.

After that, macOS allows the same file to run from Terminal or Finder without repeating the workaround. Installing via npm avoids this prompt.

Maintainers: build steps and release workflow are in [standalone CLI binaries](../developer/standalone-cli-binaries.md).
