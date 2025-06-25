#!/bin/bash
#
# This script automates the process of creating a new version release.
# It ensures the version in package.json is bumped correctly, and a
# corresponding Git tag is created and pushed.

# Exit immediately if a command exits with a non-zero status.
# Treat unset variables as an error.
set -euo pipefail

# --- Argument Validation ---
BUMP_TYPE="${1-}" # Use default empty value if not provided

if [[ -z "$BUMP_TYPE" ]]; then
  echo "Error: Missing release type." >&2
  echo "Usage: ./scripts/release.sh [patch|minor|major]" >&2
  exit 1
fi

case "$BUMP_TYPE" in
  patch|minor|major)
    # Valid type, proceed
    ;;
  *)
    echo "Error: Invalid release type '$BUMP_TYPE'." >&2
    echo "Usage: ./scripts/release.sh [patch|minor|major]" >&2
    exit 1
    ;;
esac

# --- Execution ---

echo "Running tests before release..."
npm test

echo "Creating new '$BUMP_TYPE' version..."

# Use npm version to bump the version, create a commit, and tag it.
# This is the standard, reliable way to manage versions in Node.js projects.
npm version "$BUMP_TYPE" -m "chore(release): version %s"

echo "Pushing commit and new tag to remote..."

# Push the commit and the new tag to the origin repository.
# --follow-tags ensures that the tag created by `npm version` is pushed.
git push --follow-tags

echo "Release process complete."
echo "The release workflow will now be triggered on GitHub Actions."
