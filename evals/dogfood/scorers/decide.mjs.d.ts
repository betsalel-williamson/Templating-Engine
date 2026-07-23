import type { ArmMetrics, Outcome } from './types.ts';

export function decideOutcome(args: { A: ArmMetrics; B: ArmMetrics; noiseBand?: number }): {
  outcome: Outcome;
  rationale: string;
};
