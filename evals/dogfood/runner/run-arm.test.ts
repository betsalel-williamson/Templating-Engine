import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { runArm } from './run-arm.mjs';

const passingCorrectness = {
  acceptancePass: true,
  specAlignmentPass: true,
  dirtyScopePass: true,
  details: ['ok'],
  valid: true,
};

const passingProcess = {
  observability: 'available',
  skillInjected: true,
  skillAbsentOnArmA: true,
  contractsEngaged: true,
  details: ['contract path seen in transcript'],
};

function makeTaskDir() {
  const taskDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dogfood-task-'));
  fs.writeFileSync(path.join(taskDir, 'task.md'), 'Implement the gate.\n');
  return taskDir;
}

function makeWorktree({ withSkill = false } = {}) {
  const worktreeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dogfood-arm-'));
  if (withSkill) {
    const skillDir = path.join(worktreeRoot, '.agents/skills/v2-engine-build');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '# skill\n');
  }
  return worktreeRoot;
}

describe('runArm', () => {
  it('fails closed without an API key before touching the SDK', async () => {
    const create = vi.fn();

    await expect(
      runArm({
        arm: 'A',
        worktreeRoot: '/repo',
        taskDir: '/task',
        apiKey: '',
        Agent: { create },
      })
    ).rejects.toThrow('CURSOR_API_KEY is required for dogfood runs');
    expect(create).not.toHaveBeenCalled();
  });

  it('runs Arm B with the treatment skill prompt and captured stream events', async () => {
    const taskDir = makeTaskDir();
    const send = vi.fn(async () => ({
      id: 'sdk-run-1',
      async *stream() {
        yield { kind: 'message', text: 'docs/features/language-spec/host-layer-contracts.md' };
      },
      wait: vi.fn(async () => ({
        status: 'finished',
        usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
      })),
    }));
    const create = vi.fn(async () => ({ send }));
    const scoreCorrectnessFn = vi.fn(() => passingCorrectness);
    const scoreProcessFn = vi.fn(() => passingProcess);
    const worktreeRoot = makeWorktree({ withSkill: true });

    try {
      const result = await runArm({
        arm: 'B',
        worktreeRoot,
        taskDir,
        modelId: 'test-model',
        apiKey: 'test-key',
        Agent: { create },
        scoreCorrectnessFn,
        scoreProcessFn,
        skillAbsentOnArmA: true,
      });

      expect(create).toHaveBeenCalledWith({
        apiKey: 'test-key',
        model: { id: 'test-model' },
        name: 'dogfood-B',
        local: {
          cwd: worktreeRoot,
          sandboxOptions: { enabled: false },
        },
      });
      expect(send).toHaveBeenCalledWith(
        expect.stringContaining('Use the v2-engine-build skill. Follow it strictly.')
      );
      expect(scoreProcessFn).toHaveBeenCalledWith({
        arm: 'B',
        worktreeRoot,
        skillPresent: true,
        transcriptEvents: [
          { kind: 'message', text: 'docs/features/language-spec/host-layer-contracts.md' },
        ],
        skillAbsentOnArmA: true,
      });
      expect(result).toMatchObject({
        arm: 'B',
        valid: true,
        runId: 'sdk-run-1',
        usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
      });
    } finally {
      fs.rmSync(worktreeRoot, { recursive: true, force: true });
      fs.rmSync(taskDir, { recursive: true, force: true });
    }
  });

  it('keeps Arm A free of the treatment skill prompt', async () => {
    const taskDir = makeTaskDir();
    const send = vi.fn(async () => ({
      id: 'sdk-run-a',
      async *stream() {},
      wait: vi.fn(async () => ({ status: 'finished', usage: { totalTokens: 1 } })),
    }));
    const create = vi.fn(async () => ({ send }));

    try {
      await runArm({
        arm: 'A',
        worktreeRoot: '/repo',
        taskDir,
        apiKey: 'test-key',
        Agent: { create },
        scoreCorrectnessFn: vi.fn(() => passingCorrectness),
        scoreProcessFn: vi.fn(() => passingProcess),
      });

      const prompt = send.mock.calls[0]?.[0] ?? '';
      expect(prompt).toContain('No special skills are provided.');
      expect(prompt).not.toContain('Use the v2-engine-build skill');
    } finally {
      fs.rmSync(taskDir, { recursive: true, force: true });
    }
  });

  it('scores Arm A skill absence from the worktree', async () => {
    const taskDir = makeTaskDir();
    const worktreeRoot = makeWorktree();
    const send = vi.fn(async () => ({
      id: 'sdk-run-a-isolation',
      async *stream() {},
      wait: vi.fn(async () => ({ status: 'finished', usage: { totalTokens: 1 } })),
    }));
    const create = vi.fn(async () => ({ send }));
    const scoreProcessFn = vi.fn(() => passingProcess);

    try {
      await runArm({
        arm: 'A',
        worktreeRoot,
        taskDir,
        apiKey: 'test-key',
        Agent: { create },
        scoreCorrectnessFn: vi.fn(() => passingCorrectness),
        scoreProcessFn,
      });

      expect(scoreProcessFn).toHaveBeenCalledWith(
        expect.objectContaining({
          arm: 'A',
          worktreeRoot,
          skillPresent: false,
          skillAbsentOnArmA: true,
        })
      );
    } finally {
      fs.rmSync(worktreeRoot, { recursive: true, force: true });
      fs.rmSync(taskDir, { recursive: true, force: true });
    }
  });

  it('invalidates cancelled SDK runs', async () => {
    const taskDir = makeTaskDir();
    const send = vi.fn(async () => ({
      id: 'sdk-run-cancelled',
      async *stream() {},
      wait: vi.fn(async () => ({ status: 'cancelled', usage: { totalTokens: 1 } })),
    }));
    const create = vi.fn(async () => ({ send }));

    try {
      const result = await runArm({
        arm: 'A',
        worktreeRoot: '/repo',
        taskDir,
        apiKey: 'test-key',
        Agent: { create },
        scoreCorrectnessFn: vi.fn(() => passingCorrectness),
        scoreProcessFn: vi.fn(() => passingProcess),
      });

      expect(result).toMatchObject({
        valid: false,
        error: 'run ended with status cancelled',
      });
    } finally {
      fs.rmSync(taskDir, { recursive: true, force: true });
    }
  });
});
