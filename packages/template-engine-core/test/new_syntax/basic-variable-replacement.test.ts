import { describe, it, expect } from 'vitest';
import { DataContext } from '../../src/types.js';
import { createTestEvaluator } from '../test-helper.js';

describe('New Syntax: Basic Variable Replacement ({{...}})', () => {
  // Use the new parser for these tests
  const evaluate = createTestEvaluator(new Map(), false, 'new');

  it('should handle a template with only literal text using the new grammar', async () => {
    const result = await evaluate('Hello, world!');
    expect(result).toBe('Hello, world!');
  });

  it('should replace a simple variable using new syntax when it exists in the context', async () => {
    const context: DataContext = new Map([['name', 'TypeScript']]);
    const result = await evaluate('Hello, {{ name }}.', context);
    expect(result).toBe('Hello, TypeScript.');
  });

  it('should leave the new variable tag in place if the variable is not in the context', async () => {
    const result = await evaluate('Hello, {{ name }}.');
    expect(result).toBe('Hello, {{ name }}.');
  });

  it('should handle variables with leading/trailing whitespace in new syntax', async () => {
    const context: DataContext = new Map([['myVar', 'Value']]);
    const result = await evaluate('Test: {{   myVar   }}.', context);
    expect(result).toBe('Test: Value.');
  });
});
