import { describe, it, expect } from 'vitest';
import { DataContext } from '../../src/types.js';
import { createTestEvaluator } from '../test-helper.js';

describe('New Syntax: Conditional, Bracket, and Recursion Boundary Contracts', () => {
  const evaluate = createTestEvaluator(new Map(), false, 'new', false);

  describe('conditional truthiness contract', () => {
    it.each([
      ['empty string', '', 'no'],
      ['string zero', '0', 'no'],
      ['numeric zero', 0, 'no'],
      ['undefined variable', undefined, 'no'],
      ['string one', '1', 'yes'],
      ['numeric one', 1, 'yes'],
      ['non-empty string', 'active', 'yes'],
    ] as const)('should treat %s as %s in if/else', async (_label, value, expected) => {
      const context: DataContext = value === undefined ? new Map() : new Map([['flag', value]]);
      const result = await evaluate('{% if flag %}yes{% else %}no{% endif %}', context);
      expect(result).toBe(expected);
    });

    it('should treat double-not as affirmative for a truthy value', async () => {
      const context: DataContext = new Map([['flag', '1']]);
      expect(await evaluate('{% if not not flag %}yes{% else %}no{% endif %}', context)).toBe(
        'yes'
      );
    });

    it('should treat not on a missing variable as true', async () => {
      expect(await evaluate('{% if not missing %}yes{% else %}no{% endif %}')).toBe('yes');
    });

    it('should evaluate property access in conditions', async () => {
      const context: DataContext = new Map([['user', new Map([['active', '1']])]]);
      expect(await evaluate('{% if user.active %}on{% else %}off{% endif %}', context)).toBe('on');
    });
  });

  describe('bracket lookup boundaries', () => {
    it('should render empty string when bracket key resolves to a missing context entry', async () => {
      const context: DataContext = new Map([['prefix', 'missing-key']]);
      expect(await evaluate(`{{ [prefix ~ '-suffix'] }}`, context)).toBe('');
    });

    it('should look up bracket keys by immediate identifier value, not alias chain', async () => {
      const context: DataContext = new Map([
        ['a', 'b'],
        ['b', 'c'],
        ['c', 'leaf'],
      ]);
      expect(await evaluate('{{ [a] }}', context)).toBe('c');
      expect(await evaluate('{{ a }}', context)).toBe('leaf');
    });
  });

  describe('recursive evaluation failures', () => {
    it('should throw when alias resolution exceeds max evaluation depth', async () => {
      const depth = 55;
      const context: DataContext = new Map();
      for (let i = 0; i < depth; i++) {
        context.set(`v${i}`, `{{ v${i + 1} }}`);
      }
      context.set(`v${depth}`, 'done');

      await expect(evaluate('{{ v0 }}', context)).rejects.toThrow('Max evaluation depth exceeded');
    });

    it('should re-evaluate a final alias value that embeds template syntax', async () => {
      const context: DataContext = new Map([
        ['step', 'next'],
        ['next', 'value is {{ name }}'],
        ['name', 'Ada'],
      ]);
      expect(await evaluate('{{ step }}', context)).toBe('value is Ada');
    });
  });
});
