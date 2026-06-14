import { describe, it, expect } from 'vitest';
import { createTestEvaluator } from './test-helper.js';
import { FunctionRegistry } from '../src/types.js';

describe('String Literals - Comprehensive Tests', () => {
  describe('Basic String Literal Behavior', () => {
    it('should strip quotes from simple string literals', async () => {
      const functions: FunctionRegistry = new Map([['echo', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{echo("hello world")}>');
      expect(result).toBe('hello world');
    });

    it('should handle empty string literals', async () => {
      const functions: FunctionRegistry = new Map([['echo', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{echo("")}>');
      expect(result).toBe('');
    });

    it('should keep quotes as literal text in templates outside functions', async () => {
      const evaluate = createTestEvaluator();
      const result = await evaluate('Hello "world"!');
      expect(result).toBe('Hello "world"!');
    });
  });

  describe('String Literals with Variables', () => {
    it('should evaluate variables inside string literals', async () => {
      const functions: FunctionRegistry = new Map([['echo', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const context = new Map([['name', 'World']]);
      const result = await evaluate('<{echo("Hello <#name#>!")}>', context);
      expect(result).toBe('Hello World!');
    });

    it('should evaluate multiple variables inside string literals', async () => {
      const functions: FunctionRegistry = new Map([['format', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const context = new Map([
        ['first', 'John'],
        ['last', 'Doe'],
      ]);
      const result = await evaluate('<{format("<#first#> <#last#>")}>', context);
      expect(result).toBe('John Doe');
    });

    it('should evaluate variables in mixed content', async () => {
      const functions: FunctionRegistry = new Map([
        ['format', async (a: string, b: string) => `[${a}][${b}]`],
      ]);
      const evaluate = createTestEvaluator(functions);
      const context = new Map([['val', '42']]);
      const result = await evaluate('<{format("prefix<#val#>","<#val#>suffix")}>', context);
      expect(result).toBe('[prefix42][42suffix]');
    });

    it('should evaluate indirect variables inside string literals', async () => {
      const functions: FunctionRegistry = new Map([['echo', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const context = new Map([
        ['key', 'name'],
        ['name', 'World'],
      ]);
      const result = await evaluate('<{echo("Hello <##key##>!")}>', context);
      expect(result).toBe('Hello World!');
    });
  });

  describe('String Literals with Nested Functions', () => {
    it('should evaluate nested function calls inside string literals', async () => {
      const functions: FunctionRegistry = new Map([
        ['toUpper', async (str: string) => str.toUpperCase()],
        ['format', async (str: string) => `[${str}]`],
      ]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{format("Result: <{toUpper(\"hello\")}>")}>');
      expect(result).toBe('[Result: HELLO]');
    });

    it('should handle complex nested structures in strings', async () => {
      const functions: FunctionRegistry = new Map([
        ['toUpper', async (str: string) => str.toUpperCase()],
        ['concat', async (a: string, b: string) => `${a}${b}`],
      ]);
      const evaluate = createTestEvaluator(functions);
      const context = new Map([['name', 'world']]);
      const result = await evaluate('<{concat("Hello ", "<{toUpper(\"<#name#>\")}>")}>', context);
      expect(result).toBe('Hello WORLD');
    });
  });

  describe('Escape Sequences', () => {
    it('should escape quotes inside string literals', async () => {
      const functions: FunctionRegistry = new Map([['echo', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{echo("Say \\"hello\\"")}>');
      expect(result).toBe('Say "hello"');
    });

    it('should escape backslashes', async () => {
      const functions: FunctionRegistry = new Map([['echo', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{echo("path\\\\to\\\\file")}>');
      expect(result).toBe('path\\to\\file');
    });

    it('should escape angle brackets to prevent variable evaluation', async () => {
      const functions: FunctionRegistry = new Map([['echo', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const context = new Map([['name', 'World']]);
      const result = await evaluate('<{echo("Literal \\<#name#\\>")}>', context);
      expect(result).toBe('Literal <#name#>');
    });

    // TODO: Implement escaping in regular templates (outside string literals)
    it.skip('should allow escaped tags in templates', async () => {
      const evaluate = createTestEvaluator();
      const context = new Map([['var', 'value']]);
      const result = await evaluate(
        'This is \\<#var#\\> literal and this is <#var#> evaluated',
        context
      );
      expect(result).toBe('This is <#var#> literal and this is value evaluated');
    });

    it('should handle mixed escaped and non-escaped content', async () => {
      const functions: FunctionRegistry = new Map([['format', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const context = new Map([['name', 'World']]);
      const result = await evaluate('<{format("Hello <#name#> and \\<#name#\\>")}>', context);
      expect(result).toBe('Hello World and <#name#>');
    });
  });

  describe('String Literals in Different Contexts', () => {
    // TODO: Fix cross-product iteration variable naming
    it.skip('should work in cross-product templates', async () => {
      const evaluate = createTestEvaluator();
      const context = new Map([['items', ['apple', 'banana', 'cherry']]]);
      const result = await evaluate('<~<`"Item: <#items#>"`><*?, :><[items]>~>', context);
      expect(result).toBe('Item: apple, Item: banana, Item: cherry');
    });

    it('should keep quotes literal in conditional expressions', async () => {
      const evaluate = createTestEvaluator();
      const context = new Map([['flag', 'yes']]);
      const result = await evaluate(
        '<~<?<#flag#>?><+><`"Flag is set"`><-><`"Flag is not set"`>~>',
        context
      );
      expect(result).toBe('"Flag is set"');
    });

    it('should keep quotes literal in subtemplates', async () => {
      const evaluate = createTestEvaluator();
      const context = new Map([['name', 'Alice']]);
      const result = await evaluate('<`"Greeting: Hello <#name#>!"`>', context);
      expect(result).toBe('"Greeting: Hello Alice!"');
    });
  });

  describe('XML/HTML Support', () => {
    it('should handle XML tags without escaping', async () => {
      const evaluate = createTestEvaluator();
      const context = new Map([['name', 'World']]);
      const result = await evaluate('<div class="greeting">Hello <#name#>!</div>', context);
      expect(result).toBe('<div class="greeting">Hello World!</div>');
    });

    it('should handle XML tags in string literals', async () => {
      const functions: FunctionRegistry = new Map([['format', async (str: string) => str]]);
      const evaluate = createTestEvaluator(functions);
      const context = new Map([['name', 'Alice']]);
      const result = await evaluate('<{format("<user><name><#name#></name></user>")}>', context);
      expect(result).toBe('<user><name>Alice</name></user>');
    });

    it('should handle comparison operators without escaping', async () => {
      const functions: FunctionRegistry = new Map([['echo', async (str: string) => str]]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{echo("if (x > 5 && y < 10) { return true; }")}>');
      expect(result).toBe('if (x > 5 && y < 10) { return true; }');
    });
  });

  describe('Edge Cases', () => {
    it('should handle strings with only variables', async () => {
      const functions: FunctionRegistry = new Map([['echo', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const context = new Map([['value', 'test']]);
      const result = await evaluate('<{echo("<#value#>")}>', context);
      expect(result).toBe('test');
    });

    it('should handle multiple consecutive escapes', async () => {
      const functions: FunctionRegistry = new Map([['echo', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{echo("\\\\\\\\")}>');
      expect(result).toBe('\\\\');
    });

    it('should handle strings with special characters', async () => {
      const functions: FunctionRegistry = new Map([['echo', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{echo("test!@#$%^&*()_+-={}[];:,.<>?/")}>');
      expect(result).toBe('test!@#$%^&*()_+-={}[];:,.<>?/');
    });

    it('should preserve whitespace in string literals', async () => {
      const functions: FunctionRegistry = new Map([['echo', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{echo("  spaces  and\ttabs\nand\nnewlines  ")}>');
      expect(result).toBe('  spaces  and\ttabs\nand\nnewlines  ');
    });

    it('should handle angle brackets without escaping', async () => {
      const functions: FunctionRegistry = new Map([
        ['concat', async (a: string, b: string) => `${a}|${b}`],
      ]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{concat("<", ">")}>');
      expect(result).toBe('<|>');
    });
  });
});
