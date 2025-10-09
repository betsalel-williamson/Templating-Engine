---
title: "macOS Release: Binary is blocked by Gatekeeper as from an 'unverified developer'"
project_name: template-engine-ts
epic_name: tooling_and_ci
task_id: 23
labels: enhancement, build, documentation
status: todo
date_created: 2025-07-13T00:00:00-07:00
date_verified_completed: 
touched: *
---

## Task

When a user on macOS downloads and tries to run the `template-engine-v...-macos` executable from a GitHub release, they receive a security warning:

> "Apple could not verify 'template-engine-...' is free of malware..."

This is the expected behavior of **macOS Gatekeeper**. Because the application is not signed with a paid Apple Developer ID certificate and has not been notarized by Apple, the operating system treats it as untrusted by default.

This creates a significant barrier to adoption for macOS users. It makes the tool seem untrustworthy and requires users to know the specific security workarounds to even run the application.

## Acceptance Criteria

- [ ] Update the `README.md` to add a section explaining the warning and the standard, safe procedure to run the application.
- [ ] Proposed `README.md` addition:

```markdown
### Note for macOS Users

When you first run the `template-engine-macos` executable, you may see a security warning from macOS stating that the developer cannot be verified. This is expected behavior for applications that are not notarized through the Apple App Store.

To run the application, you must grant it a one-time security exception:

1.  Right-click (or Ctrl-click) the `template-engine-macos` file and select "Open".
2.  You will see the same warning, but this time it will include an "Open" button. Click "Open".

You will only need to do this once. After you grant this exception, you can run the executable normally by double-clicking it or calling it from your terminal.
```

## Context/Links

- Related user story:
- Additional context: This task addresses a critical user experience issue on macOS. The long-term solution (Apple signing and notarization) should be tracked as a separate, future enhancement.
