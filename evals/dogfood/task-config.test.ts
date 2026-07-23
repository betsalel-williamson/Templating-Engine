import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SKILL_NAME,
  DEFAULT_TASK_ID,
  resolveSkillName,
  resolveTaskId,
  skillAgentsRel,
  skillSrcRel,
} from './task-config.mjs';

describe('task-config', () => {
  it('defaults task and skill for engine gate', () => {
    expect(resolveTaskId(undefined)).toBe(DEFAULT_TASK_ID);
    expect(resolveSkillName(undefined)).toBe(DEFAULT_SKILL_NAME);
  });

  it('resolves calculator app gate env', () => {
    expect(resolveTaskId('calculator-cli')).toBe('calculator-cli');
    expect(resolveSkillName('legacy-template-codegen')).toBe('legacy-template-codegen');
    expect(skillSrcRel('legacy-template-codegen')).toBe(
      'evals/dogfood/skills/legacy-template-codegen'
    );
    expect(skillAgentsRel('legacy-template-codegen')).toBe(
      '.agents/skills/legacy-template-codegen'
    );
  });
});
