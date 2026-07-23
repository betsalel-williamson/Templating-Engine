import fs from 'node:fs';
import path from 'node:path';

export const DEFAULT_TASK_ID = 'v2-trusted-template-gate';
export const DEFAULT_SKILL_NAME = 'v2-engine-build';

/**
 * @param {string | undefined} [raw]
 */
export function resolveTaskId(raw = process.env.DOGFOOD_TASK) {
  return raw || DEFAULT_TASK_ID;
}

/**
 * @param {string | undefined} [raw]
 */
export function resolveSkillName(raw = process.env.DOGFOOD_SKILL) {
  return raw || DEFAULT_SKILL_NAME;
}

/**
 * @param {string} skillName
 */
export function skillSrcRel(skillName) {
  return `evals/dogfood/skills/${skillName}`;
}

/**
 * @param {string} skillName
 */
export function skillAgentsRel(skillName) {
  return `.agents/skills/${skillName}`;
}

/**
 * @param {string} taskDir
 */
export function loadProcessConfig(taskDir) {
  const configPath = path.join(taskDir, 'process.json');
  if (!fs.existsSync(configPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}
