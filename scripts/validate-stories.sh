#!/usr/bin/env bash
#
# This script executes the TypeScript validation logic using Node's modern
# `register` API, which is the correct and future-proof way to run a .ts
# file in a project configured for ES Modules.
#
# All arguments passed to this wrapper (e.g., --json) are forwarded to
# the TypeScript script.

set -euo pipefail

# Find the absolute path to the directory containing this script.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"

# Execute the TypeScript script using `node`. The `--import` flag with the
# data URI is the modern replacement for `--loader`, as recommended by Node.js
# to eliminate experimental warnings.
# It passes all command-line arguments ("$@") to the Node.js script.
exec node \
  --import 'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("ts-node/esm", pathToFileURL("./"));' \
  "$SCRIPT_DIR/validate-stories.ts" "$@"
