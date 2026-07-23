import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { resolveSkillName, skillAgentsRel, skillSrcRel } from '../task-config.mjs';

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

/**
 * @param {{
 *   repoRoot: string,
 *   runId: string,
 *   skillName?: string,
 *   installDependenciesFn?: typeof installWorktreeDependencies,
 * }} args
 */
export function createArmWorktrees({
  repoRoot,
  runId,
  skillName = resolveSkillName(),
  installDependenciesFn = installWorktreeDependencies,
}) {
  const skillSrcRelPath = skillSrcRel(skillName);
  const skillAgentsRelPath = skillAgentsRel(skillName);
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
    runGit({ repoRoot: armA, args: ['rm', '-rf', skillSrcRelPath] });
    runGit({
      repoRoot: armA,
      args: ['commit', '-m', `dogfood(a): remove ${skillName} treatment skill from control arm`],
    });
    fs.rmSync(path.join(armA, skillAgentsRelPath), { recursive: true, force: true });

    const skillSrc = path.join(repoRoot, skillSrcRelPath);
    const skillDst = path.join(armB, skillAgentsRelPath);
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
    skillName,
  };
}
