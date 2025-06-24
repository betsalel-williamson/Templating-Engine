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

  describe('Story 1: Standard Variable Evaluation (<#..#>)', () => {
    it('should evaluate a value that is also a template', async () => {
      const template = '<#a#>';
      const context: DataContext = new Map([['a', 'Hello <#b#>'], ['b', 'World']]);
      const result = await evaluate(parseTemplate(template), context);
      expect(result).toBe('Hello World');
    });

    it('should handle multiple levels of template-in-variable', async () => {
      const template = '<#a#>';
      const context: DataContext = new Map([['a', '<#b#>'], ['b', '<#c#>'], ['c', 'Final']]);
      const result = await evaluate(parseTemplate(template), context);
      expect(result).toBe('Final');
    });

    it('should throw an error on circular reference by reaching max depth', async () => {
      const template = '<#a#>';
      const context: DataContext = new Map([['a', '<#b#>'], ['b', '<#a#>']]);
      await expect(evaluate(parseTemplate(template), context)).rejects.toThrow('Max evaluation depth exceeded');
    });
  });

  describe('Story 2: Indirect Variable Evaluation (<##..##>)', () => {
    it('should resolve a chain of keys to a final value', async () => {
      const template = '<##a##>';
      const context: DataContext = new Map([['a', 'b'], ['b', 'c'], ['c', 'Result']]);
      const result = await evaluate(parseTemplate(template), context);
      expect(result).toBe('Result');
    });

    it('should return the original tag if the initial key is not found', async () => {
      const template = '<##a##>';
      const context: DataContext = new Map();
      const result = await evaluate(parseTemplate(template), context);
      expect(result).toBe('<##a##>');
    });

    it('should throw an error on a direct circular reference', async () => {
      const template = '<##a##>';
      const context: DataContext = new Map([['a', 'a']]);
      await expect(evaluate(parseTemplate(template), context)).rejects.toThrow('Circular indirect reference detected: a -> a');
    });

    it('should throw an error on an indirect circular reference', async () => {
      const template = '<##a##>';
      const context: DataContext = new Map([['a', 'b'], ['b', 'c'], ['c', 'a']]);
      await expect(evaluate(parseTemplate(template), context)).rejects.toThrow('Circular indirect reference detected: a -> b -> c -> a');
    });

    it('should return the last value if the chain breaks', async () => {
      const template = '<##a##>';
      const context: DataContext = new Map([['a', 'b']]); // b is a value, not a key
      const result = await evaluate(parseTemplate(template), context);
      expect(result).toBe('b');
    });

    it('should evaluate the final resolved value as a template', async () => {
        const template = '<##a##>';
        const context: DataContext = new Map([['a', 'b'], ['b', 'Hello <#c#>'], ['c', 'World']]);
        const result = await evaluate(parseTemplate(template), context);
        expect(result).toBe('Hello World');
    });
  });
});
