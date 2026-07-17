# ADR-005: Retire All SEA CLI Binaries

- **Status**: Accepted
- **Date**: 2026-07-17
- **Supersedes**: [ADR-003: Retire Windows SEA and CI](./adr-003-retire-windows-sea-ci.md)

## Context and Problem Statement

The project published Node.js Single Executable Application (SEA) CLI binaries on GitHub Releases for Linux and macOS, and previously for Windows. [ADR-003](./adr-003-retire-windows-sea-ci.md) already retired Windows SEA and Windows CI verify because npm covered that platform without demonstrated binary demand.

Linux and macOS SEA artifacts, the `release-binaries` workflow, and maintainer SEA build scripts remain. They add release and packaging cost without proportional consumer value. Install and run via npm or npx (`@bwilliamson/template-engine-cli` / `template-engine`) already works on every supported platform under Node.js.

We need to decide whether to keep paying for unused SEA packaging, or retire the entire SEA surface until a real user needs dependency-free native binaries.

## Decision Drivers

- **User need:** CLI usage is covered by the npm package and npx; no demonstrated demand for SEA binaries on any platform.
- **Maintenance cost:** SEA scripts, postject, release matrix, and Gatekeeper workarounds are unused overhead.
- **Honesty in docs:** Client and maintainer docs must describe the install path we actually support.
- **Reversibility:** SEA workflow and scripts can be restored from git history when demand appears.

## Considered Options

1. **Keep Linux and macOS SEA as-is** — continue shipping unused GitHub Release binaries.
2. **Stop publishing but keep local build scripts** — leave dead maintainer surface.
3. **Full retire until demand** — remove the release workflow and all SEA build scripts; document npm/npx as the sole CLI install path.

## Decision Outcome

**Chosen option: "Full retire until demand".**

- Do not build or attach SEA binaries on GitHub Releases for any platform.
- Remove SEA build scripts, config, and SEA-only dependencies from the CLI package.
- Document npm/npx as the supported CLI install path on all platforms.
- Restore SEA packaging when a user demonstrates need for dependency-free native binaries.

## Consequences

- **Positive:** One clear install story; less release surface; docs match shipped behavior.
- **Negative:** No fresh platform binaries on new releases; contributors must not assume a `release-binaries` workflow.
- **Mitigation:** npm and npx remain the cross-platform install path.

## Restore from prior implementation

When a user needs SEA again, start from the pre-retirement tree rather than reinventing the scripts and workflow wiring.

| Pointer                                                                                                                                                                                                | Use                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Issue [#97](https://github.com/betsalel-williamson/Templating-Engine/issues/97)                                                                                                                        | Scope, acceptance criteria, and why we retired all SEA                               |
| PR [#98](https://github.com/betsalel-williamson/Templating-Engine/pull/98)                                                                                                                             | Diff that removed SEA CI/release/scripts; invert that change as the restore baseline |
| [ADR-003](./adr-003-retire-windows-sea-ci.md) / [#79](https://github.com/betsalel-williamson/Templating-Engine/issues/79) / [PR #84](https://github.com/betsalel-williamson/Templating-Engine/pull/84) | Prior Windows-only retire slice and restore notes                                    |
| Parent of the full-retire commit on `main` (after merge)                                                                                                                                               | Last revision that still contained Linux/macOS SEA paths                             |

Surfaces to recover from that history:

- `.github/workflows/release-binaries.yml`
- `packages/template-engine-cli` — `build:standalone:*`, SEA bundle/blob scripts, `sea-config.json`, `scripts/build-sea-*.sh`, and SEA-only deps
- Client/developer docs that described GitHub Release binaries and Gatekeeper workarounds

After restore, update this ADR’s status (or supersede it) so docs again match shipped platforms.
