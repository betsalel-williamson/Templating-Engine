import { describe, it, expect } from 'vitest';
import { createTestEvaluator } from './test-helper.js';
import { FunctionRegistry } from '../src/types.js';

describe('Function Call Arguments - Comprehensive Tests', () => {
  describe('Basic Argument Handling', () => {
    it('should handle functions with no arguments', async () => {
      const functions: FunctionRegistry = new Map([['greeting', async () => 'Hello']]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{greeting()}>');
      expect(result).toBe('Hello');
    });

    it('should handle functions with one argument', async () => {
      const functions: FunctionRegistry = new Map([['echo', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{echo("test")}>');
      expect(result).toBe('test');
    });

    it('should handle functions with two arguments', async () => {
      const functions: FunctionRegistry = new Map([
        ['concat', async (a: string, b: string) => `${a}${b}`],
      ]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{concat("hello","world")}>');
      expect(result).toBe('helloworld');
    });

    it('should handle functions with three arguments', async () => {
      const functions: FunctionRegistry = new Map([
        ['join3', async (a: string, b: string, c: string) => `${a}-${b}-${c}`],
      ]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{join3("one","two","three")}>');
      expect(result).toBe('one-two-three');
    });
  });

  describe('Long Argument Lists', () => {
    it('should handle functions with five arguments', async () => {
      const functions: FunctionRegistry = new Map([
        [
          'join5',
          async (a: string, b: string, c: string, d: string, e: string) =>
            `${a},${b},${c},${d},${e}`,
        ],
      ]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{join5("arg1","arg2","arg3","arg4","arg5")}>');
      expect(result).toBe('arg1,arg2,arg3,arg4,arg5');
    });

    it('should handle functions with ten arguments', async () => {
      const functions: FunctionRegistry = new Map([
        ['join10', async (...args: string[]) => args.join('|')],
      ]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate(
        '<{join10("a1","a2","a3","a4","a5","a6","a7","a8","a9","a10")}>'
      );
      expect(result).toBe('a1|a2|a3|a4|a5|a6|a7|a8|a9|a10');
    });

    it('should handle functions with twenty arguments', async () => {
      const functions: FunctionRegistry = new Map([
        ['join20', async (...args: string[]) => args.join(',')],
      ]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate(
        '<{join20("a1","a2","a3","a4","a5","a6","a7","a8","a9","a10","a11","a12","a13","a14","a15","a16","a17","a18","a19","a20")}>'
      );
      expect(result).toBe('a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15,a16,a17,a18,a19,a20');
    });
  });

  describe('Whitespace Handling', () => {
    it('should handle arguments with spaces between them', async () => {
      const functions: FunctionRegistry = new Map([
        ['concat', async (a: string, b: string) => `${a}${b}`],
      ]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{concat("hello", "world")}>');
      expect(result).toBe('helloworld');
    });

    it('should handle arguments with extra spaces', async () => {
      const functions: FunctionRegistry = new Map([
        ['join3', async (a: string, b: string, c: string) => `${a}-${b}-${c}`],
      ]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{join3(  "one"  ,  "two"  ,  "three"  )}>');
      expect(result).toBe('one-two-three');
    });

    it('should handle arguments with leading/trailing spaces in function call', async () => {
      const functions: FunctionRegistry = new Map([['echo', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{  echo("test")  }>');
      expect(result).toBe('test');
    });
  });

  describe('Multi-line Arguments', () => {
    it('should handle arguments on separate lines', async () => {
      const functions: FunctionRegistry = new Map([
        ['concat', async (a: string, b: string) => `${a}${b}`],
      ]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate(`<{concat(
"hello",
"world"
)}>`);
      expect(result).toBe('helloworld');
    });

    it('should handle each argument on its own line', async () => {
      const functions: FunctionRegistry = new Map([
        ['join3', async (a: string, b: string, c: string) => `${a}-${b}-${c}`],
      ]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate(`<{join3(
  "one",
  "two",
  "three"
)}>`);
      expect(result).toBe('one-two-three');
    });

    it('should handle long multi-line argument lists', async () => {
      const functions: FunctionRegistry = new Map([
        ['join5', async (...args: string[]) => args.join('|')],
      ]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate(`<{join5(
  "arg1",
  "arg2",
  "arg3",
  "arg4",
  "arg5"
)}>`);
      expect(result).toBe('arg1|arg2|arg3|arg4|arg5');
    });

    it('should handle mixed line breaks in arguments', async () => {
      const functions: FunctionRegistry = new Map([
        ['join4', async (...args: string[]) => args.join(',')],
      ]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate(`<{join4("a1", "a2",
  "a3",
  "a4")}>`);
      expect(result).toBe('a1,a2,a3,a4');
    });
  });

  describe('Arguments with Templates', () => {
    it('should handle arguments containing indirect variable references', async () => {
      const functions: FunctionRegistry = new Map([['echo', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const context = new Map([
        ['name', 'name2'],
        ['name2', 'World'],
      ]);
      const result = await evaluate('<{echo(<##name##>)}>', context);
      expect(result).toBe('World');
    });

    it('should handle multiple arguments with variable references', async () => {
      const functions: FunctionRegistry = new Map([
        ['concat', async (a: string, b: string, c: string) => `${a} ${b}${c}`],
      ]);
      const evaluate = createTestEvaluator(functions);
      const context = new Map([
        ['first', 'Hello'],
        ['second', 'World'],
        ['third', '!'],
      ]);
      const result = await evaluate('<{concat(<#first#>,<#second#>,<#third#>)}>', context);
      expect(result).toBe('Hello World!');
    });

    it('should handle arguments with mixed literal and template content', async () => {
      const functions: FunctionRegistry = new Map([
        ['format', async (a: string, b: string) => `[${a}][${b}]`],
      ]);
      const evaluate = createTestEvaluator(functions);
      const context = new Map([['val', '42']]);
      const result = await evaluate('<{format("prefix<#val#>","<#val#>suffix")}>', context);
      expect(result).toBe('[prefix42][42suffix]');
    });
  });

  describe('Arguments with Special Characters', () => {
    it('should handle arguments with hyphens', async () => {
      const functions: FunctionRegistry = new Map([['echo', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{echo("hello-world")}>');
      expect(result).toBe('hello-world');
    });

    it('should handle arguments with underscores', async () => {
      const functions: FunctionRegistry = new Map([['echo', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{echo("hello_world")}>');
      expect(result).toBe('hello_world');
    });

    it('should handle arguments with numbers', async () => {
      const functions: FunctionRegistry = new Map([['echo', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{echo("test123")}>');
      expect(result).toBe('test123');
    });

    it('should handle arguments with dots', async () => {
      const functions: FunctionRegistry = new Map([['echo', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{echo("file.txt")}>');
      expect(result).toBe('file.txt');
    });

    it('should handle arguments with spaces in content', async () => {
      const functions: FunctionRegistry = new Map([['echo', async (arg: string) => arg]]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{echo("hello world")}>');
      expect(result).toBe('hello world');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string arguments', async () => {
      const functions: FunctionRegistry = new Map([
        ['concat', async (a: string, b: string) => `[${a}][${b}]`],
      ]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{concat(,"test")}>');
      expect(result).toBe('[][test]');
    });

    it('should handle all empty arguments', async () => {
      const functions: FunctionRegistry = new Map([
        ['concat3', async (a: string, b: string, c: string) => `[${a}][${b}][${c}]`],
      ]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{concat3(,,)}>');
      expect(result).toBe('[][][]');
    });

    it('should handle trailing comma', async () => {
      const functions: FunctionRegistry = new Map([
        ['concat', async (a: string, b: string) => `${a},${b}`],
      ]);
      const evaluate = createTestEvaluator(functions);
      // This should either work or throw a clear error
      // Depending on the grammar, this might create an empty third argument
      const result = await evaluate('<{concat("a","b",)}>');
      // If it passes 3 arguments, the function will ignore the third
      expect(result).toBe('a,b');
    });
  });

  describe('Nested Function Calls', () => {
    it('should handle nested function calls in arguments', async () => {
      const functions: FunctionRegistry = new Map([
        ['toUpperCase', async (str: string) => str.toUpperCase()],
        ['echo', async (str: string) => str],
      ]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate('<{echo(<{toUpperCase("hello")}>)}>');
      expect(result).toBe('HELLO');
    });

    it('should handle multiple nested functions in arguments', async () => {
      const functions: FunctionRegistry = new Map([
        ['toUpperCase', async (str: string) => str.toUpperCase()],
        ['toLowerCase', async (str: string) => str.toLowerCase()],
        ['concat', async (a: string, b: string) => `${a}-${b}`],
      ]);
      const evaluate = createTestEvaluator(functions);
      const result = await evaluate(
        '<{concat(<{toUpperCase("hello")}>,<{toLowerCase("WORLD")}>)}>'
      );
      expect(result).toBe('HELLO-world');
    });
  });
});
