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

    it('should handle recursive variable replacement', async () => {
      const result = await evalWithContext('<#recursive1#>');
      expect(result).toBe('Recursive 2');
    });
  });

  describe('Indirection', () => {
    it('should follow a chain of indirect variables', async () => {
      const result = await evalWithContext('See Indirection -- <##indirection-0##>');
      expect(result).toBe('See Indirection -- The real value we are seeking');
    });
  });

  describe('Conditionals', () => {
    it('should evaluate the true branch when condition is "1"', async () => {
      const template = '<+TRUE<->FALSE<?1?>>';
      const result = await evalWithContext(template);
      expect(result).toBe('TRUE');
    });

    it('should evaluate the false branch when condition is "0"', async () => {
      const template = '<+TRUE<->FALSE<?0?>>';
      const result = await evalWithContext(template);
      expect(result).toBe('FALSE');
    });

    it.todo('should handle an optional false branch correctly on true');
  });

  describe('Cross-Product Expansion', () => {
    it('should expand a multi-variable array', async () => {
      const template = '<~<#var3#> <#xar1#> <#xar2#>\n~><*><[morevalues]>~>';
      const result = await evalWithContext(template);
      const expected = 'there xalue1A xalue2A\n'
                     + 'there xalue1B xalue2B\n'
                     + 'there xalue1C xalue2C\n';
      expect(result).toBe(expected);
    });

    it('should use an indirect variable for the array name', async () => {
        const template = '<~<#var1#> ~><*><[<#arrayNameVar#>]>~>';
        const result = await evalWithContext(template);
        expect(result).toBe('value1 value2 value3 ');
    });

    it.todo('should handle special variables like .elementindex and .numberofelements');
    it.todo('should handle range slicing with only a max value');
    it.todo('should handle range slicing with a min and max value');
    it.todo('should handle conditional delimiters for list generation');
  });

  describe('Function Calls', () => {
    it.todo('should execute a function from the context with no arguments');
  });
});
