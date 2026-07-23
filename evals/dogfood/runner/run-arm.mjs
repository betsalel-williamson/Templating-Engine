import fs from 'node:fs';
import path from 'node:path';
import { Agent as CursorAgent } from '@cursor/sdk';
import { scoreCorrectness } from '../scorers/correctness.mjs';
import { scoreProcess, processPass } from '../scorers/process.mjs';
import { normalizeUsage } from '../scorers/usage.mjs';
import {
  loadProcessConfig,
  resolveSkillName,
  resolveTaskId,
  skillAgentsRel,
} from '../task-config.mjs';

/**
 * @param {{ arm: 'A'|'B', taskBody: string, skillName?: string }} args
 */
export function buildArmPrompt({ arm, taskBody, skillName = resolveSkillName() }) {
  return arm === 'B'
    ? `${taskBody}\n\nUse the ${skillName} skill. Follow it strictly.\n`
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
 * @param {string} worktreeRoot
 * @param {string} [skillName]
 */
export function hasTreatmentSkill(worktreeRoot, skillName = resolveSkillName()) {
  return fs.existsSync(path.join(worktreeRoot, skillAgentsRel(skillName), 'SKILL.md'));
}

/**
 * @param {{
 *   arm: 'A'|'B',
 *   worktreeRoot: string,
 *   taskDir: string,
 *   taskId?: string,
 *   skillName?: string,
 *   skillAbsentOnArmA?: boolean,
 *   skillPresent?: boolean,
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
  taskId = resolveTaskId(),
  skillName = resolveSkillName(),
  skillAbsentOnArmA,
  skillPresent,
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
  const prompt = buildArmPrompt({ arm, taskBody, skillName });
  const resolvedSkillPresent = skillPresent ?? hasTreatmentSkill(worktreeRoot, skillName);
  const resolvedSkillAbsentOnArmA =
    skillAbsentOnArmA ?? (arm === 'A' ? !resolvedSkillPresent : false);
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
    } else if (result.status !== 'finished') {
      error = `run ended with status ${result.status}`;
    }
  } catch (e) {
    error = errorMessage(e);
    transcriptEvents = null;
  } finally {
    agent?.close?.();
  }

  const durationMs = Date.now() - started;
  const processConfig = loadProcessConfig(taskDir);
  const correctness = scoreCorrectnessFn({ worktreeRoot, taskDir });
  const process = scoreProcessFn({
    arm,
    worktreeRoot,
    taskId,
    taskDir,
    skillName,
    skillPresent: resolvedSkillPresent,
    transcriptEvents,
    skillAbsentOnArmA: resolvedSkillAbsentOnArmA,
    processConfig,
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
