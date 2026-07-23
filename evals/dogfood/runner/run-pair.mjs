import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { decideOutcome } from '../scorers/decide.mjs';
import { runArm } from './run-arm.mjs';
import { createArmWorktrees } from './workspaces.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultRepoRoot = path.resolve(__dirname, '../../..');

function requireApiKey(apiKey) {
  if (!apiKey) {
    throw new Error('CURSOR_API_KEY is required for dogfood runs');
  }
}

/**
 * @param {{
 *   repoRoot?: string,
 *   taskId?: string,
 *   taskDir?: string,
 *   runId?: string,
 *   modelId?: string,
 *   noiseBand?: number,
 *   apiKey?: string,
 *   keepWorktrees?: boolean,
 *   createArmWorktreesFn?: typeof createArmWorktrees,
 *   runArmFn?: typeof runArm,
 *   decideOutcomeFn?: typeof decideOutcome,
 * }} [args]
 */
export async function runPair({
  repoRoot = defaultRepoRoot,
  taskId = process.env.DOGFOOD_TASK ?? 'v2-trusted-template-gate',
  taskDir = path.join(repoRoot, 'evals/dogfood/tasks', taskId),
  runId = process.env.DOGFOOD_RUN_ID ?? `run-${Date.now()}`,
  modelId = process.env.DOGFOOD_MODEL ?? 'composer-2',
  noiseBand = Number(process.env.DOGFOOD_NOISE_BAND ?? '0.1'),
  apiKey = process.env.CURSOR_API_KEY,
  keepWorktrees = process.env.DOGFOOD_KEEP_WORKTREES === '1',
  createArmWorktreesFn = createArmWorktrees,
  runArmFn = runArm,
  decideOutcomeFn = decideOutcome,
} = {}) {
  requireApiKey(apiKey);

  const pair = createArmWorktreesFn({ repoRoot, runId });
  try {
    const [A, B] = await Promise.all([
      runArmFn({ arm: 'A', worktreeRoot: pair.armA, taskDir, modelId, apiKey }),
      runArmFn({ arm: 'B', worktreeRoot: pair.armB, taskDir, modelId, apiKey }),
    ]);

    const { outcome, rationale } = decideOutcomeFn({ A, B, noiseBand });
    const report = {
      taskId,
      modelId,
      noiseBand,
      arms: { A, B },
      outcome,
      rationale,
      createdAt: new Date().toISOString(),
    };

    const outDir = path.join(repoRoot, 'evals/dogfood/reports');
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, `${runId}.json`);
    fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

    return { outFile, outcome, rationale, report };
  } finally {
    if (!keepWorktrees) {
      pair.cleanup();
    }
  }
}

function isCliEntrypoint() {
  return process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
}

if (isCliEntrypoint()) {
  try {
    const { outFile, outcome, rationale } = await runPair();
    console.log(JSON.stringify({ outFile, outcome, rationale }, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
