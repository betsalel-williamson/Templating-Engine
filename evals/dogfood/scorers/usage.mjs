/**
 * @param {import('./types.ts').TokenUsageNorm | undefined | null} usage
 * @returns {import('./types.ts').TokenUsageNorm | null}
 */
export function normalizeUsage(usage) {
  if (!usage || typeof usage.totalTokens !== 'number') return null;
  return {
    inputTokens: usage.inputTokens ?? 0,
    outputTokens: usage.outputTokens ?? 0,
    cacheReadTokens: usage.cacheReadTokens ?? 0,
    cacheWriteTokens: usage.cacheWriteTokens ?? 0,
    totalTokens: usage.totalTokens,
    ...(usage.reasoningTokens != null ? { reasoningTokens: usage.reasoningTokens } : {}),
  };
}

/**
 * Relative |a-b|/max(a,b) <= band counts as tie. Zero/zero is a tie.
 * @param {number} a
 * @param {number} b
 * @param {number} [band]
 */
export function withinNoiseBand(a, b, band = 0.1) {
  const denom = Math.max(Math.abs(a), Math.abs(b), 1);
  return Math.abs(a - b) / denom <= band;
}

/**
 * @param {number} tokensA
 * @param {number} tokensB
 * @param {number} [band]
 * @returns {'A'|'B'|null}
 */
export function betterTotalTokens(tokensA, tokensB, band = 0.1) {
  if (withinNoiseBand(tokensA, tokensB, band)) return null;
  return tokensB < tokensA ? 'B' : 'A';
}

/**
 * @param {number} msA
 * @param {number} msB
 * @param {number} [band]
 * @returns {'A'|'B'|null}
 */
export function betterDuration(msA, msB, band = 0.1) {
  if (withinNoiseBand(msA, msB, band)) return null;
  return msB < msA ? 'B' : 'A';
}
