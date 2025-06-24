#!/usr/bin/env bash
# Builds a Node.js Single Executable Application (SEA) for macOS.
set -euo pipefail

echo "Starting macOS SEA build..."

NODE_BINARY="$(command -v node)"
OUTPUT_PATH="dist/template-engine-macos"

echo "Copying Node.js binary from ${NODE_BINARY} to ${OUTPUT_PATH}..."
cp "${NODE_BINARY}" "${OUTPUT_PATH}"

# macOS requires removing the signature before injection and re-signing after.
echo "Removing existing signature from ${OUTPUT_PATH}..."
codesign --remove-signature "${OUTPUT_PATH}"

echo "Injecting SEA blob into ${OUTPUT_PATH}..."
npx postject "${OUTPUT_PATH}" NODE_SEA_BLOB dist/cli.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA

echo "Re-signing ${OUTPUT_PATH}..."
codesign --sign - "${OUTPUT_PATH}"

echo "macOS SEA build completed: ${OUTPUT_PATH}"
