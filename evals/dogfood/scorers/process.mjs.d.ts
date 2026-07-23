import type { ArmId, ProcessChecks } from './types.ts';

export function scoreProcess(args: {
  arm: ArmId;
  worktreeRoot: string;
  skillPresent?: boolean;
  transcriptEvents: unknown[] | null;
  peerSkillAbsent?: boolean;
}): ProcessChecks;

export function processPass(arm: ArmId, checks: ProcessChecks): boolean;
