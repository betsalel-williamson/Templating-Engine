import { describe, expect, it } from 'vitest';
import { decideOutcome } from './decide.mjs';

function arm(partial: Record<string, unknown> = {}) {
  return {
    arm: 'A' as const,
    valid: true,
    durationMs: 1000,
    usage: {
      inputTokens: 50,
      outputTokens: 50,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      totalTokens: 100,
    },
    correctness: {
      acceptancePass: true,
      specAlignmentPass: true,
      dirtyScopePass: true,
      details: [] as string[],
    },
    process: {
      observability: 'available' as const,
      skillInjected: true,
      skillAbsentOnArmA: true,
      contractsEngaged: true as boolean | null,
      details: [] as string[],
    },
    ...partial,
  };
}

describe('decideOutcome', () => {
  it('inconclusive when both invalid', () => {
    const r = decideOutcome({
      A: arm({ arm: 'A', valid: false }),
      B: arm({ arm: 'B', valid: false }),
      noiseBand: 0.1,
    });
    expect(r.outcome).toBe('inconclusive');
  });

  it('no-go when A valid and B invalid', () => {
    const r = decideOutcome({
      A: arm({ arm: 'A', valid: true }),
      B: arm({ arm: 'B', valid: false }),
      noiseBand: 0.1,
    });
    expect(r.outcome).toBe('no-go');
  });

  it('go when B wins tokens and duration not worse beyond band', () => {
    const r = decideOutcome({
      A: arm({
        arm: 'A',
        usage: { ...arm().usage, totalTokens: 200 },
        durationMs: 1000,
      }),
      B: arm({
        arm: 'B',
        usage: { ...arm().usage, totalTokens: 100 },
        durationMs: 1050,
      }),
      noiseBand: 0.1,
    });
    expect(r.outcome).toBe('go');
  });

  it('no-go when B worse on tokens and duration', () => {
    const r = decideOutcome({
      A: arm({
        arm: 'A',
        usage: { ...arm().usage, totalTokens: 100 },
        durationMs: 1000,
      }),
      B: arm({
        arm: 'B',
        usage: { ...arm().usage, totalTokens: 200 },
        durationMs: 2000,
      }),
      noiseBand: 0.1,
    });
    expect(r.outcome).toBe('no-go');
  });

  it('slim-go when only one metric clearly favors B', () => {
    const r = decideOutcome({
      A: arm({
        arm: 'A',
        usage: { ...arm().usage, totalTokens: 200 },
        durationMs: 1000,
      }),
      B: arm({
        arm: 'B',
        usage: { ...arm().usage, totalTokens: 100 },
        durationMs: 2000,
      }),
      noiseBand: 0.1,
    });
    expect(r.outcome).toBe('slim-go');
  });
});
