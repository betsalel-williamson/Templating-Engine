import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function cliPath() {
  const root = process.env.DOGFOOD_WORKTREE;
  if (!root) throw new Error('DOGFOOD_WORKTREE is required');
  return path.join(root, 'evals/dogfood/tasks/calculator-cli/dist/cli.js');
}

function runCalc(args: string[]) {
  return spawnSync('node', [cliPath(), ...args], { encoding: 'utf8' });
}

describe('calculator-cli acceptance', () => {
  it('adds two numbers', () => {
    const result = runCalc(['add', '2', '3']);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout.trim()).toBe('5');
  });

  it('subtracts two numbers', () => {
    const result = runCalc(['sub', '5', '2']);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout.trim()).toBe('3');
  });

  it('multiplies two numbers', () => {
    const result = runCalc(['mul', '3', '4']);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout.trim()).toBe('12');
  });

  it('divides with two decimal places', () => {
    const result = runCalc(['div', '7', '2']);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout.trim()).toBe('3.50');
  });

  it('evaluates expressions with precedence', () => {
    const result = runCalc(['eval', '2 + 3 * 4']);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout.trim()).toBe('14');
  });

  it('errors on divide by zero', () => {
    const result = runCalc(['div', '1', '0']);
    expect(result.status).toBe(1);
    expect(result.stderr.length).toBeGreaterThan(0);
  });

  it('errors on bad args', () => {
    const result = runCalc(['add', '1']);
    expect(result.status).toBe(1);
    expect(result.stderr.length).toBeGreaterThan(0);
  });

  it('prints help with all commands', () => {
    const result = runCalc(['--help']);
    expect(result.status, result.stderr).toBe(0);
    const help = result.stdout;
    for (const cmd of ['add', 'sub', 'mul', 'div', 'eval']) {
      expect(help).toContain(cmd);
    }
  });
});
