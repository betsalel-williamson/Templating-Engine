import { betterDuration, betterTotalTokens } from './usage.mjs';

/**
 * ADR-006 §5 mapping.
 * @param {{ A: import('./types.ts').ArmMetrics, B: import('./types.ts').ArmMetrics, noiseBand?: number }} args
 */
export function decideOutcome({ A, B, noiseBand = 0.1 }) {
  if (!A.valid && !B.valid) {
    return {
      outcome: 'inconclusive',
      rationale:
        'Both arms invalid — fix task, acceptance, or harness before any language decision.',
    };
  }
  if (A.valid && !B.valid) {
    return {
      outcome: 'no-go',
      rationale: 'A valid and B invalid — against hypothesis (skill/contracts not enough).',
    };
  }
  if (!A.valid && B.valid) {
    return {
      outcome: 'slim-go',
      rationale:
        'Only B valid — mixed evidence; treat as slim-go and inspect baseline task difficulty.',
    };
  }

  if (!A.usage || !B.usage) {
    return {
      outcome: 'inconclusive',
      rationale: 'Missing usage metrics on a valid run — cannot compare tokens.',
    };
  }

  const tokenWinner = betterTotalTokens(A.usage.totalTokens, B.usage.totalTokens, noiseBand);
  const timeWinner = betterDuration(A.durationMs, B.durationMs, noiseBand);

  if (tokenWinner === 'B' && timeWinner !== 'A') {
    return {
      outcome: 'go',
      rationale: `B wins tokens (${A.usage.totalTokens}→${B.usage.totalTokens}); duration not worse beyond ${noiseBand * 100}% band.`,
    };
  }
  if (timeWinner === 'B' && tokenWinner !== 'A') {
    return {
      outcome: 'go',
      rationale: `B wins duration (${A.durationMs}→${B.durationMs}ms); tokens not worse beyond ${noiseBand * 100}% band.`,
    };
  }
  if (tokenWinner === 'A' && timeWinner === 'A') {
    return {
      outcome: 'no-go',
      rationale: 'B worse on both tokens and duration.',
    };
  }
  return {
    outcome: 'slim-go',
    rationale: `Mixed or tied metrics (tokens winner=${tokenWinner}, time winner=${timeWinner}).`,
  };
}
