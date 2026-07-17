# Standalone CLI binaries

Build a self-contained executable (Node.js SEA) for the CLI package on **Linux** or **macOS**:

```bash
pnpm --filter @bwilliamson/template-engine-cli run build:standalone:linux
pnpm --filter @bwilliamson/template-engine-cli run build:standalone:macos
```

Artifacts are written to `packages/template-engine-cli/dist/` (`template-engine-linux` or `template-engine-macos`). Binaries are published separately via the `release-binaries` workflow as `template-engine-v*-{linux,macos}` on GitHub Releases.

Windows is not part of the standalone release matrix. Windows users should use the npm-published CLI. Decision and restore criteria are in [ADR-003: Retire Windows SEA and CI](../features/architecture/adr-003-retire-windows-sea-ci.md).

Release artifacts are **not** Apple-signed or notarized. macOS users may see a Gatekeeper warning on first launch; the safe one-time **Control-click → Open** workaround is documented in the [CLI client guide](../client/cli.md#macos-gatekeeper).
