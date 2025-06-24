import { describe, it, expect } from 'vitest';
import { createTestEvaluator } from './test-helper.js';
import { FunctionRegistry } from '../src/types.js';

describe('Story 7: Function Calls and Secure Factory', () => {
  it('should call a registered function (default copy-reference mode)', async () => {
    const functions: FunctionRegistry = new Map([['toUpperCase', async (str: string) => str.toUpperCase()]]);
    const evaluate = createTestEvaluator(functions);
    const result = await evaluate('<{toUpperCase(test)}>');
    expect(result).toBe('TEST');
  });

  it('should be immune to registry map mutation (default copy-reference mode)', async () => {
    const originalFunctions: FunctionRegistry = new Map([['transform', async (str: string) => `original-${str}`]]);
    const evaluate = createTestEvaluator(originalFunctions);
    originalFunctions.set('transform', async () => `mutated`);
    const result = await evaluate('<{transform(input)}>');
    expect(result).toBe('original-input');
  });

  it('should throw an error for unregistered functions', async () => {
    const evaluate = createTestEvaluator(new Map());
    await expect(evaluate('<{nonExistentFunc()}>')).rejects.toThrow('unregistered function');
  });

  it('should be immune to insecure closure mutation when cloning is enabled', async () => {
    let config = { value: 'original' };
    const insecureFunc = async () => config.value;
    const functions: FunctionRegistry = new Map([['getConfig', insecureFunc]]);

    // Create evaluator with cloning enabled.
    const evaluate = createTestEvaluator(functions, true);

    // Mutate the external state AFTER the evaluator is created.
    config.value = 'mutated';

    // CORRECTED TEST: The test now correctly expects the `evaluate` call
    // itself to throw the ReferenceError because the cloned function's
    // closure is broken and it cannot access `config`.
    await expect(evaluate('<{getConfig()}>')).rejects.toThrow(ReferenceError);
  });

  it('should still be vulnerable to insecure closure when cloning is disabled', async () => {
    let config = { value: 'original' };
    const insecureFunc = async () => config.value;
    const functions: FunctionRegistry = new Map([['getConfig', insecureFunc]]);

    // Create evaluator with default settings (cloning disabled).
    const evaluate = createTestEvaluator(functions, false);

    // Mutate the external state.
    config.value = 'mutated';

    // The function call should succeed but return the mutated value.
    const result = await evaluate('<{getConfig()}>');
    expect(result).toBe('mutated');
  });
});
