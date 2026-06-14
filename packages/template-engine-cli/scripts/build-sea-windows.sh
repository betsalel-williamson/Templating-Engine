#!/usr/bin/env bash
# Builds a Node.js Single Executable Application (SEA) for Windows.
# Intended for use in Git Bash or WSL on Windows.
set -euo pipefail

echo "Starting Windows SEA build..."

# In Git Bash on Windows, 'command -v node' may point to a shim.
# 'which node' is often more reliable for the .exe path.
NODE_BINARY_PATH=$(which node)
OUTPUT_PATH="dist/template-engine-win.exe"

echo "Copying Node.js binary from ${NODE_BINARY_PATH} to ${OUTPUT_PATH}..."
cp "${NODE_BINARY_PATH}" "${OUTPUT_PATH}"

echo "Injecting SEA blob into ${OUTPUT_PATH}..."
npx postject "${OUTPUT_PATH}" NODE_SEA_BLOB dist/cli.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

echo "Windows SEA build completed: ${OUTPUT_PATH}"
