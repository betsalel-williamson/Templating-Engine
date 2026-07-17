# ADR-003: Retire Windows SEA Binaries and CI Verify

- **Status**: Accepted
- **Date**: 2026-07-17

## Context and Problem Statement

The project published Windows standalone CLI binaries (Node.js SEA) and ran a dedicated `build-windows` CI job on every pull request and push to `main`. That job only installed dependencies and ran `pnpm run build` on `windows-latest`.

No current consumer has demonstrated a need for a Windows `.exe` release artifact. Windows users already have a supported path: install and run `@bwilliamson/template-engine-cli` via npm under Node.js. The Windows CI matrix cell and release SEA build add runner time and maintenance cost without proportional user value.

We need to decide whether to keep paying that cost until demand appears, or retire the Windows binary/CI surface and restore it when a real user needs it.

## Decision Drivers

- **User need:** Windows CLI usage is covered by the npm package; no demonstrated demand for a dependency-free Windows SEA.
- **Development throughput:** Faster CI feedback on every PR/push matters more than verifying an unused Windows compile path.
- **Reversibility:** SEA scripts and CI jobs can be restored when a user requests Windows binaries.
- **Honesty in docs:** Client and maintainer docs must describe platforms we actually ship and verify.

## Considered Options

1. **Keep Windows CI and SEA as-is** — continue paying matrix and release cost for unused artifacts.
2. **CI-only retire** — drop `build-windows` but keep releasing Windows SEA binaries.
3. **Full retire until demand** — remove Windows CI verify, stop shipping Windows SEA, remove Windows SEA build scripts, document npm as the Windows path.

## Decision Outcome

**Chosen option: "Full retire until demand".**

- Do not run Windows CI verify on PRs or `main`.
- Do not build or attach Windows SEA binaries on GitHub Releases.
- Document Linux and macOS standalone binaries only.
- Document that Windows users should use the npm-published CLI.
- Restore Windows SEA and optional CI verify when a user demonstrates need for a native `.exe`.

## Consequences

- **Positive:** Shorter CI loops; less release matrix surface; docs match shipped platforms.
- **Negative:** No fresh Windows `.exe` on new releases; contributors must not assume Windows runner coverage in CI.
- **Mitigation:** npm CLI remains the cross-platform install path, including Windows.

## Restore from prior implementation

When a user needs Windows SEA again, start from the pre-retirement tree rather than reinventing the scripts and workflow wiring.

| Pointer                                                                         | Use                                                                                  |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Issue [#79](https://github.com/betsalel-williamson/Templating-Engine/issues/79) | Scope, acceptance criteria, and why we retired                                       |
| PR [#84](https://github.com/betsalel-williamson/Templating-Engine/pull/84)      | Diff that removed Windows CI/release/SEA; invert that change as the restore baseline |
| Parent of the retire commit on `main` (after merge)                             | Last revision that still contained the Windows paths                                 |

Surfaces to recover from that history:

- `.github/workflows/ci.yml` — `build-windows` job
- `.github/workflows/release-binaries.yml` — `windows-latest` matrix cell, prepare/upload steps
- `packages/template-engine-cli` — `build:standalone:windows` and `scripts/build-sea-windows.sh`
- Client/developer docs and the maintenance issue-template checklist for Windows verify

After restore, update this ADR’s status (or supersede it) so docs again match shipped platforms.
