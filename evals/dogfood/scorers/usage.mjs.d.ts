import type { TokenUsageNorm } from './types.ts';

export function normalizeUsage(usage: TokenUsageNorm | undefined | null): TokenUsageNorm | null;

export function withinNoiseBand(a: number, b: number, band?: number): boolean;

export function betterTotalTokens(
  tokensA: number,
  tokensB: number,
  band?: number
): 'A' | 'B' | null;

export function betterDuration(msA: number, msB: number, band?: number): 'A' | 'B' | null;
