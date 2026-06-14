#!/usr/bin/env bash
# Builds a Node.js Single Executable Application (SEA) for Linux.
set -euo pipefail

echo "Starting Linux SEA build..."

NODE_BINARY="$(command -v node)"
OUTPUT_PATH="dist/template-engine-linux"

echo "Copying Node.js binary from ${NODE_BINARY} to ${OUTPUT_PATH}..."
cp "${NODE_BINARY}" "${OUTPUT_PATH}"

echo "Injecting SEA blob into ${OUTPUT_PATH}..."
npx postject "${OUTPUT_PATH}" NODE_SEA_BLOB dist/cli.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

# Make the output executable
chmod +x "${OUTPUT_PATH}"

echo "Linux SEA build completed: ${OUTPUT_PATH}"
