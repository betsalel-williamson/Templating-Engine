import { describe, it, expect } from 'vitest';
import { DataContext } from '../../src/types.js';
import { createTestEvaluator } from '../test-helper.js';

describe('New Syntax: Conditional Logic ({% if %})', () => {
  const evaluate = createTestEvaluator(new Map(), false, 'new', false);

  describe('basic conditionals', () => {
    it('should render the true branch when the condition is truthy', async () => {
      const context: DataContext = new Map([['isAdmin', '1']]);
      const result = await evaluate(
        '{% if isAdmin %}Admin{% else %}User{% endif %}',
        context
      );
      expect(result).toBe('Admin');
    });

    it('should render the false branch when the condition is falsy', async () => {
      const context: DataContext = new Map([['isAdmin', '0']]);
      const result = await evaluate(
        '{% if isAdmin %}Admin{% else %}User{% endif %}',
        context
      );
      expect(result).toBe('User');
    });

    it('should render nothing for the false branch when else is omitted', async () => {
      const context: DataContext = new Map([['isAdmin', '0']]);
      const result = await evaluate('{% if isAdmin %}Admin{% endif %}', context);
      expect(result).toBe('');
    });
  });

  describe('not conditions', () => {
    it('should support not loop.last inside a for loop', async () => {
      const context: DataContext = new Map([
        [
          'items',
          [new Map([['name', 'a']]), new Map([['name', 'b']]), new Map([['name', 'c']])],
        ],
      ]);
      const template =
        '{% for item in items %}{{ item.name }}{% if not loop.last %},{% endif %}{% endfor %}';
      const result = await evaluate(template, context);
      expect(result).toBe('a,b,c');
    });
  });

  describe('boundary cases', () => {
    it('should treat empty string as false', async () => {
      const context: DataContext = new Map([['flag', '']]);
      const result = await evaluate('{% if flag %}yes{% else %}no{% endif %}', context);
      expect(result).toBe('no');
    });

    it('should treat missing variables as false', async () => {
      const result = await evaluate('{% if missing %}yes{% else %}no{% endif %}');
      expect(result).toBe('no');
    });
  });
});
