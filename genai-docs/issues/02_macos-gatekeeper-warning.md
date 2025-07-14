---
title: "macOS Release: Binary is blocked by Gatekeeper as from an 'unverified developer'"
labels: enhancement, build, documentation
---

### What is happening?

When a user on macOS downloads and tries to run the `template-engine-v...-macos` executable from a GitHub release, they receive a security warning:

> "Apple could not verify 'template-engine-...' is free of malware..."

This is the expected behavior of **macOS Gatekeeper**. Because the application is not signed with a paid Apple Developer ID certificate and has not been notarized by Apple, the operating system treats it as untrusted by default.

### Why is this a problem?

This creates a significant barrier to adoption for macOS users. It makes the tool seem untrustworthy and requires users to know the specific security workarounds to even run the application.

### What is the solution?

There is a two-part solution: a necessary short-term fix and a correct long-term enhancement.

#### Short-Term Solution (Immediate Priority)

We must provide clear instructions to the user. This involves updating the `README.md` to add a section explaining the warning and the standard, safe procedure to run the application.

**Proposed `README.md` addition:**

```markdown
### Note for macOS Users

When you first run the `template-engine-macos` executable, you may see a security warning from macOS stating that the developer cannot be verified. This is expected behavior for applications that are not notarized through the Apple App Store.

To run the application, you must grant it a one-time security exception:

1.  Right-click (or Ctrl-click) the `template-engine-macos` file and select "Open".
2.  You will see the same warning, but this time it will include an "Open" button. Click "Open".

You will only need to do this once. After you grant this exception, you can run the executable normally by double-clicking it or calling it from your terminal.
```

#### Long-Term Solution (Future User Story)

To remove the warning entirely, the application must be officially signed and notarized by Apple. This is a complex process that involves:

1. Enrolling in the paid Apple Developer Program.
2. Generating a "Developer ID Application" certificate.
3. Updating the `release.yml` workflow to use this certificate (stored as a secret) to sign the macOS binary.
4. Adding a step to submit the signed binary to Apple's notarization service and "staple" the resulting ticket to the executable.

This should be tracked as a separate, future enhancement.
