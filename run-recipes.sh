#!/usr/bin/env bash
#
# run-recipes.sh
#
# This script automatically detects the appropriate compiled CLI binary for the
# current operating system, iterates through all recipes in the 'docs/recipes/'
# directory, and generates a corresponding '.result' file for each one.
#
# This serves as an end-to-end regression test for the template engine.
#
# Usage:
#   Run from the root of the project:
#   ./run-recipes.sh

set -euo pipefail

# 1. Detect the correct CLI binary for the current OS
CLI_BINARY=""
if [ -f "dist/template-engine-linux" ]; then
  CLI_BINARY="dist/template-engine-linux"
elif [ -f "dist/template-engine-macos" ]; then
  CLI_BINARY="dist/template-engine-macos"
elif [ -f "dist/template-engine-win.exe" ]; then
  CLI_BINARY="dist/template-engine-win.exe"
else
  echo "Error: No compiled CLI binary found in 'dist/' directory." >&2
  echo "Please run one of the 'npm run build:standalone:*' scripts first." >&2
  exit 1
fi

echo "Using binary: ${CLI_BINARY}"
echo "----------------------------------------"

# 2. Iterate through all recipe markdown files to find the base names
for recipe_md in docs/recipes/*.md; do
  # Get the base name of the recipe (e.g., "01-dynamic-sql-generation")
  base_name=$(basename "$recipe_md" .md)

  # Define the paths for the template, data, and result files
  template_file="docs/recipes/${base_name}.template"
  data_file="docs/recipes/${base_name}.json"
  result_file="docs/recipes/${base_name}.result"

  echo "-> Processing recipe: ${base_name}"

  # Check if the required input files exist
  if [ ! -f "${template_file}" ] || [ ! -f "${data_file}" ]; then
    echo "   [SKIP] Missing template or data file for ${base_name}."
    continue
  fi

  # 3. Execute the CLI binary and redirect the output to the result file
  #    The quotes are essential to handle paths correctly.
  time "${CLI_BINARY}" --template "${template_file}" --data "${data_file}" > "${result_file}"

  echo "   [OK] Generated ${result_file}"
done

echo "----------------------------------------"
echo "All recipes processed successfully."
echo "Result files (.result) have been generated in docs/recipes/."