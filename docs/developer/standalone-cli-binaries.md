# Standalone CLI binaries

Build a self-contained executable (Node.js SEA) for the CLI package:

```bash
pnpm --filter @bwilliamson/template-engine-cli run build:standalone:linux
pnpm --filter @bwilliamson/template-engine-cli run build:standalone:macos
pnpm --filter @bwilliamson/template-engine-cli run build:standalone:windows
```

Artifacts are written to `packages/template-engine-cli/dist/` (`template-engine-linux`, `template-engine-macos`, or `template-engine-win.exe`). Binaries are published separately via the `release-binaries` workflow as `template-engine-v*-{linux,macos,win.exe}` on GitHub Releases.

Release artifacts are **not** Apple-signed or notarized. macOS users may see a Gatekeeper warning on first launch; the safe one-time **Control-click → Open** workaround is documented in the [CLI client guide](../client/cli.md#macos-gatekeeper).
