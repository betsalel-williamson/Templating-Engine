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

    it('should slice with {limit} from the beginning of the array (0-based)', async () => {
      const template = '<~{3}<`<#value#>`><*><[numbers]>~>'; // {limit} means first 3 elements (indices 0, 1, 2)
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('onetwothree');
    });

    it('should slice with {offset,limit} (0-based)', async () => {
      const template = '<~{1,2}<`<#value#>`><*><[numbers]>~>'; // start at index 1, take 2 elements
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('twothree');
    });

    it('should handle {offset,limit} where offset is out of bounds (0-based)', async () => {
      const template = '<~{10,2}<`<#value#>`><*><[numbers]>~>'; // offset too high
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('');
    });

    it('should handle {offset,limit} where limit exceeds array length (0-based)', async () => {
      const template = '<~{2,10}<`<#value#>`><*><[numbers]>~>'; // start at index 2, limit too high
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('threefourfive'); // 'three', 'four', 'five'
    });

    it('should return empty string if sliced array is empty', async () => {
      const template = '<~{0,0}<`<#value#>`><*><[numbers]>~>'; // limit 0
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('');
    });

    it('should correctly set numberofelements to the original array length', async () => {
      // Slice {1,2} -> elements at original index 1 (two) and 2 (three)
      const template = '<~{1,2}<`<#numbers.elementindex#> of <#numbers.numberofelements#>: <#value#>;`><*><[numbers]>~>';
      const result = await evaluate(template, numbersContext);
      // elementindex is 1-based relative to ORIGINAL array
      expect(result).toBe('2 of 5: two;3 of 5: three;');
    });

    it('should correctly set elementindex reflecting original array position (0-based input)', async () => {
      // Slice {3,1} -> element at original index 3 (four)
      const template = '<~{3,1}<`<#numbers.elementindex#>-<#value#>`><*><[numbers]>~>';
      const result = await evaluate(template, numbersContext);
      // elementindex is 1-based relative to ORIGINAL array
      expect(result).toBe('4-four');
    });

    it('should correctly set elementindex and numberofelements for a single-element slice (0-based input)', async () => {
      // Slice {0,1} -> element at original index 0 (one)
      const template = '<~{0,1}<`<#numbers.elementindex#> of <#numbers.numberofelements#>: <#value#>;`><*><[numbers]>~>';
      const result = await evaluate(template, numbersContext);
      // elementindex is 1-based relative to ORIGINAL array
      expect(result).toBe('1 of 5: one;');
    });

    it('should handle slicing for an indirect array name (0-based input)', async () => {
      const template = '<~{1,2}<`<#name#>;`><*><[<#arrayVar#>]>~>';

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
      // users: Alice (0), Bob (1), Charlie (2), David (3)
      // slice {1,2} -> Bob, Charlie (indices 1 and 2)
      const result = await evaluate(template, context);
      expect(result).toBe('Bob;Charlie;');
    });
  });
});
