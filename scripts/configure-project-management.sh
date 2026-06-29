#!/usr/bin/env bash
set -euo pipefail

# One-time setup: create epics, link migrated issues as sub-issues, and add
# all open issues to the Templating Engine GitHub Project.
#
# Usage: ./scripts/configure-project-management.sh

REPO="betsalel-williamson/Templating-Engine"
PROJECT_OWNER="betsalel-williamson"
PROJECT_NUMBER="5"
PROJECT_ID="PVT_kwHOAJLCJ84BcAUl"
STATUS_FIELD_ID="PVTF_lAHOAJLCJ84BcAUlzhWsVd4"
STATUS_IN_PROGRESS="47fc9ee4"

issue_node_id() {
  gh api "repos/${REPO}/issues/$1" --jq .node_id
}

create_epic_if_missing() {
  local title="$1"
  local body="$2"
  local existing
  existing=$(gh issue list --repo "$REPO" --search "in:title \"${title}\"" --state open --json number,title --jq ".[] | select(.title == \"${title}\") | .number" | head -n1)
  if [[ -n "$existing" ]]; then
    echo "Epic already exists: #${existing} (${title})" >&2
    issue_node_id "$existing"
    return
  fi

  local url
  url=$(gh issue create --repo "$REPO" --title "$title" --body "$body" --label enhancement)
  local number="${url##*/}"
  echo "Created epic #${number}: ${title}" >&2
  issue_node_id "$number"
}

link_sub_issue() {
  local parent_id="$1"
  local child_number="$2"
  local child_id
  child_id=$(issue_node_id "$child_number")
  gh api graphql -f query="mutation { addSubIssue(input: {issueId: \"${parent_id}\", subIssueId: \"${child_id}\"}) { issue { number } } }" >/dev/null
  echo "Linked #${child_number} under epic"
}

add_issue_to_project() {
  local number="$1"
  local url="https://github.com/${REPO}/issues/${number}"
  if gh project item-add "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --url "$url" --format json >/dev/null 2>&1; then
    echo "Added #${number} to project"
  else
    echo "Skipped #${number} (already on project or add failed)" >&2
  fi
}

set_in_progress() {
  local item_id="$1"
  gh api graphql -f query="mutation { updateProjectV2ItemFieldValue(input: {projectId: \"${PROJECT_ID}\", itemId: \"${item_id}\", fieldId: \"${STATUS_FIELD_ID}\", value: {singleSelectOptionId: \"${STATUS_IN_PROGRESS}\"}}) { projectV2Item { id } } }" >/dev/null
}

echo "Creating epics..."
MODERN_EPIC_ID=$(create_epic_if_missing "[Epic] Modern Syntax Migration" "Parent epic for modern templating syntax parity work.

See [migration plan](https://github.com/betsalel-williamson/Templating-Engine/blob/main/docs/developer/migration-plan.md).")

CLI_EPIC_ID=$(create_epic_if_missing "[Epic] CLI Interface" "Parent epic for CLI packaging, distribution, and developer experience.")

TOOLING_EPIC_ID=$(create_epic_if_missing "[Epic] Tooling and CI" "Parent epic for CI/CD, build and release automation, editor tooling, and repository hygiene.")

echo ""
echo "Linking sub-issues..."
for n in $(seq 16 30); do
  link_sub_issue "$MODERN_EPIC_ID" "$n"
done

link_sub_issue "$CLI_EPIC_ID" 31

for n in 32 33 34 35 36 37 38; do
  link_sub_issue "$TOOLING_EPIC_ID" "$n"
done

echo ""
echo "Adding open issues to project ${PROJECT_OWNER}/${PROJECT_NUMBER}..."
gh issue list --repo "$REPO" --state open --json number --jq '.[].number' | while read -r number; do
  add_issue_to_project "$number"
done

echo ""
echo "Setting #34 status to In Progress..."
ITEM_ID=$(gh project item-list "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json --jq '.items[] | select(.content.number == 34) | .id')
if [[ -n "$ITEM_ID" ]]; then
  set_in_progress "$ITEM_ID"
  echo "Updated #34 project status"
fi

echo ""
echo "Done. Project board: https://github.com/users/${PROJECT_OWNER}/projects/${PROJECT_NUMBER}"
