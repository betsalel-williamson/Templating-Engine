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
        status: 'completed',
        usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
      })),
    }));
    const create = vi.fn(async () => ({ send }));
    const scoreCorrectnessFn = vi.fn(() => passingCorrectness);
    const scoreProcessFn = vi.fn(() => passingProcess);

    try {
      const result = await runArm({
        arm: 'B',
        worktreeRoot: '/repo',
        taskDir,
        modelId: 'test-model',
        apiKey: 'test-key',
        Agent: { create },
        scoreCorrectnessFn,
        scoreProcessFn,
      });

      expect(create).toHaveBeenCalledWith({
        apiKey: 'test-key',
        model: { id: 'test-model' },
        name: 'dogfood-B',
        local: {
          cwd: '/repo',
          sandboxOptions: { enabled: false },
        },
      });
      expect(send).toHaveBeenCalledWith(
        expect.stringContaining('Use the v2-engine-build skill. Follow it strictly.')
      );
      expect(scoreProcessFn).toHaveBeenCalledWith({
        arm: 'B',
        worktreeRoot: '/repo',
        transcriptEvents: [
          { kind: 'message', text: 'docs/features/language-spec/host-layer-contracts.md' },
        ],
        peerSkillAbsent: true,
      });
      expect(result).toMatchObject({
        arm: 'B',
        valid: true,
        runId: 'sdk-run-1',
        usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
      });
    } finally {
      fs.rmSync(taskDir, { recursive: true, force: true });
    }
  });

  it('keeps Arm A free of the treatment skill prompt', async () => {
    const taskDir = makeTaskDir();
    const send = vi.fn(async () => ({
      id: 'sdk-run-a',
      async *stream() {},
      wait: vi.fn(async () => ({ status: 'completed', usage: { totalTokens: 1 } })),
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
});
