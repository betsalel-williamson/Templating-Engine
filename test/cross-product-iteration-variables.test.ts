import { describe, it, expect } from 'vitest';
import { DataContext } from '../src/types.js';
import { createTestEvaluator } from './test-helper.js';

describe('Story 15: Modernize Iteration Variables', () => {
  const evaluate = createTestEvaluator();

  const usersContext: DataContext = new Map([
    ['users', [
      new Map([['name', 'Alice']]),
      new Map([['name', 'Bob']]),
      new Map([['name', 'Charlie']]),
    ]]
  ]);

  it('should support the new .index variable (0-based)', async () => {
    const template = '<~<`<#users.index#>: <#name#>;`><*><[users]>~>';
    const result = await evaluate(template, usersContext);
    expect(result).toBe('0: Alice;1: Bob;2: Charlie;'); // Expected 0-based
  });

  it('should support the new .length variable', async () => {
    const template = '<~<`<#name#> (<#users.length#>) `><*><[users]>~>';
    const result = await evaluate(template, usersContext);
    expect(result).toBe('Alice (3) Bob (3) Charlie (3) ');
  });

  it('should support both new and legacy variables simultaneously', async () => {
    const template = '<~<`Index: <#users.index#>, ElementIndex: <#users.elementindex#>, Length: <#users.length#>, NumberOfElements: <#users.numberofelements#> | `><*><[users]>~>';
    const result = await evaluate(template, usersContext);
    expect(result).toBe(
      'Index: 0, ElementIndex: 1, Length: 3, NumberOfElements: 3 | ' + // Index is 0-based, ElementIndex 1-based
      'Index: 1, ElementIndex: 2, Length: 3, NumberOfElements: 3 | ' +
      'Index: 2, ElementIndex: 3, Length: 3, NumberOfElements: 3 | '
    );
  });

  it('should maintain backward compatibility for .elementindex (1-based)', async () => {
    const template = '<~<`<#users.elementindex#>: <#name#>;`><*><[users]>~>';
    const result = await evaluate(template, usersContext);
    expect(result).toBe('1: Alice;2: Bob;3: Charlie;'); // Expected 1-based
  });

  it('should maintain backward compatibility for .numberofelements', async () => {
    const template = '<~<`<#name#> (<#users.numberofelements#>) `><*><[users]>~>';
    const result = await evaluate(template, usersContext);
    expect(result).toBe('Alice (3) Bob (3) Charlie (3) ');
  });

  it('should correctly set new variables when slicing is applied', async () => {
    // Slicing {2} means first 2 elements from the *original* array: Alice (index 0), Bob (index 1)
    const template = '<~{2}<`<#users.index#> of <#users.length#>: <#name#>;`><*><[users]>~>';
    const result = await evaluate(template, usersContext);
    expect(result).toBe('0 of 3: Alice;1 of 3: Bob;'); // Index is 0-based
  });

  it('should correctly set new variables when slicing with offset is applied (0-based)', async () => {
    // Slicing {1,1} means 1 element starting from original index 0 (Alice)
    const template = '<~{1,1}<`<#users.elementindex#> of <#users.length#>: <#name#>;`><*><[users]>~>';
    const result = await evaluate(template, usersContext);
    expect(result).toBe('1 of 3: Alice;'); // Index is 0-based
  });
});
