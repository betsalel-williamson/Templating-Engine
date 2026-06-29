# Local setup

```bash
git clone https://github.com/betsalel-williamson/Templating-Engine.git
cd Templating-Engine
pnpm install
```

Requires Node.js >= 22.12.0 (see `.nvmrc`). **mdcp documentation commands** (`pnpm docs:*`) require Node.js >= 24 because `@bwilliamson/mdcp-cli@0.4.1` enforces that engine range.

```bash
pnpm run build
pnpm run test
```
