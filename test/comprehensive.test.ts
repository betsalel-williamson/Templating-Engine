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

  describe.skip('Conditionals', () => {
    it('should evaluate the true branch when condition is "1"', async () => {
      const template = '<+TRUE<->FALSE<?1?>>';
      const result = await evalWithContext(template);
      expect(result).toBe('TRUE');
    });
  });

  describe('Cross-Product Expansion', () => {
    it('should expand a multi-variable array using parent context', async () => {
      const template = '<~<#var3#> <#xar1#> <#xar2#>\n<*><[morevalues]>~>';
      const result = await evalWithContext(template);
      const expected = 'there xalue1A xalue2A\n'
                     + 'there xalue1B xalue2B\n'
                     + 'there xalue1C xalue2C\n';
      expect(result).toBe(expected);
    });

    it('should handle special iteration variables', async() => {
      const template = '<~<#values.elementindex#> of <#values.numberofelements#>: <#var1#>\n<*><[values]>~>';
      const result = await evalWithContext(template);
      const expected = '1 of 3: value1\n'
                     + '2 of 3: value2\n'
                     + '3 of 3: value3\n';
      expect(result).toBe(expected);
    });

    it('should iterate over an array referenced by an indirect name', async () => {
      const template = '<~<#var1#> <*><[<#arrayNameVar#>]>~>';
      const result = await evalWithContext(template);
      expect(result).toBe('value1 value2 value3 ');
    });
  });
});
