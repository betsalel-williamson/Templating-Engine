import { describe, expect, it } from 'vitest';
import { evaluateCorrectnessParts } from './correctness.mjs';

describe('evaluateCorrectnessParts', () => {
  it('valid only when all three pass', () => {
    const ok = evaluateCorrectnessParts({
      acceptancePass: true,
      specAlignmentPass: true,
      dirtyScopePass: true,
      details: [],
    });
    expect(ok.valid).toBe(true);

    const bad = evaluateCorrectnessParts({
      acceptancePass: true,
      specAlignmentPass: false,
      dirtyScopePass: true,
      details: ['spec'],
    });
    expect(bad.valid).toBe(false);
  });
});
