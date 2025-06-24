import { describe, it, expect, beforeAll } from 'vitest';
import { createSecureEvaluator } from '../src/evaluator.js';
import { parse } from '../lib/parser.js';
import { DataContext, FunctionRegistry } from '../src/types.js';
import { clearTraceLog } from '../src/tracer.js';
import { createTestEvaluator } from './test-helper.js';

describe('Template Evaluator', () => {
  beforeAll(() => {
    clearTraceLog();
  });

  const evaluate = createTestEvaluator();

  describe('Story 1: Standard Variable Evaluation (<#..#>)', () => {
    it('should evaluate a value that is also a template', async () => {
      const template = '<#a#>';
      const context: DataContext = new Map([['a', 'Hello <#b#>'], ['b', 'World']]);
      const result = await evaluate(template, context);
      expect(result).toBe('Hello World');
    });

    it('should handle multiple levels of template-in-variable', async () => {
      const template = '<#a#>';
      const context: DataContext = new Map([['a', '<#b#>'], ['b', '<#c#>'], ['c', 'Final']]);
      const result = await evaluate(template, context);
      expect(result).toBe('Final');
    });

    it('should throw an error on circular reference by reaching max depth', async () => {
      const template = '<#a#>';
      const context: DataContext = new Map([['a', '<#b#>'], ['b', '<#a#>']]);
      await expect(evaluate(template, context)).rejects.toThrow('Max evaluation depth exceeded');
    });
  });
});
