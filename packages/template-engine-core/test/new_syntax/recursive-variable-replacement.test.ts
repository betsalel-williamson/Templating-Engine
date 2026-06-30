import { describe, it, expect } from 'vitest';
import { DataContext } from '../../src/types.js';
import { createTestEvaluator } from '../test-helper.js';

describe('New Syntax: Recursive Variable Replacement ({{...}})', () => {
  const evaluate = createTestEvaluator(new Map(), false, 'new', false);

  describe('alias chain resolution', () => {
    it('should resolve a two-step alias chain to the final value', async () => {
      const context: DataContext = new Map([
        ['var1', 'var2'],
        ['var2', 'Final Value'],
      ]);
      const result = await evaluate('{{ var1 }}', context);
      expect(result).toBe('Final Value');
    });

    it('should resolve a multi-step alias chain', async () => {
      const context: DataContext = new Map([
        ['a', 'b'],
        ['b', 'c'],
        ['c', 'd'],
        ['d', 'Done'],
      ]);
      const result = await evaluate('{{ a }}', context);
      expect(result).toBe('Done');
    });

    it('should evaluate a final alias value that contains template syntax', async () => {
      const context: DataContext = new Map([
        ['alias', 'target'],
        ['target', 'Hello {{ name }}'],
        ['name', 'World'],
      ]);
      const result = await evaluate('{{ alias }}', context);
      expect(result).toBe('Hello World');
    });
  });

  describe('boundary cases', () => {
    it('should return the raw tag when the variable is missing', async () => {
      const result = await evaluate('{{ missing }}');
      expect(result).toBe('{{ missing }}');
    });

    it('should treat a leaf string value as output when it is not an alias key', async () => {
      const context: DataContext = new Map([['greeting', 'Hello']]);
      const result = await evaluate('{{ greeting }}', context);
      expect(result).toBe('Hello');
    });

    it('should handle alias keys with leading and trailing whitespace', async () => {
      const context: DataContext = new Map([
        ['var1', 'var2'],
        ['var2', 'Final Value'],
      ]);
      const result = await evaluate('{{   var1   }}', context);
      expect(result).toBe('Final Value');
    });

    it('should not follow alias chain when resolved value is empty string', async () => {
      const context: DataContext = new Map([['empty', '']]);
      const result = await evaluate('{{ empty }}', context);
      expect(result).toBe('');
    });
  });

  describe('circular reference detection', () => {
    it('should throw on a direct circular alias reference', async () => {
      const context: DataContext = new Map([['varA', 'varA']]);
      await expect(evaluate('{{ varA }}', context)).rejects.toThrow(
        'Circular alias reference detected: varA -> varA'
      );
    });

    it('should throw on an indirect circular alias reference', async () => {
      const context: DataContext = new Map([
        ['varA', 'varB'],
        ['varB', 'varC'],
        ['varC', 'varA'],
      ]);
      await expect(evaluate('{{ varA }}', context)).rejects.toThrow(
        'Circular alias reference detected: varA -> varB -> varC -> varA'
      );
    });
  });

  describe('stress cases', () => {
    it('should resolve a deep alias chain within reasonable depth', async () => {
      const depth = 20;
      const context: DataContext = new Map();
      for (let i = 0; i < depth; i++) {
        context.set(`v${i}`, `v${i + 1}`);
      }
      context.set(`v${depth}`, 'bottom');

      const result = await evaluate('{{ v0 }}', context);
      expect(result).toBe('bottom');
    });
  });
});
