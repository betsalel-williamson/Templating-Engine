import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { processPass, runStaticProcessChecks, scoreProcess } from './process.mjs';

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
      skillAbsentOnArmA: true,
    });
    expect(checks.observability).toBe('unavailable');
    expect(checks.contractsEngaged).toBeNull();
  });

  it('detects when Arm A still has the treatment skill injected', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dogfood-proc-'));
    const skillDir = path.join(root, '.agents/skills/v2-engine-build');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '# skill\n');

    try {
      const checks = scoreProcess({
        arm: 'A',
        worktreeRoot: root,
        transcriptEvents: null,
      });

      expect(checks.skillInjected).toBe(true);
      expect(checks.skillAbsentOnArmA).toBe(false);
      expect(processPass('A', checks)).toBe(false);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
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
        staticPass: true,
        details: [],
      })
    ).toBe(true);
  });

  it('fails Arm A when core import is present (calculator gate)', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dogfood-calc-a-'));
    const taskId = 'calculator-cli';
    const src = path.join(root, 'evals/dogfood/tasks', taskId, 'src');
    fs.mkdirSync(src, { recursive: true });
    fs.writeFileSync(
      path.join(src, 'cli.ts'),
      "import x from '@bwilliamson/template-engine-core';\n"
    );
    try {
      const result = runStaticProcessChecks({
        arm: 'A',
        worktreeRoot: root,
        taskId,
        processConfig: { armAChecks: { forbidCoreImport: true } },
      });
      expect(result.pass).toBe(false);
      expect(
        processPass('A', {
          staticPass: result.pass,
          skillAbsentOnArmA: true,
          skillInjected: false,
          observability: 'unavailable',
          contractsEngaged: null,
          details: [],
        })
      ).toBe(false);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('requires build-time codegen structure for Arm B calculator gate', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dogfood-calc-b-'));
    const taskId = 'calculator-cli';
    const taskRoot = path.join(root, 'evals/dogfood/tasks', taskId);
    const src = path.join(taskRoot, 'src');
    const scripts = path.join(taskRoot, 'scripts');
    const templates = path.join(taskRoot, 'templates');
    const generated = path.join(src, 'generated');
    fs.mkdirSync(scripts, { recursive: true });
    fs.mkdirSync(templates, { recursive: true });
    fs.mkdirSync(generated, { recursive: true });
    fs.writeFileSync(
      path.join(scripts, 'codegen.mjs'),
      "import '@bwilliamson/template-engine-core';\n"
    );
    fs.writeFileSync(path.join(src, 'cli.ts'), "import { HELP } from './generated/help.js';\n");
    fs.writeFileSync(path.join(generated, 'help.ts'), 'export const HELP = "x";\n');
    fs.writeFileSync(path.join(templates, 'help.ts.template'), '<#x#>');
    fs.writeFileSync(path.join(templates, 'dispatch.ts.template'), '<#y#>');
    const config = {
      armBChecks: {
        requireCodegenScript: true,
        requireTemplateFiles: true,
        requireGeneratedTs: true,
        forbidRuntimeCoreInSrc: true,
      },
    };
    try {
      const result = runStaticProcessChecks({
        arm: 'B',
        worktreeRoot: root,
        taskId,
        processConfig: config,
      });
      expect(result.pass).toBe(true);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
