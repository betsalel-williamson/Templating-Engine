import { describe, it, expect, beforeAll } from 'vitest';
import { DataContext } from '../src/types.js';
import { clearTraceLog } from '../src/tracer.js';
import { createTestEvaluator } from './test-helper.js';

describe('Story 9: Support Templated Array Names in Cross-Products', () => {
  beforeAll(() => {
    clearTraceLog();
  });

  const evaluate = createTestEvaluator();

  const baseContext: DataContext = new Map([
    ['users_list', [
      new Map([['name', 'Alice']]),
      new Map([['name', 'Bob']]),
    ]],
    ['products_inventory', [
      new Map([['item', 'Laptop']]),
      new Map([['item', 'Keyboard']]),
    ]],
    ['entity', 'users'],
    ['prefix', 'products'],
    ['suffix', 'inventory'],
  ]);

  it('should resolve an array name constructed from a variable and a literal', async () => {
    const template = '<~<`- <#name#>`><*><[<#entity#>_list]>~>';
    const result = await evaluate(template, baseContext);
    expect(result).toBe('- Alice- Bob');
  });

  it('should resolve an array name constructed from multiple variables and literals', async () => {
    const template = '<~<`- <#item#>`><*><[<#prefix#>_<#suffix#>]>~>';
    const result = await evaluate(template, baseContext);
    expect(result).toBe('- Laptop- Keyboard');
  });

  it('should handle indirect variables within the array name template', async () => {
    const context = new Map([...baseContext, ['list_alias', 'users_list']]);
    const template = '<~<`- <#name#>`><*><[<##list_alias##>]>~>'; // list_alias -> users_list
    const result = await evaluate(template, context);
    expect(result).toBe('- Alice- Bob');
  });

  it('should remain backward compatible with simple variable array names (Story 4)', async () => {
    const template = '<~<`- <#name#>`><*><[<#entity#>list]>~>'; // "entity" + "list" should resolve to "userslist" if "userslist" existed
    const context = new Map([
      ['userslist', [new Map([['name', 'Alice']]), new Map([['name', 'Bob']])]],
      ['entity', 'users']
    ]);
    const result = await evaluate(template, context);
    expect(result).toBe('- Alice- Bob');
  });

  it('should correctly set iteration variables for templated array names', async () => {
    const template = '<~<`<#users_list.elementindex#> of <#users_list.numberofelements#>: <#name#>;`><*><[<#entity#>_list]>~>';
    const result = await evaluate(template, baseContext);
    expect(result).toBe('1 of 2: Alice;2 of 2: Bob;');
  });

  it('should gracefully handle templated array names that resolve to non-existent arrays', async () => {
    const template = '<~<`- <#name#>`><*><[<#nonexistent_entity#>_list]>~>';
    const context = new Map([...baseContext, ['nonexistent_entity', 'foo']]);
    const result = await evaluate(template, context);
    expect(result).toBe('');
  });

  it('should gracefully handle templated array names that resolve to non-array values', async () => {
    const template = '<~<`- <#name#>`><*><[<#entity#>_scalar]>~>';
    const context = new Map([...baseContext, ['users_scalar', 'not-an-array']]);
    const result = await evaluate(template, context);
    expect(result).toBe('');
  });
});
