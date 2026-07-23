import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function runGit({ repoRoot, args }) {
  const result = spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed: ${result.stderr}`);
  }
}

export function installWorktreeDependencies({ worktreeRoot }) {
  const result = spawnSync('bash', ['-lc', 'pnpm install --frozen-lockfile'], {
    cwd: worktreeRoot,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(
      `pnpm install --frozen-lockfile failed in ${worktreeRoot}:\n${result.stdout}${result.stderr}`
    );
  }
}

export function createArmWorktrees({
  repoRoot,
  runId,
  skillSrcRel = 'evals/dogfood/skills/v2-engine-build',
  installDependenciesFn = installWorktreeDependencies,
}) {
  const base = path.join(repoRoot, '.worktrees');
  fs.mkdirSync(base, { recursive: true });
  const armA = path.join(base, `dogfood-a-${runId}`);
  const armB = path.join(base, `dogfood-b-${runId}`);
  const branchA = `dogfood/a-${runId}`;
  const branchB = `dogfood/b-${runId}`;

  const cleanup = () => {
    spawnSync('git', ['worktree', 'remove', '--force', armA], {
      cwd: repoRoot,
    });
    spawnSync('git', ['worktree', 'remove', '--force', armB], {
      cwd: repoRoot,
    });
    spawnSync('git', ['branch', '-D', branchA, branchB], { cwd: repoRoot });
  };

  try {
    for (const [dir, branch] of [
      [armA, branchA],
      [armB, branchB],
    ]) {
      runGit({ repoRoot, args: ['worktree', 'add', '-b', branch, dir, 'HEAD'] });
    }

    // ADR-006: Arm A must not receive the treatment skill via runtime injection or repo tree.
    runGit({ repoRoot: armA, args: ['rm', '-rf', skillSrcRel] });
    runGit({
      repoRoot: armA,
      args: ['commit', '-m', 'dogfood(a): remove treatment skill from control arm'],
    });
    const armASkill = path.join(armA, '.agents/skills/v2-engine-build');
    fs.rmSync(armASkill, { recursive: true, force: true });

    const skillSrc = path.join(repoRoot, skillSrcRel);
    const skillDst = path.join(armB, '.agents/skills/v2-engine-build');
    fs.cpSync(skillSrc, skillDst, { recursive: true });

    installDependenciesFn({ worktreeRoot: armA });
    installDependenciesFn({ worktreeRoot: armB });
  } catch (error) {
    cleanup();
    throw error;
  }

  return {
    armA,
    armB,
    cleanup,
  };
}
