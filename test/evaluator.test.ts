import { describe, it, expect, beforeAll } from 'vitest';
import { evaluate } from '../src/evaluator.js';
import { parse } from '../lib/parser.js';
import { AstNode, DataContext } from '../src/types.js';
import { fileTracer, clearTraceLog } from '../src/tracer.js';

describe('Template Evaluator', () => {
  // Clear the log file before any tests in this suite run.
  beforeAll(() => {
    clearTraceLog();
  });

  const parseTemplate = (template: string): AstNode => {
    return parse(template, { tracer: fileTracer }) as AstNode;
  };

  it('should handle simple literal text', async () => {
    const ast = parseTemplate('Hello, world!');
    const context: DataContext = new Map();
    const result = await evaluate(ast, context);
    expect(result).toBe('Hello, world!');
  });

  it('should replace a simple variable', async () => {
    const ast = parseTemplate('Hello, <#name#>.');
    const context: DataContext = new Map([['name', 'TypeScript']]);
    const result = await evaluate(ast, context);
    expect(result).toBe('Hello, TypeScript.');
  });

  it('should perform a cross-product expansion', async () => {
    const template = '<~- <#item.name#> ~><*><[products]>~>';
    const ast = parseTemplate(template);
    const context: DataContext = new Map([
      ['products', [
        new Map([['name', 'Apple']]),
        new Map([['name', 'Banana']]),
      ]],
    ]);
    const result = await evaluate(ast, context);
    expect(result).toBe('- Apple - Banana ');
  });

  it('should evaluate a true conditional', async () => {
    const template = '<+This is TRUE<->This is FALSE<?<#show#>?>>';
    const ast = parseTemplate(template);
    const context: DataContext = new Map([['show', '1']]);
    const result = await evaluate(ast, context);
    expect(result).toBe('This is TRUE');
  });

  it('should evaluate a false conditional', async () => {
    const template = '<+This is TRUE<->This is FALSE<?<#show#>?>>';
    const ast = parseTemplate(template);
    const context: DataContext = new Map([['show', '0']]);
    const result = await evaluate(ast, context);
    expect(result).toBe('This is FALSE');
  });
});
