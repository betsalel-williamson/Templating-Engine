#!/usr/bin/env bash
#
# run-pkl-recipes.sh
#
# This script serves as a test runner for our Pkl templates. It iterates
# through all recipes, evaluates them, and compares the output to the
# expected golden file (.result).

set -euo pipefail

# 1. Check if the 'pkl' command is available
if ! command -v pkl &> /dev/null; then
  echo "Error: The 'pkl' command-line tool is not installed or not in your PATH." >&2
  echo "Please install it by following the instructions at: https://pkl-lang.org/main/current/pkl-cli/index.html" >&2
  exit 1
fi

echo "Pkl command found. Starting recipe validation..."
echo "------------------------------------------------"

EXIT_CODE=0
RECIPES_DIR="docs/recipes"

# 2. Iterate through all Pkl template files
for pkl_template in "${RECIPES_DIR}"/*.pkl; do
  base_name=$(basename "$pkl_template" .pkl)
  recipe_name=$(basename "$base_name")

  # Define path for the golden file
  golden_file="${RECIPES_DIR}/${base_name}.result"

  echo -n "-> Processing recipe: ${recipe_name}... "

  # 3. Check if corresponding result file exists
  if [ ! -f "$golden_file" ]; then
    echo "[SKIP] Missing golden file: ${golden_file}"
    continue
  fi

  # 4. Evaluate the Pkl template and capture the output
  #    - The --module-path flag is CRITICAL. It tells Pkl where to resolve
  #      the `modulepath:/` URIs used in the templates.
  #    - `-f raw` outputs the raw string value of the 'output.text' property.
  actual_output=$(pkl eval --module-path "${RECIPES_DIR}" "${pkl_template}")
  expected_output=$(cat "$golden_file")

  # Normalize line endings for cross-platform compatibility
  actual_normalized=$(echo "$actual_output" | tr -d '\r')
  expected_normalized=$(echo "$expected_output" | tr -d '\r')

  # 5. Compare the actual output with the expected golden file
  if [ "$actual_normalized" == "$expected_normalized" ]; then
    echo "[OK]"
  else
    echo "[FAIL]"
    echo "   Output did not match the golden file."
    echo "   --- DIFF ---"
    diff --unified <(echo "$expected_normalized") <(echo "$actual_normalized") || true
    echo "   ------------"
    EXIT_CODE=1
  fi
done

echo "------------------------------------------------"
if [ $EXIT_CODE -eq 0 ]; then
  echo "All Pkl recipes validated successfully."
else
  echo "One or more Pkl recipes failed validation."
fi

exit $EXIT_CODE
