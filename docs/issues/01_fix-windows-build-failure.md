---
title: "CI/CD: Build fails on Windows runner due to non-portable `mkdir -p` command"
labels: bug, ci/cd, chore
---

### What is happening?

The `npm run build` command fails on the Windows runner in our release workflow. The log shows the error: `A subdirectory or file -p already exists.`

This indicates that the `bash` environment on the Windows runner is not correctly interpreting the `mkdir -p lib` command. Instead of treating `-p` as a flag, it's attempting to create a directory named `-p`.

### Why is this a problem?

This is a critical bug that completely blocks our automated release process. We cannot produce Windows binaries until this is fixed. It violates our **Comprehensive Automation** principle, as our pipeline is not reliable across all target platforms.

### What is the solution?

We must replace the non-portable `mkdir -p` command with a guaranteed cross-platform equivalent from the Node.js ecosystem.

1.  Add the `mkdirp` package as a `devDependency` to `package.json`.
2.  Update the `build` script in `package.json` to use the `mkdirp lib` command instead of `mkdir -p lib`.
