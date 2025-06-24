import { describe, it, expect } from 'vitest';
import { DataContext, DataContextValue } from '../src/types.js';
import { createTestEvaluator } from './test-helper.js';

describe('Multi-Line Template Evaluation', () => {

  // Tracing is no longer needed as the parser is correct.
  const evaluate = createTestEvaluator();

  it('should correctly parse and evaluate a complex multi-line SQL template', async () => {
    // This template uses nested loops and multi-line <`...`> blocks.
    // The template for the 'rows' loop now starts with indentation, not a newline,
    // as the delimiter already provides the necessary line break.
    const template =
      '-- Generated SQL for batch inserting user data\n' +
      '\n' +
      'INSERT INTO <#tableName#> (<~<`<#column#>`><*?, ><[columns]>~>)\n' +
      'VALUES\n' +
      '<~<`  (<~<`\'<#value#>\'`><*?, ><[a_row]>~>)`><*?,\n><[rows]>~>;';

    // Data context with nested arrays of maps.
    const dataContext: DataContext = new Map<string, DataContextValue>([
      ['tableName', 'users'],
      ['columns', [
        new Map([['column', 'id']]),
        new Map([['column', 'name']]),
        new Map([['column', 'status']]),
      ]],
      ['rows', [
        new Map([['a_row', [
          new Map([['value', 'a1b2-c3d4']]),
          new Map([['value', 'Alice']]),
          new Map([['value', 'active']]),
        ]]]),
        new Map([['a_row', [
          new Map([['value', 'e5f6-g7h8']]),
          new Map([['value', 'Bob']]),
          new Map([['value', 'inactive']]),
        ]]]),
      ]],
    ]);

    // The expected output is updated to remove the extra blank line after VALUES.
    const expectedOutput = '-- Generated SQL for batch inserting user data\n' +
      '\n' +
      'INSERT INTO users (id, name, status)\n' +
      'VALUES\n' +
      "  ('a1b2-c3d4', 'Alice', 'active'),\n" +
      "  ('e5f6-g7h8', 'Bob', 'inactive');";

    const result = await evaluate(template, dataContext);
    expect(result).toBe(expectedOutput);
  });
});
