export type ArmId = 'A' | 'B';

export type Outcome = 'go' | 'slim-go' | 'no-go' | 'inconclusive';

export type ProcessObservability = 'available' | 'unavailable';

export interface TokenUsageNorm {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  totalTokens: number;
  reasoningTokens?: number;
}

export interface ProcessChecks {
  observability: ProcessObservability;
  skillInjected: boolean;
  skillAbsentOnArmA: boolean;
  contractsEngaged: boolean | null;
  details: string[];
}

export interface ArmMetrics {
  arm: ArmId;
  valid: boolean;
  durationMs: number;
  usage: TokenUsageNorm | null;
  correctness: {
    acceptancePass: boolean;
    specAlignmentPass: boolean;
    dirtyScopePass: boolean;
    details: string[];
  };
  process: ProcessChecks;
  runId?: string;
  error?: string;
}

export interface PairReport {
  taskId: string;
  modelId: string;
  noiseBand: number;
  arms: { A: ArmMetrics; B: ArmMetrics };
  outcome: Outcome;
  rationale: string;
  createdAt: string;
}
