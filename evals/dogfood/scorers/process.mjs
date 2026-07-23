import fs from 'node:fs';
import path from 'node:path';

const CONTRACT_PATH_MARKERS = [
  'docs/features/language-spec/host-layer-contracts.md',
  'docs/features/language-spec/evaluation-security-diagnostics.md',
  'docs/features/architecture/adr-002-mustache-js-first-code-generation.md',
  'docs/features/architecture/adr-004-abstract-host-invocation.md',
  'evals/dogfood/skills/v2-engine-build',
];

/**
 * @param {{ arm: 'A'|'B', worktreeRoot: string, skillPresent?: boolean, transcriptEvents: unknown[] | null, skillAbsentOnArmA?: boolean }} args
 * @returns {import('./types.ts').ProcessChecks}
 */
export function scoreProcess({
  arm,
  worktreeRoot,
  skillPresent,
  transcriptEvents,
  skillAbsentOnArmA,
}) {
  const skillInjected =
    skillPresent ??
    fs.existsSync(path.join(worktreeRoot, '.agents/skills/v2-engine-build/SKILL.md'));
  const resolvedSkillAbsentOnArmA = skillAbsentOnArmA ?? (arm === 'A' ? !skillInjected : false);

  if (!transcriptEvents) {
    return {
      observability: 'unavailable',
      skillInjected,
      skillAbsentOnArmA: resolvedSkillAbsentOnArmA,
      contractsEngaged: null,
      details: ['transcript unavailable — process observability limited'],
    };
  }

  const blob = JSON.stringify(transcriptEvents);
  const contractsEngaged = CONTRACT_PATH_MARKERS.some((m) => blob.includes(m));
  return {
    observability: 'available',
    skillInjected,
    skillAbsentOnArmA: resolvedSkillAbsentOnArmA,
    contractsEngaged,
    details: [
      contractsEngaged
        ? 'contract path seen in transcript'
        : 'no contract path marker in transcript',
    ],
  };
}

/**
 * @param {'A'|'B'} arm
 * @param {import('./types.ts').ProcessChecks} checks
 */
export function processPass(arm, checks) {
  if (arm === 'A') {
    return checks.skillAbsentOnArmA !== false;
  }
  if (!checks.skillInjected) return false;
  if (checks.observability === 'unavailable') return true;
  return checks.contractsEngaged === true;
}
