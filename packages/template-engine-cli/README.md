# @bwilliamson/template-engine-cli

Command-line tool for rendering mergeEngine-style templates with JSON data.

> **Pre-1.0:** Expect breaking changes in CLI flags and template syntax until `1.0.0`. Pin exact versions and check release notes before upgrading.

Requires Node.js >= 24.0.

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

### Options

| Flag                | Required | Description                                  |
| ------------------- | -------- | -------------------------------------------- |
| `--data <file>`     | Yes      | JSON file used as the template data context  |
| `--template <file>` | No       | Template file; reads from stdin when omitted |
| `--help`            | No       | Show usage                                   |

Rendered output is written to stdout. Parse and evaluation errors go to stderr with compiler-style line/column diagnostics when syntax is invalid. See [Parse diagnostics](https://github.com/betsalel-williamson/Templating-Engine/blob/main/docs/features/architecture/parse_diagnostics.md).

### Example

**data.json**

```json
{ "name": "World" }
```

**template.txt**

```txt
Hello, <#name#>!
```

```bash
template-engine --template template.txt --data data.json
# Hello, World!
```

## Template language

The CLI uses **legacy syntax** — the same language parsed by `parseLegacy` in `@bwilliamson/template-engine-core`.

| Construct     | Syntax                    | Purpose                                   |
| ------------- | ------------------------- | ----------------------------------------- |
| Variable      | `<#name#>`                | Insert a value from `--data`              |
| Loop          | `<~ ... <*> <[items]> ~>` | Repeat for each array element             |
| Conditional   | `<~<+> ... <?cond?> ~>`   | Render one branch                         |
| Function call | `<{fn(...)}>`             | Not available in the CLI (empty registry) |

See the **[Template Language Reference](https://github.com/betsalel-williamson/Templating-Engine/blob/main/docs/client/template-language.md)** for the complete guide.

## Behavior notes

**Stdin:** The CLI reads the entire stdin stream before parsing. It does not wait for more input when a tag looks incomplete; if the stream closes mid-tag, parsing fails with a syntax error.

**Functions:** The CLI intentionally registers no template functions. For custom functions, use the core library in a host application.

## Links

- [Core library](https://www.npmjs.com/package/@bwilliamson/template-engine-core)
- [Repository](https://github.com/betsalel-williamson/Templating-Engine)
- [Issues](https://github.com/betsalel-williamson/Templating-Engine/issues)
