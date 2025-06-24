# Guidelines for Using AI in Development

AI-powered tools (e.g., code assistants) are powerful but present risks. The 2024 DORA report indicates that while AI boosts individual productivity, it negatively impacts software delivery stability if not managed correctly. These guidelines are mandatory.

### Rule 1: AI Does Not Change Our **Small Batch Size** Principle

This is the most important rule. AI makes it easy to generate vast amounts of code quickly. This creates a strong temptation to commit large, complex changes. **Do not do this.**

-   **All commits must remain small and logically atomic.** A commit should represent a single, understandable change.
-   Use AI to generate a part of a feature, then review, test, and commit that part. Do not generate an entire feature and commit it in one go.
-   Large commits directly correlate with a higher Change Failure Rate and longer Time to Restore Service.

### Rule 2: All AI-Generated Code is Untrusted

Treat AI-generated code with the same skepticism you would a code snippet from an unverified blog post.

-   You, the engineer, are 100% accountable for any code you commit, regardless of its origin.
-   AI-generated code must undergo the same rigorous code review and testing process as human-written code.
-   Do not trust that the AI has considered all edge cases, security vulnerabilities, or performance implications. It has not.

### Rule 3: Use AI to Augment, Not Originate Complex Logic

AI is best used for tasks that are well-defined and have clear correctness criteria.

-   **Good use cases**: Generating boilerplate code, writing unit tests for existing functions, creating documentation, refactoring code to a new pattern, explaining unfamiliar code.
-   **Dangerous use cases**: Generating core business logic, creating complex security-sensitive algorithms, or making architectural decisions. You must deeply understand and validate any such code before committing it.

Failure to adhere to these guidelines will result in decreased delivery performance and production instability.
