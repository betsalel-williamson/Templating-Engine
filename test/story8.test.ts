import { describe, it, expect, beforeAll } from 'vitest';
import { DataContext } from '../src/types.js';
import { clearTraceLog } from '../src/tracer.js';
import { createTestEvaluator } from './test-helper.js';

describe('Template Evaluator', () => {
  beforeAll(() => {
    clearTraceLog();
  });

  const evaluate = createTestEvaluator();

  describe('Story 8: Array Slicing for Cross-Products', () => {
    const numbersContext: DataContext = new Map([
      ['numbers', [
        new Map([['value', 'one']]),
        new Map([['value', 'two']]),
        new Map([['value', 'three']]),
        new Map([['value', 'four']]),
        new Map([['value', 'five']]),
      ]]
    ]);

    it('should slice with {limit} from the beginning of the array', async () => {
      const template = '<~{3}<`<#value#>`><*><[numbers]>~>';
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('onetwothree');
    });

    it('should slice with {offset,limit}', async () => {
      const template = '<~{2,2}<`<#value#>`><*><[numbers]>~>'; // start at index 1 (2nd element), take 2
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('twothree');
    });

    it('should handle {offset,limit} where offset is out of bounds', async () => {
      const template = '<~{10,2}<`<#value#>`><*><[numbers]>~>'; // offset too high
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('');
    });

    it('should handle {offset,limit} where limit exceeds array length', async () => {
      const template = '<~{3,10}<`<#value#>`><*><[numbers]>~>'; // limit too high
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('threefourfive'); // 'three', 'four', 'five'
    });

    it('should return empty string if sliced array is empty', async () => {
      const template = '<~{1,0}<`<#value#>`><*><[numbers]>~>'; // limit 0
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('');
    });

    it('should correctly set numberofelements to the original array length', async () => {
      const template = '<~{2,2}<`<#numbers.elementindex#> of <#numbers.numberofelements#>: <#value#>;`><*><[numbers]>~>';
      const result = await evaluate(template, numbersContext);
      // Expecting original index 2 (value 'two') and original index 3 (value 'three')
      expect(result).toBe('2 of 5: two;3 of 5: three;');
    });

    it('should correctly set elementindex reflecting original array position', async () => {
      const template = '<~{4,1}<`<#numbers.elementindex#>-<#value#>`><*><[numbers]>~>';
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('4-four');
    });

    it('should correctly set elementindex and numberofelements for a single-element slice', async () => {
      const template = '<~{1,1}<`<#numbers.elementindex#> of <#numbers.numberofelements#>: <#value#>;`><*><[numbers]>~>';
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('1 of 5: one;');
    });

    it('should handle slicing for an indirect array name', async () => {
      const template = '<~{2,2}<`<#name#>;`><*><[<#arrayVar#>]>~>';

      const usersContext: DataContext = new Map([
        ['users', [
          new Map([['name', 'Alice'], ['email', 'alice@example.com']]),
          new Map([['name', 'Bob'], ['email', 'bob@example.com']]),
          new Map([['name', 'Charlie'], ['email', 'charlie@example.com']]),
          new Map([['name', 'David'], ['email', 'david@example.com']]),
        ]]
      ]);

      const context: DataContext = new Map([
        ...usersContext,
        ['arrayVar', 'users'],
      ]);
      // users: Alice, Bob, Charlie, David
      // slice {2,2} -> Bob, Charlie
      const result = await evaluate(template, context);
      expect(result).toBe('Bob;Charlie;');
    });
  });
});

