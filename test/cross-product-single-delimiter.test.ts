import { describe, it, expect } from 'vitest';
import { DataContext } from '../src/types.js';
import { createTestEvaluator } from './test-helper.js';

describe('Cross-Product Single Delimiter', () => {
  const evaluate = createTestEvaluator();

  it('should handle a conditional multiplier with only a delimiter and no terminator', async () => {
    const context: DataContext = new Map([
      [
        'items',
        [new Map([['value', 'one']]), new Map([['value', 'two']]), new Map([['value', 'three']])],
      ],
    ]);
    const template = '[<~<`<#value#>`><*?,><[items]>~>]'; // Multiplier is `<*?,>`
    const result = await evaluate(template, context);
    expect(result).toBe('[one,two,three]');
  });

  it('should handle a conditional multiplier with only a delimiter and trailing space', async () => {
    const context: DataContext = new Map([
      [
        'items',
        [new Map([['value', 'one']]), new Map([['value', 'two']]), new Map([['value', 'three']])],
      ],
    ]);
    const template = '[<~<`<#value#>`><*?, ><[items]>~>]'; // Multiplier is `<*?, >`
    const result = await evaluate(template, context);
    expect(result).toBe('[one, two, three]');
  });
});
