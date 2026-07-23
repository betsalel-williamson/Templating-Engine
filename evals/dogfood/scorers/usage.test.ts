import { describe, expect, it } from 'vitest';
import { betterDuration, betterTotalTokens, normalizeUsage, withinNoiseBand } from './usage.mjs';

describe('normalizeUsage', () => {
  it('returns null for undefined', () => {
    expect(normalizeUsage(undefined)).toBeNull();
  });

  it('copies Cursor TokenUsage fields', () => {
    expect(
      normalizeUsage({
        inputTokens: 10,
        outputTokens: 5,
        cacheReadTokens: 2,
        cacheWriteTokens: 1,
        totalTokens: 18,
      })
    ).toEqual({
      inputTokens: 10,
      outputTokens: 5,
      cacheReadTokens: 2,
      cacheWriteTokens: 1,
      totalTokens: 18,
    });
  });
});

describe('withinNoiseBand', () => {
  it('treats <=10% relative delta as tie', () => {
    expect(withinNoiseBand(100, 109, 0.1)).toBe(true);
    expect(withinNoiseBand(100, 112, 0.1)).toBe(false);
  });
});

describe('betterTotalTokens', () => {
  it('returns null inside noise band', () => {
    expect(betterTotalTokens(100, 105, 0.1)).toBeNull();
  });

  it('returns B when B is clearly lower', () => {
    expect(betterTotalTokens(200, 100, 0.1)).toBe('B');
  });

  it('returns A when A is clearly lower', () => {
    expect(betterTotalTokens(100, 200, 0.1)).toBe('A');
  });
});

describe('betterDuration', () => {
  it('returns B when B is clearly faster', () => {
    expect(betterDuration(2000, 1000, 0.1)).toBe('B');
  });
});
