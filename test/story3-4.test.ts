import { describe, it, expect, beforeAll } from 'vitest';
import { DataContext } from '../src/types.js';
import { clearTraceLog } from '../src/tracer.js';
import { createTestEvaluator } from './test-helper.js';
import { comprehensiveContext } from './fixtures/test-data.js';

describe('Template Evaluator', () => {
  beforeAll(() => {
    clearTraceLog();
  });

  const evaluate = createTestEvaluator();

  describe('Story 3: Cross-Product Evaluation (<~...<*>...~>)', () => {
    const usersContext: DataContext = new Map([
      ['users', [
        new Map([['name', 'Alice'], ['email', 'alice@example.com']]),
        new Map([['name', 'Bob'], ['email', 'bob@example.com']]),
        new Map([['name', 'Charlie'], ['email', 'charlie@example.com']]),
        new Map([['name', 'David'], ['email', 'david@example.com']]),
      ]]
    ]);

    it('should iterate over an array of Maps and evaluate the template for each', async () => {
      const template = '<~<`- <#name#> (<#email#>)`><*><[users]>~>';
      const result = await evaluate((template), usersContext);
      expect(result).toBe('- Alice (alice@example.com)- Bob (bob@example.com)- Charlie (charlie@example.com)- David (david@example.com)');
    });

    it('should access parent context variables from within the loop', async () => {
      const template = '<~<`<#prefix#>: <#name#>. `><*><[users]>~>';
      const context = new Map([
        ...usersContext,
        ['prefix', 'User'],
      ]);
      const result = await evaluate((template), context);
      expect(result).toBe('User: Alice. User: Bob. User: Charlie. User: David. ');
    });

    it('should provide special iteration variables in the sub-context', async () => {
      const template = '<~<`<#users.elementindex#>/<#users.numberofelements#>: <#name#>;`><*><[users]>~>';
      const result = await evaluate((template), usersContext);
      expect(result).toBe('1/4: Alice;2/4: Bob;3/4: Charlie;4/4: David;');
    });

    it('should produce an empty string if the array does not exist', async () => {
      const template = '<~<`- <#name#>`><*><[nonExistentArray]>~>';
      const result = await evaluate((template), new Map());
      expect(result).toBe('');
    });

    it('should produce an empty string if the referenced value is not an array', async () => {
      const template = '<~<`- <#name#>`><*><[users]>~>';
      const context: DataContext = new Map([['users', 'not-an-array']]);
      const result = await evaluate((template), context);
      expect(result).toBe('');
    });

    it('should iterate using an indirect array name (Story 4)', async () => {
      const template = '<~<`<#name#>, `><*><[<#arrayVar#>]>~>';
      const context: DataContext = new Map([
        ...usersContext,
        ['arrayVar', 'users'],
      ]);
      const result = await evaluate((template), context);
      expect(result).toBe('Alice, Bob, Charlie, David, ');
    });
  });

  describe('Cross-Product Expansion', () => {
    it('should expand a multi-variable array using parent context', async () => {
      const template = '<~<`<#var3#> <#xar1#> <#xar2#>\n`><*><[morevalues]>~>';
      const result = await evaluate(template, comprehensiveContext);
      const expected = 'there xalue1A xalue2A\n'
        + 'there xalue1B xalue2B\n'
        + 'there xalue1C xalue2C\n';
      expect(result).toBe(expected);
    });

    it('should handle special iteration variables', async () => {
      const template = '<~<`<#values.elementindex#> of <#values.numberofelements#>: <#var1#>\n`><*><[values]>~>';
      const result = await evaluate(template, comprehensiveContext);
      const expected = '1 of 3: value1\n'
        + '2 of 3: value2\n'
        + '3 of 3: value3\n';
      expect(result).toBe(expected);
    });

    it('should iterate over an array referenced by an indirect name', async () => {
      const template = '<~<`<#var1#> `><*><[<#arrayNameVar#>]>~>';
      const result = await evaluate(template, comprehensiveContext);
      expect(result).toBe('value1 value2 value3 ');
    });
  });
});
