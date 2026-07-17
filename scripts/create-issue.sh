#!/usr/bin/env bash
set -euo pipefail

# Create a GitHub issue from a markdown file with YAML frontmatter.
#
# Usage: ./scripts/create-issue.sh <path-to-issue.md>
#
# Frontmatter must include `title` and may include `labels` (YAML list or
# comma-separated). The body is everything after the closing --- delimiter.

REPO="betsalel-williamson/Templating-Engine"

usage() {
  echo "Usage: ${0##*/} <path-to-issue-markdown-file>" >&2
  exit 1
}

require_gh() {
  if ! command -v gh &>/dev/null; then
    echo "Error: GitHub CLI (gh) is not installed or not in your PATH." >&2
    echo "Install it from: https://cli.github.com/" >&2
    exit 1
  fi

  if ! gh auth status &>/dev/null; then
    echo "Error: GitHub CLI (gh) is not authenticated." >&2
    echo "Run 'gh auth login' to authenticate." >&2
    exit 1
  fi
}

extract_frontmatter() {
  awk '
    BEGIN { state = 0 }
    /^---$/ {
      if (state == 0) { state = 1; next }
      if (state == 1) { exit }
    }
    state == 1 { print }
  ' "$1"
}

extract_body() {
  awk '
    BEGIN { state = 0 }
    /^---$/ {
      if (state == 0) { state = 1; next }
      if (state == 1) { state = 2; next }
    }
    state == 2 { print }
  ' "$1"
}

strip_yaml_quotes() {
  local value="$1"
  value="${value#\"}"
  value="${value%\"}"
  value="${value#\'}"
  value="${value%\'}"
  printf '%s' "$value"
}

parse_title() {
  local frontmatter="$1"
  local raw
  raw=$(printf '%s\n' "$frontmatter" | awk '/^title:/ { sub(/^title:[[:space:]]*/, ""); print; exit }')
  if [[ -z "$raw" ]]; then
    echo "Error: YAML frontmatter must include a title field." >&2
    exit 1
  fi
  strip_yaml_quotes "$raw"
}

parse_labels() {
  local frontmatter="$1"
  local label
  while IFS= read -r label; do
    [[ -n "$label" ]] || continue
    strip_yaml_quotes "$label"
  done < <(printf '%s\n' "$frontmatter" | awk '
    BEGIN { in_list = 0 }
    function emit(label) {
      if (label != "") print label
    }
    /^labels:[[:space:]]*$/ { in_list = 1; next }
    /^labels:[[:space:]]+/ {
      line = $0
      sub(/^labels:[[:space:]]*/, "", line)
      if (line ~ /^\[/) {
        gsub(/^\[|[\]]$/, "", line)
        n = split(line, parts, /,[[:space:]]*/)
        for (i = 1; i <= n; i++) emit(parts[i])
      } else {
        n = split(line, parts, /,[[:space:]]*/)
        for (i = 1; i <= n; i++) emit(parts[i])
      }
      next
    }
    in_list && /^[[:space:]]+-[[:space:]]+/ {
      line = $0
      sub(/^[[:space:]]+-[[:space:]]*/, "", line)
      emit(line)
      next
    }
    in_list && /^[^[:space:]#-]/ { in_list = 0 }
  ')
}

[[ $# -eq 1 ]] || usage

issue_file=$1

if [[ ! -f "$issue_file" ]]; then
  echo "Error: File not found: ${issue_file}" >&2
  exit 1
fi

if [[ $(head -n1 "$issue_file") != "---" ]]; then
  echo "Error: Issue file must begin with YAML frontmatter delimited by ---." >&2
  exit 1
fi

frontmatter=$(extract_frontmatter "$issue_file")
if [[ -z "$frontmatter" ]]; then
  echo "Error: Issue file must include YAML frontmatter between --- delimiters." >&2
  exit 1
fi

require_gh

title=$(parse_title "$frontmatter")
body=$(extract_body "$issue_file")

label_args=()
while IFS= read -r label; do
  [[ -n "$label" ]] || continue
  label_args+=(--label "$label")
done < <(parse_labels "$frontmatter")

body_file=$(mktemp)
trap 'rm -f "$body_file"' EXIT
printf '%s' "$body" >"$body_file"

if [[ ${#label_args[@]} -gt 0 ]]; then
  gh issue create --repo "$REPO" --title "$title" --body-file "$body_file" "${label_args[@]}"
else
  gh issue create --repo "$REPO" --title "$title" --body-file "$body_file"
fi
