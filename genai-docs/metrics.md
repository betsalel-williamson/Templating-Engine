# Engineering Metrics

We use a small, focused set of metrics to understand our performance and guide improvement. These metrics are for learning and identifying opportunities, **not** for comparing teams or individuals.

The 2024 DORA report groups the four key metrics into two primary factors, which we adopt.

## 1. Software Delivery Throughput

This factor measures how quickly we can get ideas from conception to production.

- **Change Lead Time**: The time from the first commit to that code being successfully deployed in production. (Lower is better).
- **Deployment Frequency**: How often we deploy to production. (Higher is better, as it indicates small batch sizes).
- **Time to Restore Service (MTTR)**: How long it takes to recover from a failure in production. (Lower is better).

## 2. Software Delivery Stability

This factor measures the quality and stability of our delivery process.

- **Change Failure Rate**: The percentage of deployments that cause a failure in production (e.g., require a hotfix, rollback, or cause a user-facing outage). (Lower is better).
- **Rework Rate**: The percentage of deployments that are not planned but are performed to address a user-facing bug. This is a direct measure of unplanned work and quality issues. (Lower is better).

## 3. User-Centric Metrics

Technical metrics are insufficient. We must also measure user impact.

- **User Satisfaction (CSAT/NPS)**: How do users feel about our product?
- **Task Success Rate**: Can users accomplish their primary goals with our software?

These metrics provide the data for our continuous improvement cycle.
