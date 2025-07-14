# User Story Standard

All work is captured in user stories that must conform to the following file naming convention and content structure. This ensures clarity, consistency, and alignment with our user-centric principles.

## File Naming Convention

User stories are stored in the `docs/user_stories/` directory, grouped by feature epic.

**Path:** `docs/user_stories/{epic_name}/{story_number}_{kebab-case-title}.md`

- **`{epic_name}`**: A short, logical grouping for a feature set (e.g., `user_authentication`, `payment_processing`).
- **`{story_number}`**: A two-digit number for ordering within the epic (e.g., `00`, `01`).
- **`{kebab-case-title}`**: A concise, hyphenated title for easy file identification (e.g., `add-mfa-support`, `process-stripe-payment`).

## Content Template

Each user story markdown file must contain the following sections:

```markdown
# Story {Number}: {Title}

- **Project**: `{project_name}`
- **Status**: `{status}`
- **As a** {User Persona},
- **I want to** {Action or Goal},
- **so that** {Benefit or Value}.

## Acceptance Criteria

-   The system must {do something specific and verifiable}.
-   {Another specific, verifiable outcome}.
-   ...

## Metrics for Success

- **Primary Metric**: {The key metric that will validate the story's value} (e.g., "5% decrease in Change Failure Rate", "10% increase in successful user signups").
- **Secondary Metrics**: {Other metrics to monitor for intended or unintended consequences}.
```

## Field Definitions

- **`{Number}`**: The unique number of the story (e.g., `0`, `1`, `7`).
- **`{Title}`**: The full, human-readable title of the feature (e.g., "Support Multi-Factor Authentication").
- **`{project_name}`**: The specific project this story belongs to (e.g., `auth-service`, `api-gateway`). This is mandatory for clarity.
- **`{status}`**: The current lifecycle status of the user story. Allowed values:
  - `todo`: The story is defined and prioritized but not yet started.
  - `in-progress`: Active work is being done on this story.
  - `blocked`: Work on this story is halted due to an external dependency or issue.
  - `verified completed`: The story's acceptance criteria are met, the change has been deployed to production, and its impact has been measured and validated against its primary metric.
- **`{User Persona}`**: The actor initiating the action. This can be a human role ("Data Analyst") or a system ("Billing Service").
- **`{Action or Goal}`**: A concise statement of the desired functionality.
- **`{Benefit or Value}`**: The purpose or business value driving the feature request. This must connect to a user need.
- **`Acceptance Criteria`**: A bulleted list of non-negotiable, testable conditions that must be met. Each must describe an observable outcome, not an implementation detail.
- **`Metrics for Success`**: Explicitly defines how we will measure the impact of this story. This is critical for our data-informed process.
