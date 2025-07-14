# Task Standards

Tasks are internal, technical work items required to implement user stories. They're more granular and engineering-focused.

---

## Task File Naming Convention

Tasks are stored in the `work_items/tasks/` directory, grouped by epic or feature.

**Path:** `work_items/tasks/{epic_name}/{task_number}_{kebab-case-title}.md`

- **`{epic_name}`**: Logical grouping (for example, `user_authentication`).
- **`{task_number}`**: Two-digit number for ordering (for example, `00`, `01`).
- **`{kebab-case-title}`**: Concise, hyphenated title.

## Task Content Template

```markdown
---
title: '{Task Title}'
project_name: { project_name }
epic_name: { epic_name }
task_id: { task_id }
labels: { comma-separated-labels }
status: { status }
date_created: { iso date LA timezone }
date_verified_completed: { iso date LA timezone }
touched: { a star is added here every day that we try to work on this task }
---

## Task

{Short description of the technical work to be done.}

## Acceptance Criteria

- [ ] {Specific, verifiable technical outcome}
- [ ] ...

## Context/Links

- Related user story: {relative path to user story}
- Additional context: {links or notes}
```

## Task Field Definitions

- **`title`**: Human-readable title.
- **`project_name`**: Project this task belongs to (for example, `auth-service`).
- **`epic_name`**: Logical grouping for a feature set (for example, `user_authentication`).
- **`task_id`**: Unique identifier for the task.
- **`labels`**: Comma-separated labels (for example, `backend, api`).
- **`status`**: Allowed: `backlog`, `todo`, `in-progress`, `blocked`, `done`, `verified completed`.
  - `backlog`: An idea, not yet selected for work.
  - `todo`: Ready for work, selected for the current WIP limit.
  - `in-progress`: Actively being worked on.
  - `blocked`: Can't proceed due to an external dependency.
  - `done`: Completed and awaiting verification.
  - `verified completed`: Fully completed and verified.
- **`Task`**: Description of the technical work.
- **`Acceptance Criteria`**: Checklist of technical outcomes.
- **`Context/Links`**: References to user stories or other context.
