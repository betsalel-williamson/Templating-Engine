# Install the MDCP skill pack

## Parent skill

```bash
npx skills add betsalel-williamson/mdcp --skill mdcp
```

That copies the skill into your repo under `.agents/skills/mdcp/` (the install
target).

Zero-install: copy the `mdcp` skill folder into
`.agents/skills/mdcp/` in your repository.

Prefer `.agents/skills/` as the portable install path. Some hosts also discover
`.github/skills/` or `.claude/skills/`.

## After install

The `mdcp` parent skill provides the core system. To perform specific tasks, you should install the helper skills alongside it (e.g., `mdcp-getting-started`, `mdcp-feature-level`, `mdcp-doc-only`, `mdcp-design-architecture`, `mdcp-ux`).

Start a bootstrap session with a natural-language turn under the getting-started helper skill:

```text
/mdcp-getting-started
```

The agent asks for `FEATURE` and
`PERSONA` before installing or writing shards.

Optional archetype skills under `skills/mdcp-arch-*` are WIP and are not part of
the consumer install path yet.

## CLI still required (build, validate, cross-link registry)

The skills rely on the `mdcp` CLI. You need Node.js 18+ and must install
`@bwilliamson/mdcp-cli` globally or locally in your project:

```bash
npm install -g @bwilliamson/mdcp-cli
# or locally
npm install -D @bwilliamson/mdcp-cli
```

This provides the `mdcp` commands for:

- **compile** — build compiled docs from Markdown shards
- **check** — validate the documentation tree (links, structure, optional lint)
- **refs** — inspect/regenerate the cross-link fragment registry
- **fix** — format shards (Prettier / markdownlint auto-fix)
- **prose** — Vale prose lint

```bash
mdcp compile --config <config> --docs-root <docs-root>
mdcp check --config <config> --docs-root <docs-root>
mdcp refs list --config <config> --docs-root <docs-root>
```

Details: `cli-and-scripts.md` in this folder (linked from `SKILL.md`).
