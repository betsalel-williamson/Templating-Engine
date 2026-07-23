import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { evaluateCorrectnessParts, runAcceptance } from './correctness.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

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

describe('runAcceptance', () => {
  it('runs acceptance tests from the worktree task path', () => {
    const taskId = `.tmp-acceptance-${Date.now()}`;
    const taskDir = path.join(repoRoot, 'evals/dogfood/tasks', taskId);
    const acceptanceDir = path.join(taskDir, 'acceptance');
    fs.mkdirSync(acceptanceDir, { recursive: true });
    fs.writeFileSync(
      path.join(acceptanceDir, 'env.test.ts'),
      [
        "import { describe, expect, it } from 'vitest';",
        "describe('acceptance smoke', () => {",
        "  it('receives the target worktree path', () => {",
        `    expect(process.env.DOGFOOD_WORKTREE).toBe(${JSON.stringify(repoRoot)});`,
        '  });',
        '});',
        '',
      ].join('\n')
    );

    try {
      const result = runAcceptance({ worktreeRoot: repoRoot, taskDir });
      expect(result.pass, result.detail).toBe(true);
    } finally {
      fs.rmSync(taskDir, { recursive: true, force: true });
    }
  });
});
