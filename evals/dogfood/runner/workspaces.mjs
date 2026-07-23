import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export function createArmWorktrees({
  repoRoot,
  runId,
  skillSrcRel = "evals/dogfood/skills/v2-engine-build",
}) {
  const base = path.join(repoRoot, ".worktrees");
  fs.mkdirSync(base, { recursive: true });
  const armA = path.join(base, `dogfood-a-${runId}`);
  const armB = path.join(base, `dogfood-b-${runId}`);
  const branchA = `dogfood/a-${runId}`;
  const branchB = `dogfood/b-${runId}`;

  for (const [dir, branch] of [
    [armA, branchA],
    [armB, branchB],
  ]) {
    const r = spawnSync(
      "git",
      ["worktree", "add", "-b", branch, dir, "HEAD"],
      { cwd: repoRoot, encoding: "utf8" },
    );
    if (r.status !== 0) {
      throw new Error(`worktree add failed: ${r.stderr}`);
    }
  }

  const skillSrc = path.join(repoRoot, skillSrcRel);
  const skillDst = path.join(armB, ".agents/skills/v2-engine-build");
  fs.cpSync(skillSrc, skillDst, { recursive: true });

  // Ensure Arm A does not carry the treatment skill even if present on HEAD
  const armASkill = path.join(armA, ".agents/skills/v2-engine-build");
  fs.rmSync(armASkill, { recursive: true, force: true });
  fs.rmSync(path.join(armA, "evals/dogfood/skills/v2-engine-build"), {
    recursive: true,
    force: true,
  });

  return {
    armA,
    armB,
    cleanup() {
      spawnSync("git", ["worktree", "remove", "--force", armA], {
        cwd: repoRoot,
      });
      spawnSync("git", ["worktree", "remove", "--force", armB], {
        cwd: repoRoot,
      });
      spawnSync("git", ["branch", "-D", branchA, branchB], { cwd: repoRoot });
    },
  };
}
