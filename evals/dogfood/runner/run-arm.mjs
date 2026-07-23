import fs from 'node:fs';
import path from 'node:path';
import { Agent as CursorAgent } from '@cursor/sdk';
import { scoreCorrectness } from '../scorers/correctness.mjs';
import { scoreProcess, processPass } from '../scorers/process.mjs';
import { normalizeUsage } from '../scorers/usage.mjs';

export function buildArmPrompt({ arm, taskBody }) {
  return arm === 'B'
    ? `${taskBody}\n\nUse the v2-engine-build skill. Follow it strictly.\n`
    : `${taskBody}\n\nNo special skills are provided. Solve with general engineering judgment.\n`;
}

function requireApiKey(apiKey) {
  if (!apiKey) {
    throw new Error('CURSOR_API_KEY is required for dogfood runs');
  }
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * @param {{
 *   arm: 'A'|'B',
 *   worktreeRoot: string,
 *   taskDir: string,
 *   peerSkillAbsent?: boolean,
 *   modelId?: string,
 *   apiKey?: string,
 *   Agent?: typeof CursorAgent,
 *   scoreCorrectnessFn?: typeof scoreCorrectness,
 *   scoreProcessFn?: typeof scoreProcess,
 *   processPassFn?: typeof processPass,
 *   normalizeUsageFn?: typeof normalizeUsage,
 * }} args
 */
export async function runArm({
  arm,
  worktreeRoot,
  taskDir,
  peerSkillAbsent = true,
  modelId = process.env.DOGFOOD_MODEL ?? 'composer-2',
  apiKey = process.env.CURSOR_API_KEY,
  Agent = CursorAgent,
  scoreCorrectnessFn = scoreCorrectness,
  scoreProcessFn = scoreProcess,
  processPassFn = processPass,
  normalizeUsageFn = normalizeUsage,
}) {
  requireApiKey(apiKey);

  const taskBody = fs.readFileSync(path.join(taskDir, 'task.md'), 'utf8');
  const prompt = buildArmPrompt({ arm, taskBody });
  const started = Date.now();

  let agent;
  let runId;
  let usage = null;
  let error;
  let transcriptEvents = [];

  try {
    agent = await Agent.create({
      apiKey,
      model: { id: modelId },
      name: `dogfood-${arm}`,
      local: {
        cwd: worktreeRoot,
        sandboxOptions: { enabled: false },
      },
    });

    const run = await agent.send(prompt);
    runId = run.id;

    if (typeof run.stream === 'function') {
      for await (const event of run.stream()) {
        transcriptEvents.push(event);
      }
    } else {
      transcriptEvents = null;
    }

    const result = await run.wait();
    usage = normalizeUsageFn(result.usage);
    if (result.status === 'error') {
      error = result.error?.message ?? 'run error';
    }
  } catch (e) {
    error = errorMessage(e);
    transcriptEvents = null;
  } finally {
    agent?.close?.();
  }

  const durationMs = Date.now() - started;
  const correctness = scoreCorrectnessFn({ worktreeRoot, taskDir });
  const process = scoreProcessFn({
    arm,
    worktreeRoot,
    transcriptEvents,
    peerSkillAbsent,
  });
  const valid = correctness.valid && processPassFn(arm, process) && !error;

  return {
    arm,
    valid,
    durationMs,
    usage,
    correctness,
    process,
    runId,
    error,
  };
}
