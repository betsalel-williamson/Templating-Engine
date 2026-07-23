import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { resolveNoiseBand, runPair } from './run-pair.mjs';

const processChecks = {
  observability: 'unavailable',
  skillInjected: true,
  skillAbsentOnArmA: true,
  contractsEngaged: null,
  details: ['transcript unavailable'],
};

function armMetrics(arm: 'A' | 'B') {
  return {
    arm,
    valid: true,
    durationMs: arm === 'A' ? 100 : 90,
    usage: {
      inputTokens: 10,
      outputTokens: 5,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      totalTokens: 15,
    },
    correctness: {
      acceptancePass: true,
      specAlignmentPass: true,
      dirtyScopePass: true,
      details: ['ok'],
    },
    process: processChecks,
    runId: `run-${arm}`,
  };
}

describe('resolveNoiseBand', () => {
  it('returns ADR-006 default for empty, NaN, negative, and above-10% values', () => {
    expect(resolveNoiseBand(undefined)).toBe(0.1);
    expect(resolveNoiseBand(null)).toBe(0.1);
    expect(resolveNoiseBand('')).toBe(0.1);
    expect(resolveNoiseBand('not-a-number')).toBe(0.1);
    expect(resolveNoiseBand(-0.05)).toBe(0.1);
    expect(resolveNoiseBand(0.2)).toBe(0.1);
  });

  it('accepts valid values within the ADR-006 band', () => {
    expect(resolveNoiseBand(0.1)).toBe(0.1);
    expect(resolveNoiseBand('0.05')).toBe(0.05);
    expect(resolveNoiseBand(0)).toBe(0);
  });
});

describe('runPair', () => {
  it('fails closed without an API key before creating worktrees', async () => {
    const createArmWorktreesFn = vi.fn();

    await expect(
      runPair({
        repoRoot: '/repo',
        taskDir: '/repo/evals/dogfood/tasks/v2-trusted-template-gate',
        runId: 'no-key',
        apiKey: '',
        createArmWorktreesFn,
      })
    ).rejects.toThrow('CURSOR_API_KEY is required for dogfood runs');
    expect(createArmWorktreesFn).not.toHaveBeenCalled();
  });

  it('clamps invalid noiseBand values to the ADR-006 default', async () => {
    const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dogfood-pair-'));
    const taskDir = path.join(repoRoot, 'task');
    fs.mkdirSync(taskDir, { recursive: true });
    const cleanup = vi.fn();
    const armA = path.join(repoRoot, 'arm-a');
    const armB = path.join(repoRoot, 'arm-b');
    fs.mkdirSync(path.join(armB, '.agents/skills/v2-engine-build'), { recursive: true });
    fs.writeFileSync(path.join(armB, '.agents/skills/v2-engine-build/SKILL.md'), '# skill\n');
    const createArmWorktreesFn = vi.fn(() => ({
      armA,
      armB,
      cleanup,
    }));
    const runArmFn = vi.fn(async ({ arm }) => armMetrics(arm));
    const decideOutcomeFn = vi.fn(() => ({
      outcome: 'go',
      rationale: 'B wins duration',
    }));

    try {
      const result = await runPair({
        repoRoot,
        taskDir,
        runId: 'pair-invalid-band',
        noiseBand: 0.25,
        apiKey: 'test-key',
        createArmWorktreesFn,
        runArmFn,
        decideOutcomeFn,
      });

      expect(decideOutcomeFn).toHaveBeenCalledWith(expect.objectContaining({ noiseBand: 0.1 }));
      expect(result.report.noiseBand).toBe(0.1);
    } finally {
      fs.rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it('runs both arms, writes the report, and cleans up worktrees', async () => {
    const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dogfood-pair-'));
    const taskDir = path.join(repoRoot, 'task');
    fs.mkdirSync(taskDir, { recursive: true });
    const cleanup = vi.fn();
    const armA = path.join(repoRoot, 'arm-a');
    const armB = path.join(repoRoot, 'arm-b');
    fs.mkdirSync(path.join(armB, '.agents/skills/v2-engine-build'), { recursive: true });
    fs.writeFileSync(path.join(armB, '.agents/skills/v2-engine-build/SKILL.md'), '# skill\n');
    const createArmWorktreesFn = vi.fn(() => ({
      armA,
      armB,
      cleanup,
    }));
    const runArmFn = vi.fn(async ({ arm }) => armMetrics(arm));
    const decideOutcomeFn = vi.fn(() => ({
      outcome: 'go',
      rationale: 'B wins duration',
    }));

    try {
      const result = await runPair({
        repoRoot,
        taskDir,
        taskId: 'task',
        runId: 'pair-1',
        modelId: 'test-model',
        noiseBand: 0.05,
        apiKey: 'test-key',
        createArmWorktreesFn,
        runArmFn,
        decideOutcomeFn,
      });

      expect(createArmWorktreesFn).toHaveBeenCalledWith({ repoRoot, runId: 'pair-1' });
      expect(runArmFn).toHaveBeenCalledWith({
        arm: 'A',
        worktreeRoot: armA,
        taskDir,
        modelId: 'test-model',
        apiKey: 'test-key',
        skillAbsentOnArmA: true,
        skillPresent: false,
      });
      expect(runArmFn).toHaveBeenCalledWith({
        arm: 'B',
        worktreeRoot: armB,
        taskDir,
        modelId: 'test-model',
        apiKey: 'test-key',
        skillAbsentOnArmA: true,
        skillPresent: true,
      });
      expect(decideOutcomeFn).toHaveBeenCalledWith({
        A: armMetrics('A'),
        B: armMetrics('B'),
        noiseBand: 0.05,
      });
      expect(cleanup).toHaveBeenCalledOnce();
      expect(result.outFile).toBe(path.join(repoRoot, 'evals/dogfood/reports/pair-1.json'));
      expect(JSON.parse(fs.readFileSync(result.outFile, 'utf8'))).toMatchObject({
        taskId: 'task',
        modelId: 'test-model',
        noiseBand: 0.05,
        arms: { A: { arm: 'A' }, B: { arm: 'B' } },
        outcome: 'go',
        rationale: 'B wins duration',
      });
    } finally {
      fs.rmSync(repoRoot, { recursive: true, force: true });
    }
  });
});
