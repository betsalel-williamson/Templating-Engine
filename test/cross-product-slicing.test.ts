import { describe, it, expect } from 'vitest';
import { DataContext } from '../src/types.js';
import { createTestEvaluator } from './test-helper.js';

describe('Template Evaluator', () => {
  const evaluate = createTestEvaluator();

  describe('Story 8: Array Slicing for Cross-Products (1-based offset)', () => {
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
      const template = '<~{3}<`<#value#>`><*><[numbers]>~>'; // {limit} means first 3 elements
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('onetwothree');
    });

    it('should slice with {offset,limit} using 1-based offset', async () => {
      const template = '<~{2,2}<`<#value#>`><*><[numbers]>~>'; // start at element 2, take 2 elements
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('twothree'); // 'two' (element 2), 'three' (element 3)
    });

    it('should handle {offset,limit} where offset is out of bounds', async () => {
      const template = '<~{10,2}<`<#value#>`><*><[numbers]>~>'; // offset too high
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('');
    });

    it('should handle {offset,limit} where limit exceeds array length', async () => {
      const template = '<~{3,10}<`<#value#>`><*><[numbers]>~>'; // start at element 3, limit too high
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('threefourfive');
    });

    it('should return empty string if sliced array is empty', async () => {
      const template = '<~{1,0}<`<#value#>`><*><[numbers]>~>'; // limit 0
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('');
    });

    it('should correctly set numberofelements to the original array length', async () => {
      // Slice {2,2} -> elements at original 1-based index 2 (two) and 3 (three)
      const template = '<~{2,2}<`<#numbers.elementindex#> of <#numbers.numberofelements#>: <#value#>;`><*><[numbers]>~>';
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('2 of 5: two;3 of 5: three;');
    });

    it('should correctly set elementindex reflecting original array position', async () => {
      // Slice {4,1} -> element at original 1-based index 4 (four)
      const template = '<~{4,1}<`<#numbers.elementindex#>-<#value#>`><*><[numbers]>~>';
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('4-four');
    });

    it('should correctly set elementindex and numberofelements for a single-element slice', async () => {
      // Slice {1,1} -> element at original 1-based index 1 (one)
      const template = '<~{1,1}<`<#numbers.elementindex#> of <#numbers.numberofelements#>: <#value#>;`><*><[numbers]>~>';
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('1 of 5: one;');
    });

    it('should handle slicing for an indirect array name', async () => {
      const template = '<~{2,2}<`<#name#>;`><*><[<#arrayVar#>]>~>';

      const usersContext: DataContext = new Map([
        ['users', [
          new Map([['name', 'Alice']]),
          new Map([['name', 'Bob']]),
          new Map([['name', 'Charlie']]),
          new Map([['name', 'David']]),
        ]]
      ]);

      const context: DataContext = new Map([
        ...usersContext,
        ['arrayVar', 'users'],
      ]);
      // users: Alice (1), Bob (2), Charlie (3), David (4)
      // slice {2,2} -> Bob, Charlie
      const result = await evaluate(template, context);
      expect(result).toBe('Bob;Charlie;');
    });
  });
});
