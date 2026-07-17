#!/usr/bin/env bash
#
# run-recipes.sh
#
# Iterates through recipes in docs/recipes/ and generates a corresponding
# '.result' file for each one via the built npm CLI package.
#
# This serves as an end-to-end regression test for the template engine.
#
# Usage:
#   Run from the root of the project after `pnpm run build`:
#   ./run-recipes.sh

set -euo pipefail

CLI_JS="packages/template-engine-cli/dist/cli.js"
if [ ! -f "${CLI_JS}" ]; then
  echo "Error: Built CLI not found at '${CLI_JS}'." >&2
  echo "Run 'pnpm run build' first, then re-run this script." >&2
  exit 1
fi

echo "Using CLI: node ${CLI_JS}"
echo "----------------------------------------"

for recipe_md in docs/recipes/*.md; do
  base_name=$(basename "${recipe_md}" .md)

  template_file="docs/recipes/${base_name}.template"
  data_file="docs/recipes/${base_name}.json"
  result_file="docs/recipes/${base_name}.result"

  echo "-> Processing recipe: ${base_name}"

  if [ ! -f "${template_file}" ] || [ ! -f "${data_file}" ]; then
    echo "   [SKIP] Missing template or data file for ${base_name}."
    continue
  fi

  time node "${CLI_JS}" --template "${template_file}" --data "${data_file}" > "${result_file}"

  echo "   [OK] Generated ${result_file}"
done

echo "----------------------------------------"
echo "All recipes processed successfully."
echo "Result files (.result) have been generated in docs/recipes/."
