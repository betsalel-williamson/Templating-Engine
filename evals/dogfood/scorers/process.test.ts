import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { processPass, scoreProcess } from './process.mjs';

describe('scoreProcess', () => {
  it('marks skillInjected when B worktree has the skill dir', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dogfood-proc-'));
    const skillDir = path.join(root, '.agents/skills/v2-engine-build');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '# skill\n');
    const checks = scoreProcess({
      arm: 'B',
      worktreeRoot: root,
      transcriptEvents: null,
    });
    expect(checks.skillInjected).toBe(true);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('sets contractsEngaged true when transcript shows Read of host-layer-contracts.md', () => {
    const checks = scoreProcess({
      arm: 'B',
      worktreeRoot: '/tmp/fake-b',
      skillPresent: true,
      transcriptEvents: [
        {
          type: 'tool_call',
          name: 'Read',
          args: { path: 'docs/features/language-spec/host-layer-contracts.md' },
        },
      ],
    });
    expect(checks.contractsEngaged).toBe(true);
    expect(checks.observability).toBe('available');
  });

  it('sets observability unavailable when no transcript provided', () => {
    const checks = scoreProcess({
      arm: 'B',
      worktreeRoot: '/tmp/fake-b',
      skillPresent: true,
      transcriptEvents: null,
    });
    expect(checks.observability).toBe('unavailable');
    expect(checks.contractsEngaged).toBeNull();
  });
});

describe('processPass', () => {
  it('requires skillInjected on B when observability available', () => {
    expect(
      processPass('B', {
        observability: 'available',
        skillInjected: false,
        skillAbsentOnArmA: true,
        contractsEngaged: true,
        details: [],
      })
    ).toBe(false);
  });

  it('does not fail B on contractsEngaged when observability unavailable', () => {
    expect(
      processPass('B', {
        observability: 'unavailable',
        skillInjected: true,
        skillAbsentOnArmA: true,
        contractsEngaged: null,
        details: [],
      })
    ).toBe(true);
  });
});
