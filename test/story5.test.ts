import { describe, it, expect, beforeAll } from 'vitest';
import { comprehensiveContext } from './fixtures/test-data.js';
import { clearTraceLog } from '../src/tracer.js';
import { createTestEvaluator } from './test-helper.js';

describe('Comprehensive Template Tests', () => {
  beforeAll(() => {
    clearTraceLog();
  });

  const evaluate = createTestEvaluator();

  describe('Conditionals', () => {
    it('should evaluate the true branch when condition is a non-zero string', async () => {
      const template = '<~<+><`TRUE`><-><`FALSE`><?1?>~>';
      const result = await evaluate(template);
      expect(result).toBe('TRUE');
    });

    it('should evaluate the true branch when condition is any non-empty, non-zero string', async () => {
      const template = '<~<+><`TRUE`><-><`FALSE`><?true?>~>';
      const result = await evaluate(template);
      expect(result).toBe('TRUE');
    });

    it('should evaluate the false branch when condition is "0"', async () => {
      const template = '<~<+><`TRUE`><-><`FALSE`><?0?>~>';
      const result = await evaluate(template);
      expect(result).toBe('FALSE');
    });

    it('should evaluate the false branch when condition is an empty string', async () => {
      const template = '<~<+><`TRUE`><-><`FALSE`><??>~>';
      const result = await evaluate(template);
      expect(result).toBe('FALSE');
    });

    it('should evaluate the false branch when condition variable resolves to ""', async () => {
      const template = '<~<+><`TRUE`><-><`FALSE`><?<#maybe#>?>~>';
      const context = new Map(comprehensiveContext);
      context.set('maybe', '');
      const result = await evaluate(template, context);
      expect(result).toBe('FALSE');
    });

    it('should handle missing false branch correctly (true case)', async () => {
      const template = '<~<+><`Is Admin`><?<#isAdmin#>?>~>';
      const context = new Map([['isAdmin', '1']]);
      const result = await evaluate(template, context);
      expect(result).toBe('Is Admin');
    });

    it('should handle missing false branch correctly (false case)', async () => {
      const template = '<~<+><`Is Admin`><?<#isAdmin#>?>~>';
      const context = new Map([['isAdmin', '0']]);
      const result = await evaluate(template, context);
      expect(result).toBe('');
    });

    it('should handle missing true branch correctly (true case)', async () => {
      const template = '<~<-><`Not Admin`><?<#isAdmin#>?>~>';
      const context = new Map([['isAdmin', '1']]);
      const result = await evaluate(template, context);
      expect(result).toBe('');
    });

    it('should handle missing true branch correctly (false case)', async () => {
      const template = '<~<-><`Not Admin`><?<#isAdmin#>?>~>';
      const context = new Map([['isAdmin', '0']]);
      const result = await evaluate(template, context);
      expect(result).toBe('Not Admin');
    });

    it('should evaluate nested expressions in branches', async () => {
      const template = '<~<+><`Hello <#name#>`><-><`Bye <#name#>`><?<#showHello#>?>~>';
      const context = new Map([['name', 'World'], ['showHello', '1']]);
      const result = await evaluate(template, context);
      expect(result).toBe('Hello World');

      const context2 = new Map([['name', 'World'], ['showHello', '0']]);
      const result2 = await evaluate(template, context2);
      expect(result2).toBe('Bye World');
    });

    it('should handle both branches being missing', async () => {
      const template = '<~<?<#cond#>?>~>';
      const result = await evaluate(template, new Map([['cond', '1']]));
      expect(result).toBe('');
    });
  });
});
