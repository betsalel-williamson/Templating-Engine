# The Software Development Process

Our development process is an iterative, data-informed loop designed for continuous improvement.

## The 7-Step Improvement Cycle

This cycle applies to new features, bug fixes, and process improvements.

1.  **Identify Area for Improvement**
    -   Source: User feedback, product goals, retrospective actions, or analysis of our DORA metrics.
    -   Goal: Define a clear, measurable outcome you want to achieve. (e.g., "Reduce user-reported login errors by 50%," "Improve Change Lead Time for the auth service.")

2.  **Measure Baseline**
    -   Use our standard metrics (`docs/metrics/README.md`) to establish the current state. You cannot improve what you do not measure.

3.  **Develop a Hypothesis**
    -   State a clear, falsifiable hypothesis.
    -   *Example*: "We believe that adding client-side validation to the password field will reduce login failures caused by incorrect password formats."

4.  **Plan the Work**
    -   Create a small, well-defined user story (`docs/user_stories/README.md`).
    -   The work must conform to our **Small Batch Size** principle. If it's too big, break it down further.

5.  **Execute the Change**
    -   Write the code, configuration, and tests.
    -   Adhere to our Quality Assurance (`docs/quality_assurance/README.md`) and AI Usage (`docs/ai_guidelines/README.md`) guidelines.
    -   Continuously integrate changes to the `main` branch.

6.  **Deploy and Measure the Outcome**
    -   The automated pipeline deploys the change to production.
    -   Use feature flags to control the release if necessary.
    -   Monitor the metrics identified in steps 1 & 2 to see if your hypothesis was correct.

7.  **Learn and Repeat**
    -   Analyze the results. Did the change have the intended effect? Were there unintended side effects?
    -   Share the learnings with the team.
    -   Use this new knowledge to identify the next area for improvement.
