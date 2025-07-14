# User Story Standards

User stories capture end-user value and must conform to the following naming and content conventions.

---

## User Story File Naming Convention

User stories are stored in the `work_items/user_stories/` directory, grouped by feature epic.

**Path:** `work_items/user_stories/{epic_name}/{story_number}_{kebab-case-title}.md`

- **`{epic_name}`**: Logical grouping for a feature set (for example, `user_authentication`, `payment_processing`).
- **`{story_number}`**: Two-digit number for ordering within the epic (for example, `00`, `01`).
- **`{kebab-case-title}`**: Concise, hyphenated title (for example, `add-mfa-support`).

## User Story Content Template

```markdown
---
title: '{User Story Title}'
project_name: { project_name }
epic_name: { epic_name }
story_id: { story_id }
labels: { comma-separated-labels }
status: { status }
date_created: { iso date LA timezone }
date_verified_completed: { iso date LA timezone }
touched: { a star is added here every day that we try to work on this story }
---

- **As a** {User Persona},
- **I want to** {Action or Goal},
- **so that** {Benefit or Value}.

## Acceptance Criteria

- The system must {do something specific and verifiable}.
- {Another specific, verifiable outcome}.
- ...

## Metrics for Success

- **Primary Metric**: {The key metric that will validate the story's value} (for example, "5% decrease in Change Failure Rate").
- **Secondary Metrics**: {Other metrics to monitor for intended or unintended consequences}.
```

## User Story Field Definitions

- **`title`**: Human-readable title (for example, "Support Multi-Factor Authentication").
- **`project_name`**: Project this story belongs to (for example, `auth-service`).
- **`epic_name`**: Logical grouping for a feature set (for example, `user_authentication`).
- **`story_id`**: Unique identifier for the story (for example, `00_epic_initial_workspace/00_create_new_project`).
- **`labels`**: Comma-separated labels (for example, `frontend, pwa`).
- **`status`**: Allowed: `backlog`, `todo`, `in-progress`, `blocked`, `done`, `verified completed`.
  - `backlog`: An idea, not yet selected for work.
  - `todo`: Ready for work, selected for the current WIP limit.
  - `in-progress`: Actively being worked on.
  - `blocked`: Cannot proceed due to an external dependency.
  - `done`: Completed and awaiting verification.
  - `verified completed`: Fully completed and verified.
- **`User Persona`**: The actor initiating the action (for example, "Data Analyst").
- **`Action or Goal`**: The desired functionality.
- **`Benefit or Value`**: The business value or user need.
- **`Acceptance Criteria`**: A bulleted list of testable, observable outcomes.
- **`Metrics for Success`**: The metrics used to measure the impact of the story.
