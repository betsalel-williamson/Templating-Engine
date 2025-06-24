import { describe, it, expect, beforeAll } from 'vitest';
import { evaluate } from '../src/evaluator.js';
import { parse } from '../lib/parser.js';
import { AstNode, DataContext } from '../src/types.js';
import { fileTracer, clearTraceLog } from '../src/tracer.js';

describe('Template Evaluator: Story 0', () => {
  beforeAll(() => {
    clearTraceLog();
  });

  const parseTemplate = (template: string): AstNode => {
    return parse(template, { tracer: fileTracer }) as AstNode;
  };

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

  it('should handle a mix of literals and variables', async () => {
    const template = 'User: <#user#>, Status: <#status#>.';
    const ast = parseTemplate(template);
    const context: DataContext = new Map([['user', 'Alice'], ['status', 'active']]);
    const result = await evaluate(ast, context);
    expect(result).toBe('User: Alice, Status: active.');
  });

  it('should handle multiple occurrences of the same variable', async () => {
    const template = 'Say <#word#>, then say <#word#> again.';
    const ast = parseTemplate(template);
    const context: DataContext = new Map([['word', 'Yo']]);
    const result = await evaluate(ast, context);
    expect(result).toBe('Say Yo, then say Yo again.');
  });
});
