import { describe, it, expect, beforeAll } from 'vitest';
import { createSecureEvaluator } from '../src/evaluator.js';
import { parse } from '../lib/parser.js';
import { DataContext, FunctionRegistry } from '../src/types.js';
import { clearTraceLog } from '../src/tracer.js';
import { createTestEvaluator } from './test-helper.js';
import { comprehensiveContext } from './fixtures/test-data.js';

describe('Template Evaluator', () => {
  beforeAll(() => {
    clearTraceLog();
  });

  const evaluate = createTestEvaluator();

  describe('Story 2: Indirect Variable Evaluation (<##..##>)', () => {
    it('should resolve a chain of keys to a final value', async () => {
      const template = '<##a##>';
      const context: DataContext = new Map([['a', 'b'], ['b', 'c'], ['c', 'Result']]);
      const result = await evaluate(template, context);
      expect(result).toBe('Result');
    });

    it('should return the original tag if the initial key is not found', async () => {
      const template = '<##a##>';
      const context: DataContext = new Map();
      const result = await evaluate(template, context);
      expect(result).toBe('<##a##>');
    });

    it('should throw an error on a direct circular reference', async () => {
      const template = '<##a##>';
      const context: DataContext = new Map([['a', 'a']]);
      await expect(evaluate((template), context)).rejects.toThrow('Circular indirect reference detected: a -> a');
    });

    it('should throw an error on an indirect circular reference', async () => {
      const template = '<##a##>';
      const context: DataContext = new Map([['a', 'b'], ['b', 'c'], ['c', 'a']]);
      await expect(evaluate((template), context)).rejects.toThrow('Circular indirect reference detected: a -> b -> c -> a');
    });

    it('should return the last value if the chain breaks', async () => {
      const template = '<##a##>';
      const context: DataContext = new Map([['a', 'b']]); // b is a value, not a key
      const result = await evaluate((template), context);
      expect(result).toBe('b');
    });

    it('should evaluate the final resolved value as a template', async () => {
      const template = '<##a##>';
      const context: DataContext = new Map([['a', 'b'], ['b', 'Hello <#c#>'], ['c', 'World']]);
      const result = await evaluate((template), context);
      expect(result).toBe('Hello World');
    });
  });

  describe('Indirection', () => {
    it('should follow a chain of indirect variables', async () => {
      const result = await evaluate('See Indirection -- <##indirection-0##>', comprehensiveContext);
      expect(result).toBe('See Indirection -- The real value we are seeking');
    });

    it('should throw on circular indirect reference', async () => {
      const context = new Map();
      context.set('a', 'b');
      context.set('b', 'a');
      await expect(evaluate('<##a##>', context)).rejects.toThrow('Circular indirect reference detected: a -> b -> a');
    });

    it('should resolve indirect variable to a dot-notation key and then its value', async () => {
      // This tests 'a' -> 'user.name' -> 'Alice'
      const template = '<##alias_to_user_name##>';
      const context: DataContext = new Map([
        ['alias_to_user_name', 'user.name'],
        ['user', new Map([['name', 'Alice']])],
      ]);
      const result = await evaluate(template, context);
      expect(result).toBe('Alice');
    });

    it('should resolve indirect variable from a dot-notation key', async () => {
      // This tests 'a.b' -> 'c' -> 'Result'
      const template = '<##key.with.dot##>';
      const context: DataContext = new Map([
        ['key', new Map([['with', new Map([['dot', 'final_key_name']])]])],
        ['final_key_name', 'Final Value'],
      ]);
      const result = await evaluate(template, context);
      expect(result).toBe('Final Value');
    });
  });
});
