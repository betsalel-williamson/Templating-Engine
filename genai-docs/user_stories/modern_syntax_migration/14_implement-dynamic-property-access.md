# Story 14: Implement Dynamic Property Access with Bracket Notation

- **Project**: `template-engine-ts`
- **Status**: `todo`
- **As a** Developer creating dynamic configurations,
- **I want to** access a property of an object using a key that is stored in another variable (e.g., `{{ settings[env_key] }}`),
- **so that** I can create highly generic and reusable templates that adapt to their data context, mirroring familiar patterns from JavaScript and Python.

## Acceptance Criteria

- The evaluator must be updated to support bracket notation (`[]`) for property access on `Map` objects.
- The expression inside the brackets must be fully evaluated first to determine the key for the lookup.
- This must work in combination with static dot notation. Given `{ user: { details: { name: 'Alice' } }, key: 'name' }`, the template `{{ user.details[key] }}` must produce `Alice`.
- If the lookup fails (either the object or the key does not exist), the expression must evaluate to an empty string.
- This syntax explicitly replaces the legacy `<##...##>` indirect lookup mechanism.
- The implementation must have comprehensive unit tests for successful lookups, failed lookups, and nested lookups.

## Metrics for Success

- **Primary Metric**: "Achieve feature parity with the legacy `<##...##>` construct, unblocking migration of advanced use cases."
- **Secondary Metrics**: "Developer survey feedback indicates the bracket notation is 'intuitive' or 'very intuitive'."
