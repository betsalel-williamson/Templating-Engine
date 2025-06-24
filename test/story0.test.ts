import { describe, it, expect, beforeAll } from 'vitest';
import { DataContext } from '../src/types.js';
import { clearTraceLog } from '../src/tracer.js';
import { createTestEvaluator } from './test-helper.js';
import { comprehensiveContext } from './fixtures/test-data.js';

describe('Template Evaluator', () => {
  beforeAll(() => {
    clearTraceLog();
  });

  const evaluate = createTestEvaluator();

  describe('Story 0: Basic Replacement', () => {
    it('should handle a template with only literal text', async () => {
      const result = await evaluate('Hello, world!');
      expect(result).toBe('Hello, world!');
    });

    it('should replace a simple variable when it exists in the context', async () => {
      const context: DataContext = new Map([['name', 'TypeScript']]);
      const result = await evaluate('Hello, <#name#>.', context);
      expect(result).toBe('Hello, TypeScript.');
    });

    it('should leave the variable tag in place if the variable is not in the context', async () => {
      const result = await evaluate('Hello, <#name#>.');
      expect(result).toBe('Hello, <#name#>.');
    });
  });

    describe('Variable Replacement', () => {
    it('should replace a simple variable', async () => {
      const result = await evaluate('Hi <#var3#>', comprehensiveContext);
      expect(result).toBe('Hi there');
    });

    it('should leave an unknown variable tag unchanged', async () => {
        const result = await evaluate('This is an <#unknown_var#>', comprehensiveContext);
        expect(result).toBe('This is an <#unknown_var#>');
    });

    it('should handle recursive variable replacement via re-evaluation', async () => {
      const result = await evaluate('<#recursive1#>', comprehensiveContext);
      expect(result).toBe('Recursive 2');
    });

    it('should throw an error for circular variable references', async () => {
        const context = new Map(comprehensiveContext);
        context.set('cycleA', '<#cycleB#>');
        context.set('cycleB', '<#cycleA#>');
        const template = '<#cycleA#>';

        await expect(evaluate(template, context)).rejects.toThrow(
            'Max evaluation depth exceeded'
        );
    });
  });
});
