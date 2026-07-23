import fs from 'node:fs';
import path from 'node:path';
import { resolveSkillName, skillAgentsRel } from '../task-config.mjs';

const DEFAULT_CONTRACT_MARKERS = [
  'docs/features/language-spec/host-layer-contracts.md',
  'docs/features/language-spec/evaluation-security-diagnostics.md',
  'docs/features/architecture/adr-002-mustache-js-first-code-generation.md',
  'docs/features/architecture/adr-004-abstract-host-invocation.md',
];

/**
 * @param {string} dir
 * @param {string[]} files
 */
function walkFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, files);
    } else if (/\.(ts|mjs|js)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

/**
 * @param {string} worktreeRoot
 * @param {string} taskId
 */
export function taskImplementationRoot(worktreeRoot, taskId) {
  return path.join(worktreeRoot, 'evals/dogfood/tasks', taskId);
}

/**
 * @param {string} worktreeRoot
 * @param {string} taskId
 */
export function readTaskSourceBlob(worktreeRoot, taskId) {
  const root = taskImplementationRoot(worktreeRoot, taskId);
  const srcDir = path.join(root, 'src');
  const files = walkFiles(srcDir);
  return files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
}

/**
 * @param {string} worktreeRoot
 * @param {string} taskId
 */
export function listTemplateFiles(worktreeRoot, taskId) {
  const root = taskImplementationRoot(worktreeRoot, taskId);
  const templates = [];
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop();
    if (!dir || !fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.name.endsWith('.template')) {
        templates.push(full);
      }
    }
  }
  return templates;
}

/**
 * @param {string} blob
 */
export function usesCoreEngine(blob) {
  return /@bwilliamson\/template-engine-core/.test(blob);
}

/**
 * @param {{
 *   arm: 'A'|'B',
 *   worktreeRoot: string,
 *   taskId: string,
 *   processConfig: Record<string, unknown> | null,
 * }} args
 */
export function runStaticProcessChecks({ arm, worktreeRoot, taskId, processConfig }) {
  if (!processConfig) {
    return { pass: true, details: ['no process.json — static checks skipped'] };
  }

  const blob = readTaskSourceBlob(worktreeRoot, taskId);
  const templates = listTemplateFiles(worktreeRoot, taskId);
  const coreImport = usesCoreEngine(blob);
  const details = [];
  const armAChecks = /** @type {{ forbidCoreImport?: boolean }} */ (processConfig.armAChecks ?? {});
  const armBChecks = /** @type {{
    requireCoreImport?: boolean,
    requireTemplateFiles?: boolean,
    requireHelpTemplate?: boolean,
    requireRuntimeTemplate?: boolean,
  }} */ (processConfig.armBChecks ?? {});

  if (arm === 'A') {
    if (armAChecks.forbidCoreImport && coreImport) {
      details.push('Arm A must not import @bwilliamson/template-engine-core');
      return { pass: false, details };
    }
    if (templates.length > 0) {
      details.push('Arm A must not use .template files');
      return { pass: false, details };
    }
    details.push('Arm A static checks ok');
    return { pass: true, details };
  }

  if (armBChecks.requireCoreImport && !coreImport) {
    details.push('Arm B must import @bwilliamson/template-engine-core');
    return { pass: false, details };
  }
  if (armBChecks.requireTemplateFiles && templates.length < 2) {
    details.push(`Arm B needs ≥2 .template files (found ${templates.length})`);
    return { pass: false, details };
  }
  if (armBChecks.requireHelpTemplate && !/help\.template|renderHelp/.test(blob)) {
    details.push('Arm B must use help.template or renderHelp()');
    return { pass: false, details };
  }
  if (
    armBChecks.requireRuntimeTemplate &&
    !/formatResult\.template|renderOutput|renderResult/.test(blob)
  ) {
    details.push('Arm B must use a runtime output template (formatResult.template / renderOutput)');
    return { pass: false, details };
  }

  details.push('Arm B static checks ok');
  return { pass: true, details };
}

/**
 * @param {{
 *   arm: 'A'|'B',
 *   worktreeRoot: string,
 *   taskId?: string,
 *   taskDir?: string,
 *   skillName?: string,
 *   skillPresent?: boolean,
 *   transcriptEvents: unknown[] | null,
 *   skillAbsentOnArmA?: boolean,
 *   processConfig?: Record<string, unknown> | null,
 * }} args
 * @returns {import('./types.ts').ProcessChecks}
 */
export function scoreProcess({
  arm,
  worktreeRoot,
  taskId,
  taskDir,
  skillName = resolveSkillName(),
  skillPresent,
  transcriptEvents,
  skillAbsentOnArmA,
  processConfig = null,
}) {
  const resolvedTaskId = taskId ?? (taskDir ? path.basename(taskDir) : undefined);
  const skillInjected =
    skillPresent ?? fs.existsSync(path.join(worktreeRoot, skillAgentsRel(skillName), 'SKILL.md'));
  const resolvedSkillAbsentOnArmA = skillAbsentOnArmA ?? (arm === 'A' ? !skillInjected : false);

  const contractMarkers = /** @type {string[]} */ (
    processConfig?.contractMarkers ?? DEFAULT_CONTRACT_MARKERS
  );
  const markerPaths = [...contractMarkers, skillSrcMarker(skillName)];

  const staticChecks =
    resolvedTaskId && processConfig
      ? runStaticProcessChecks({
          arm,
          worktreeRoot,
          taskId: resolvedTaskId,
          processConfig,
        })
      : { pass: true, details: [] };

  if (!transcriptEvents) {
    return {
      observability: 'unavailable',
      skillInjected,
      skillAbsentOnArmA: resolvedSkillAbsentOnArmA,
      contractsEngaged: null,
      staticPass: staticChecks.pass,
      details: ['transcript unavailable — process observability limited', ...staticChecks.details],
    };
  }

  const blob = JSON.stringify(transcriptEvents);
  const contractsEngaged = markerPaths.some((m) => blob.includes(m));
  return {
    observability: 'available',
    skillInjected,
    skillAbsentOnArmA: resolvedSkillAbsentOnArmA,
    contractsEngaged,
    staticPass: staticChecks.pass,
    details: [
      contractsEngaged
        ? 'contract path seen in transcript'
        : 'no contract path marker in transcript',
      ...staticChecks.details,
    ],
  };
}

/**
 * @param {string} skillName
 */
function skillSrcMarker(skillName) {
  return `evals/dogfood/skills/${skillName}`;
}

/**
 * @param {'A'|'B'} arm
 * @param {import('./types.ts').ProcessChecks} checks
 */
export function processPass(arm, checks) {
  if (checks.staticPass === false) {
    return false;
  }
  if (arm === 'A') {
    return checks.skillAbsentOnArmA !== false;
  }
  if (!checks.skillInjected) return false;
  if (checks.observability === 'unavailable') return true;
  return checks.contractsEngaged === true;
}
