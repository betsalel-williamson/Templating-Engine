import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * @param {{ acceptancePass: boolean, specAlignmentPass: boolean, dirtyScopePass: boolean, details: string[] }} parts
 */
export function evaluateCorrectnessParts(parts) {
  const valid = parts.acceptancePass && parts.specAlignmentPass && parts.dirtyScopePass;
  return { ...parts, valid };
}

/**
 * @param {{ worktreeRoot: string, taskDir: string }} args
 */
export function runAcceptance({ worktreeRoot, taskDir }) {
  const acceptanceDir = path.join(taskDir, 'acceptance');
  const acceptanceConfig = path.join(worktreeRoot, 'evals/dogfood/vitest.acceptance.config.ts');
  const result = spawnSync(
    'bash',
    [
      '-lc',
      `cd ${JSON.stringify(worktreeRoot)} && DOGFOOD_WORKTREE=${JSON.stringify(worktreeRoot)} pnpm --filter @bwilliamson/dogfood-evals exec vitest run --config ${JSON.stringify(acceptanceConfig)} ${JSON.stringify(acceptanceDir)}`,
    ],
    { encoding: 'utf8' }
  );
  return {
    pass: result.status === 0,
    detail: `${result.stdout ?? ''}${result.stderr ?? ''}`,
  };
}

/**
 * @param {{ worktreeRoot: string, taskDir: string }} args
 */
export function runSpecAlignment({ worktreeRoot, taskDir }) {
  const script = path.join(taskDir, 'spec-alignment.mjs');
  const result = spawnSync(
    'bash',
    ['-lc', `node ${JSON.stringify(script)} ${JSON.stringify(worktreeRoot)}`],
    { encoding: 'utf8' }
  );
  return {
    pass: result.status === 0,
    detail: `${result.stdout ?? ''}${result.stderr ?? ''}`,
  };
}

/**
 * @param {{ worktreeRoot: string, taskDir: string }} args
 */
export function checkDirtyScope({ worktreeRoot, taskDir }) {
  const allowlistPath = path.join(taskDir, 'allowlist.txt');
  const allow = fs.existsSync(allowlistPath)
    ? fs
        .readFileSync(allowlistPath, 'utf8')
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'))
    : null;

  if (!allow) {
    return { pass: true, detail: 'no allowlist — dirty-scope skipped' };
  }

  const status = spawnSync('git', ['status', '--porcelain'], {
    cwd: worktreeRoot,
    encoding: 'utf8',
  });
  const dirty = status.stdout
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^\S+\s+/, ''));

  const offenders = dirty.filter(
    (f) => !allow.some((a) => f === a || f.startsWith(a.endsWith('/') ? a : `${a}/`))
  );
  return {
    pass: offenders.length === 0,
    detail:
      offenders.length === 0 ? 'dirty-scope ok' : `outside allowlist: ${offenders.join(', ')}`,
  };
}

/**
 * @param {{ worktreeRoot: string, taskDir: string }} args
 */
export function scoreCorrectness({ worktreeRoot, taskDir }) {
  const acceptance = runAcceptance({ worktreeRoot, taskDir });
  const spec = runSpecAlignment({ worktreeRoot, taskDir });
  const dirty = checkDirtyScope({ worktreeRoot, taskDir });
  return evaluateCorrectnessParts({
    acceptancePass: acceptance.pass,
    specAlignmentPass: spec.pass,
    dirtyScopePass: dirty.pass,
    details: [acceptance.detail, spec.detail, dirty.detail],
  });
}
