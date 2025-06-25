import { describe, it, expect } from 'vitest';
import { DataContext, AstNode, ArrayNode } from '../src/types.js'; // Removed TemplateNode, LiteralNode as they are not directly used here
import { createTestEvaluator } from './test-helper.js';
import { createSecureEvaluator } from '../src/evaluator.js'; // Import createSecureEvaluator directly

describe('Evaluator Coverage Tests (Story 16)', () => {
  // Use the standard test evaluator for most cases that require parsing
  const evaluateParsedTemplate = createTestEvaluator();

  // Create a direct evaluator instance for testing null/undefined AstNode inputs
  const directEvaluate = createSecureEvaluator({ functions: new Map() });

  it('should return an empty string if the node is null', async () => {
    // This covers `if (!node) return '';`
    // Directly call the evaluator function with null as the AstNode
    const result = await directEvaluate(null as unknown as AstNode, new Map());
    expect(result).toBe('');
  });

  it('should return an empty string if the node is undefined', async () => {
    // This covers `if (!node) return '';`
    // Directly call the evaluator function with undefined as the AstNode
    const result = await directEvaluate(undefined as unknown as AstNode, new Map());
    expect(result).toBe('');
  });

  it('should throw an error when evaluating a standalone ArrayNode', async () => {
    // This covers `case 'Array': throw new Error(...)`
    const malformedNode: ArrayNode = { type: 'Array', name: 'some_array' };
    await expect(directEvaluate(malformedNode, new Map())).rejects.toThrow('Invalid AST: Encountered a standalone ArrayNode. Should be nested in CrossProduct.');
  });

  it('should handle cross-product iteration over an array containing non-Map items', async () => {
    // This covers `if (!(item instanceof Map)) { return ''; }` within CrossProduct iteration
    const context: DataContext = new Map([
      ['mixed_items', [
        new Map([['name', 'Alice']]),
        'Bob (string)',
        123,
        true,
        new Map([['name', 'Charlie']]),
      ]]
    ]);
    const template = '<~<`- <#name#>`><*><[mixed_items]>~>';
    const result = await evaluateParsedTemplate(template, context);
    // Only 'Alice' and 'Charlie' Maps will be processed, others will result in empty strings.
    // The behavior of `return ''` for non-Map items is critical to cover.
    expect(result).toBe('- Alice- Charlie');
  });

  it('should throw an error for an unhandled AST node type', async () => {
    // This covers the `default` case in the switch statement
    const unknownNode: AstNode = { type: 'UnknownType', value: 'some value' } as AstNode;
    await expect(directEvaluate(unknownNode, new Map())).rejects.toThrow('Unhandled AST node type: UnknownType');
  });

  it('should return undefined from resolveDotNotation when an intermediate path segment is not a Map', async () => {
    // This specifically targets the 'return undefined' branch in resolveDotNotation.
    // We create a context where 'user' is a Map, but 'user.address' is a string, not a Map.
    // Trying to resolve 'user.address.street' should cause resolveDotNotation to return undefined.
    const context: DataContext = new Map([
      ['user', new Map([
        ['name', 'Alice'],
        ['address', '123 Main St, Anytown'] // This is a string, not a nested Map
      ])]
    ]);

    // The template attempts to access 'user.address.street'.
    // Since 'user.address' is a string, 'resolveDotNotation' will return undefined when 'street' is processed.
    // The VariableNode logic should then leave the original tag.
    const template = 'User street: <#user.address.street#>';
    const result = await evaluateParsedTemplate(template, context);
    expect(result).toBe('User street: <#user.address.street#>');
  });
});
