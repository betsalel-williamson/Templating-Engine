import { describe, it, expect, beforeAll } from 'vitest';
import { evaluate } from '../src/evaluator.js';
import { parse } from '../lib/parser.js';
import { AstNode, DataContext } from '../src/types.js';
import { comprehensiveContext } from './fixtures/test-data.js';
import { fileTracer, clearTraceLog } from '../src/tracer.js';

describe('Comprehensive Template Tests', () => {
  beforeAll(() => {
    clearTraceLog();
  });

  const parseTemplate = (template: string): AstNode => {
    return parse(template, { tracer: fileTracer }) as AstNode;
  };

  const evalWithContext = async (template: string, context: DataContext = comprehensiveContext) => {
    const ast = parseTemplate(template);
    return evaluate(ast, context);
  };

  describe('Variable Replacement', () => {
    it('should replace a simple variable', async () => {
      const result = await evalWithContext('Hi <#var3#>');
      expect(result).toBe('Hi there');
    });

    it('should leave an unknown variable tag unchanged', async () => {
        const result = await evalWithContext('This is an <#unknown_var#>');
        expect(result).toBe('This is an <#unknown_var#>');
    });

    it('should handle recursive variable replacement via re-evaluation', async () => {
      const result = await evalWithContext('<#recursive1#>');
      expect(result).toBe('Recursive 2');
    });

    it('should throw an error for circular variable references', async () => {
        const context = new Map(comprehensiveContext);
        context.set('cycleA', '<#cycleB#>');
        context.set('cycleB', '<#cycleA#>');
        const template = '<#cycleA#>';

        await expect(evalWithContext(template, context)).rejects.toThrow(
            'Max evaluation depth exceeded'
        );
    });
  });

  describe('Indirection', () => {
    it('should follow a chain of indirect variables', async () => {
      const result = await evalWithContext('See Indirection -- <##indirection-0##>');
      expect(result).toBe('See Indirection -- The real value we are seeking');
    });

    it('should throw on circular indirect reference', async () => {
        const context = new Map();
        context.set('a', 'b');
        context.set('b', 'a');
        await expect(evalWithContext('<##a##>', context)).rejects.toThrow('Circular indirect reference detected: a -> b -> a');
    });
  });

  describe('Conditionals', () => {
    it('should evaluate the true branch when condition is a non-zero string', async () => {
      const template = '<~<+><`TRUE`><-><`FALSE`><?1?>~>';
      const result = await evalWithContext(template);
      expect(result).toBe('TRUE');
    });

    it('should evaluate the true branch when condition is any non-empty, non-zero string', async () => {
      const template = '<~<+><`TRUE`><-><`FALSE`><?true?>~>';
      const result = await evalWithContext(template);
      expect(result).toBe('TRUE');
    });

    it('should evaluate the false branch when condition is "0"', async () => {
      const template = '<~<+><`TRUE`><-><`FALSE`><?0?>~>';
      const result = await evalWithContext(template);
      expect(result).toBe('FALSE');
    });

    it('should evaluate the false branch when condition is an empty string', async () => {
      const template = '<~<+><`TRUE`><-><`FALSE`><??>~>';
      const result = await evalWithContext(template);
      expect(result).toBe('FALSE');
    });

    it('should evaluate the false branch when condition variable resolves to ""', async () => {
      const template = '<~<+><`TRUE`><-><`FALSE`><?<#maybe#>?>~>';
      const context = new Map(comprehensiveContext);
      context.set('maybe', '');
      const result = await evalWithContext(template, context);
      expect(result).toBe('FALSE');
    });

    it('should handle missing false branch correctly (true case)', async () => {
      const template = '<~<+><`Is Admin`><?<#isAdmin#>?>~>';
      const context = new Map([['isAdmin', '1']]);
      const result = await evalWithContext(template, context);
      expect(result).toBe('Is Admin');
    });

    it('should handle missing false branch correctly (false case)', async () => {
      const template = '<~<+><`Is Admin`><?<#isAdmin#>?>~>';
      const context = new Map([['isAdmin', '0']]);
      const result = await evalWithContext(template, context);
      expect(result).toBe('');
    });



    it('should handle missing true branch correctly (true case)', async () => {
      const template = '<~<-><`Not Admin`><?<#isAdmin#>?>~>';
      const context = new Map([['isAdmin', '1']]);
      const result = await evalWithContext(template, context);
      expect(result).toBe('');
    });

    it('should handle missing true branch correctly (false case)', async () => {
      const template = '<~<-><`Not Admin`><?<#isAdmin#>?>~>';
      const context = new Map([['isAdmin', '0']]);
      const result = await evalWithContext(template, context);
      expect(result).toBe('Not Admin');
    });

    it('should evaluate nested expressions in branches', async () => {
      const template = '<~<+><`Hello <#name#>`><-><`Bye <#name#>`><?<#showHello#>?>~>';
      const context = new Map([['name', 'World'], ['showHello', '1']]);
      const result = await evalWithContext(template, context);
      expect(result).toBe('Hello World');

      const context2 = new Map([['name', 'World'], ['showHello', '0']]);
      const result2 = await evalWithContext(template, context2);
      expect(result2).toBe('Bye World');
    });

    it('should handle both branches being missing', async () => {
      const template = '<~<?<#cond#>?>~>';
      const result = await evalWithContext(template, new Map([['cond', '1']]));
      expect(result).toBe('');
    });
  });

  describe('Cross-Product Expansion', () => {
    it('should expand a multi-variable array using parent context', async () => {
      const template = '<~<`<#var3#> <#xar1#> <#xar2#>\n`><*><[morevalues]>~>';
      const result = await evalWithContext(template);
      const expected = 'there xalue1A xalue2A\n'
                     + 'there xalue1B xalue2B\n'
                     + 'there xalue1C xalue2C\n';
      expect(result).toBe(expected);
    });

    it('should handle special iteration variables', async() => {
      const template = '<~<`<#values.elementindex#> of <#values.numberofelements#>: <#var1#>\n`><*><[values]>~>';
      const result = await evalWithContext(template);
      const expected = '1 of 3: value1\n'
                     + '2 of 3: value2\n'
                     + '3 of 3: value3\n';
      expect(result).toBe(expected);
    });

    it('should iterate over an array referenced by an indirect name', async () => {
      const template = '<~<`<#var1#> `><*><[<#arrayNameVar#>]>~>';
      const result = await evalWithContext(template);
      expect(result).toBe('value1 value2 value3 ');
    });
  });

  describe('Conditional Cross-Product (Story 6)', () => {
    const sqlContext = new Map([
      ['attributes', [
        new Map([['attribute', 'attr1'], ['type', 'integer']]),
        new Map([['attribute', 'attr2'], ['type', 'integer']]),
        new Map([['attribute', 'attr3'], ['type', 'integer']]),
      ]]
    ]);

    it('should generate a SQL CREATE TABLE statement with correct delimiters', async () => {
      const template = 'create table someTable (\n<~<`  <#attribute#> <#type#>`><*?,\n:\n><[attributes]>~>);';
      const result = await evalWithContext(template, sqlContext);
      const expected = 'create table someTable (\n'
                     + '  attr1 integer,\n'
                     + '  attr2 integer,\n'
                     + '  attr3 integer\n'
                     + ');';
      expect(result).toBe(expected);
    });

    it('should handle only a delimiter', async () => {
        const template = '[<~<`<#attribute#>`><*?,:><[attributes]>~>]';
        const result = await evalWithContext(template, sqlContext);
        expect(result).toBe('[attr1,attr2,attr3]');
    });

    it('should handle only a terminator', async () => {
        const template = '<~<`<#attribute#>`><*?:;><[attributes]>~>';
        const result = await evalWithContext(template, sqlContext);
        expect(result).toBe('attr1attr2attr3;');
    });
  });
});
