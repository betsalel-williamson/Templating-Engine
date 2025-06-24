import { describe, it, expect, beforeAll } from 'vitest';
import { evaluate } from '../src/evaluator.js';
import { parse } from '../lib/parser.js';
import { AstNode, DataContext } from '../src/types.js';
import { fileTracer, clearTraceLog } from '../src/tracer.js';

describe('Template Evaluator', () => {
  beforeAll(() => {
    clearTraceLog();
  });

  const parseTemplate = (template: string): AstNode => {
    return parse(template, { tracer: fileTracer }) as AstNode;
  };

  describe('Story 0: Basic Replacement', () => {
    it('should handle a template with only literal text', async () => {
      const ast = parseTemplate('Hello, world!');
      const context: DataContext = new Map();
      const result = await evaluate(ast, context);
      expect(result).toBe('Hello, world!');
    });

    it('should replace a simple variable when it exists in the context', async () => {
      const ast = parseTemplate('Hello, <#name#>.');
      const context: DataContext = new Map([['name', 'TypeScript']]);
      const result = await evaluate(ast, context);
      expect(result).toBe('Hello, TypeScript.');
    });

    it('should leave the variable tag in place if the variable is not in the context', async () => {
      const ast = parseTemplate('Hello, <#name#>.');
      const context: DataContext = new Map();
      const result = await evaluate(ast, context);
      expect(result).toBe('Hello, <#name#>.');
    });
  });

  describe('Story 1: Recursive Replacement', () => {
    it('should resolve a simple recursive variable (2 levels)', async () => {
        const template = '<#a#>';
        const context: DataContext = new Map([['a', 'b'], ['b', 'Result']]);
        const result = await evaluate(parseTemplate(template), context);
        expect(result).toBe('Result');
    });

    it('should resolve a multi-step recursive variable (3+ levels)', async () => {
        const template = '<#a#>';
        const context: DataContext = new Map([['a', 'b'], ['b', 'c'], ['c', 'Final']]);
        const result = await evaluate(parseTemplate(template), context);
        expect(result).toBe('Final');
    });

    it('should throw an error on a direct circular reference', async () => {
        const template = '<#a#>';
        const context: DataContext = new Map([['a', 'a']]);
        await expect(evaluate(parseTemplate(template), context)).rejects.toThrow('Circular variable reference detected: a -> a');
    });

    it('should throw an error on an indirect circular reference', async () => {
        const template = '<#a#>';
        const context: DataContext = new Map([['a', 'b'], ['b', 'c'], ['c', 'a']]);
        await expect(evaluate(parseTemplate(template), context)).rejects.toThrow('Circular variable reference detected: a -> b -> c -> a');
    });

    it('should return the last value if the recursion chain ends on a non-key string', async () => {
        const template = '<#a#>';
        const context: DataContext = new Map([['a', 'b']]); // 'b' is a valid final string value.
        const result = await evaluate(parseTemplate(template), context);
        expect(result).toBe('b');
    });
  });
});
