# CLI

`@bwilliamson/template-engine-cli` renders [legacy syntax](../glossary/legacy-syntax.md) templates with JSON [data context](../glossary/data-context.md).

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

Rendered output goes to stdout. Errors (including parse failures with source location) go to stderr.

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

**Standalone binary:** See [standalone CLI binaries](../developer/standalone-cli-binaries.md) in the developer guide.
