import { describe, it, expect, beforeAll } from 'vitest';
import { createSecureEvaluator } from '../src/evaluator.js';
import { parse } from '../lib/parser.js';
import { DataContext, FunctionRegistry } from '../src/types.js';
import { clearTraceLog } from '../src/tracer.js';
import { createTestEvaluator } from './test-helper.js';

describe('Template Evaluator', () => {
  beforeAll(() => {
    clearTraceLog();
  });

  const evaluate = createTestEvaluator();

  describe('Story 0: Basic Replacement', () => {
    it('should handle a template with only literal text', async () => {
      const result = await evaluate('Hello, world!');
      expect(result).toBe('Hello, world!');
    });

    it('should replace a simple variable when it exists in the context', async () => {
      const context: DataContext = new Map([['name', 'TypeScript']]);
      const result = await evaluate('Hello, <#name#>.', context);
      expect(result).toBe('Hello, TypeScript.');
    });

    it('should leave the variable tag in place if the variable is not in the context', async () => {
      const result = await evaluate('Hello, <#name#>.');
      expect(result).toBe('Hello, <#name#>.');
    });
  });

  describe('Story 1: Standard Variable Evaluation (<#..#>)', () => {
    it('should evaluate a value that is also a template', async () => {
      const template = '<#a#>';
      const context: DataContext = new Map([['a', 'Hello <#b#>'], ['b', 'World']]);
      const result = await evaluate(template, context);
      expect(result).toBe('Hello World');
    });

    it('should handle multiple levels of template-in-variable', async () => {
      const template = '<#a#>';
      const context: DataContext = new Map([['a', '<#b#>'], ['b', '<#c#>'], ['c', 'Final']]);
      const result = await evaluate(template, context);
      expect(result).toBe('Final');
    });

    it('should throw an error on circular reference by reaching max depth', async () => {
      const template = '<#a#>';
      const context: DataContext = new Map([['a', '<#b#>'], ['b', '<#a#>']]);
      await expect(evaluate(template, context)).rejects.toThrow('Max evaluation depth exceeded');
    });
  });

  describe('Story 2: Indirect Variable Evaluation (<##..##>)', () => {
    it('should resolve a chain of keys to a final value', async () => {
      const template = '<##a##>';
      const context: DataContext = new Map([['a', 'b'], ['b', 'c'], ['c', 'Result']]);
      const result = await evaluate(template, context);
      expect(result).toBe('Result');
    });

    it('should return the original tag if the initial key is not found', async () => {
      const template = '<##a##>';
      const context: DataContext = new Map();
      const result = await evaluate(template, context);
      expect(result).toBe('<##a##>');
    });

    it('should throw an error on a direct circular reference', async () => {
      const template = '<##a##>';
      const context: DataContext = new Map([['a', 'a']]);
      await expect(evaluate((template), context)).rejects.toThrow('Circular indirect reference detected: a -> a');
    });

    it('should throw an error on an indirect circular reference', async () => {
      const template = '<##a##>';
      const context: DataContext = new Map([['a', 'b'], ['b', 'c'], ['c', 'a']]);
      await expect(evaluate((template), context)).rejects.toThrow('Circular indirect reference detected: a -> b -> c -> a');
    });

    it('should return the last value if the chain breaks', async () => {
      const template = '<##a##>';
      const context: DataContext = new Map([['a', 'b']]); // b is a value, not a key
      const result = await evaluate((template), context);
      expect(result).toBe('b');
    });

    it('should evaluate the final resolved value as a template', async () => {
      const template = '<##a##>';
      const context: DataContext = new Map([['a', 'b'], ['b', 'Hello <#c#>'], ['c', 'World']]);
      const result = await evaluate((template), context);
      expect(result).toBe('Hello World');
    });
  });

  describe('Story 3: Cross-Product Evaluation (<~...<*>...~>)', () => {
    const usersContext: DataContext = new Map([
      ['users', [
        new Map([['name', 'Alice'], ['email', 'alice@example.com']]),
        new Map([['name', 'Bob'], ['email', 'bob@example.com']]),
      ]]
    ]);

    it('should iterate over an array of Maps and evaluate the template for each', async () => {
      const template = '<~<`- <#name#> (<#email#>)`><*><[users]>~>';
      const result = await evaluate((template), usersContext);
      expect(result).toBe('- Alice (alice@example.com)- Bob (bob@example.com)');
    });

    it('should access parent context variables from within the loop', async () => {
      const template = '<~<`<#prefix#>: <#name#>. `><*><[users]>~>';
      const context = new Map([
        ...usersContext,
        ['prefix', 'User'],
      ]);
      const result = await evaluate((template), context);
      expect(result).toBe('User: Alice. User: Bob. ');
    });

    it('should provide special iteration variables in the sub-context', async () => {
      const template = '<~<`<#users.elementindex#>/<#users.numberofelements#>: <#name#>;`><*><[users]>~>';
      const result = await evaluate((template), usersContext);
      expect(result).toBe('1/2: Alice;2/2: Bob;');
    });

    it('should produce an empty string if the array does not exist', async () => {
      const template = '<~<`- <#name#>`><*><[users]>~>';
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
      expect(result).toBe('Alice, Bob, ');

      describe('Story 7: Function Calls (<{...}>) and Secure Factory', () => {
        it('should call a registered function from a private copy of the registry', async () => {
          const functions: FunctionRegistry = new Map([
            ['toUpperCase', async (str: string) => (str || '').toUpperCase()],
          ]);
          const secureEvaluate = createSecureEvaluator({ functions });

          const ast = parse('<{toUpperCase(test)}>');
          const result = await secureEvaluate(ast, new Map());
          expect(result).toBe('TEST');
        });

        it('should be immune to runtime mutation of the original registry object', async () => {
          const originalFunctions: FunctionRegistry = new Map([
            ['transform', async (str: string) => `original-${str}`],
          ]);
          const secureEvaluate = createSecureEvaluator({ functions: originalFunctions });

          // Maliciously mutate the *original* map after the evaluator has been created.
          originalFunctions.set('transform', async (str: string) => `mutated-${str}`);

          const ast = parse('<{transform(input)}>');
          const result = await secureEvaluate(ast, new Map());

          // The result must be from the function that existed at creation time.
          expect(result).toBe('original-input');
        });

        it('should throw an error for unregistered functions', async () => {
          const secureEvaluate = createSecureEvaluator({ functions: new Map() });
          const ast = parse('<{nonExistentFunc()}>');
          await expect(secureEvaluate(ast, new Map())).rejects.toThrow(
            'Attempted to call unregistered function: "nonExistentFunc"'
          );
        });
      });
    });
  });
});
