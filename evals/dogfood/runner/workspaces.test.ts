import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { checkDirtyScope } from '../scorers/correctness.mjs';
import { hasTreatmentSkill } from './run-arm.mjs';
import { createArmWorktrees } from './workspaces.mjs';

function git(repoRoot: string, args: string[]) {
  const result = spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed: ${result.stderr}`);
  }
}

function makeRepo() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dogfood-workspaces-'));
  fs.mkdirSync(path.join(repoRoot, 'evals/dogfood/skills/v2-engine-build'), {
    recursive: true,
  });
  fs.mkdirSync(path.join(repoRoot, 'task'), { recursive: true });
  fs.writeFileSync(
    path.join(repoRoot, 'evals/dogfood/skills/v2-engine-build/SKILL.md'),
    '# treatment skill\n'
  );
  fs.writeFileSync(path.join(repoRoot, '.gitignore'), '.agents/\n');
  fs.writeFileSync(
    path.join(repoRoot, 'task/allowlist.txt'),
    'packages/template-engine-core/src/\n'
  );

  git(repoRoot, ['init']);
  git(repoRoot, ['config', 'user.email', 'test@example.com']);
  git(repoRoot, ['config', 'user.name', 'Test User']);
  git(repoRoot, ['add', '.']);
  git(repoRoot, ['commit', '-m', 'initial']);
  return repoRoot;
}

describe('createArmWorktrees', () => {
  it('keeps Arm A runtime skill isolation out of dirty-scope status', () => {
    const repoRoot = makeRepo();
    const installDependenciesFn = vi.fn();
    let pair: ReturnType<typeof createArmWorktrees> | undefined;

    try {
      pair = createArmWorktrees({
        repoRoot,
        runId: `dirty-${Date.now()}`,
        installDependenciesFn,
      });

      expect(fs.existsSync(path.join(pair.armA, '.agents/skills/v2-engine-build/SKILL.md'))).toBe(
        false
      );
      expect(
        fs.existsSync(path.join(pair.armA, 'evals/dogfood/skills/v2-engine-build/SKILL.md'))
      ).toBe(false);
      expect(hasTreatmentSkill(pair.armA)).toBe(false);
      expect(hasTreatmentSkill(pair.armB)).toBe(true);
      expect(
        fs.existsSync(path.join(pair.armB, 'evals/dogfood/skills/v2-engine-build/SKILL.md'))
      ).toBe(true);
      expect(
        checkDirtyScope({ worktreeRoot: pair.armA, taskDir: path.join(repoRoot, 'task') })
      ).toMatchObject({ pass: true, detail: 'dirty-scope ok' });
      expect(
        checkDirtyScope({ worktreeRoot: pair.armB, taskDir: path.join(repoRoot, 'task') })
      ).toMatchObject({ pass: true, detail: 'dirty-scope ok' });
    } finally {
      pair?.cleanup();
      fs.rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it('bootstraps frozen dependencies in each worktree', () => {
    const repoRoot = makeRepo();
    const installDependenciesFn = vi.fn();
    let pair: ReturnType<typeof createArmWorktrees> | undefined;

    try {
      pair = createArmWorktrees({
        repoRoot,
        runId: `deps-${Date.now()}`,
        installDependenciesFn,
      });

      expect(installDependenciesFn).toHaveBeenCalledWith({ worktreeRoot: pair.armA });
      expect(installDependenciesFn).toHaveBeenCalledWith({ worktreeRoot: pair.armB });
    } finally {
      pair?.cleanup();
      fs.rmSync(repoRoot, { recursive: true, force: true });
    }
  });
});
