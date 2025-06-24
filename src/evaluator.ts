import {
  AstNode,
  DataContext,
  FunctionRegistry,
  RegisteredFunction,
} from './types.js';
import { parse } from '../lib/parser.js';

const MAX_EVAL_DEPTH = 50;

interface EvaluatorConfig {
  functions: FunctionRegistry;
  cloneFunctions?: boolean;
}

export function createSecureEvaluator(config: EvaluatorConfig) {
  const privateFunctions = new Map<string, RegisteredFunction>();

  for (const [name, func] of config.functions.entries()) {
    if (config.cloneFunctions) {
      // Level 2 Security: Deep clone the function to break closures.
      // This implementation is more robust for async/arrow functions.
      const funcString = func.toString();
      const body = `return (${funcString}).apply(null, arguments)`;
      privateFunctions.set(name, new Function(body) as RegisteredFunction);
    } else {
      // Level 1 Security (Default): Copy the function reference.
      privateFunctions.set(name, func);
    }
  }

  return async function evaluate(
    node: AstNode,
    context: DataContext,
    depth: number = 0
  ): Promise<string> {
    if (depth > MAX_EVAL_DEPTH) {
      throw new Error("Max evaluation depth exceeded, possible infinite loop in template variables.");
    }
    if (!node) return '';
    switch (node.type) {
      case 'Template':
        return (await Promise.all(node.body.map(child => evaluate(child, context, depth + 1)))).join('');
      case 'Literal':
        return node.value;
      case 'Variable': {
        const value = context.get(node.name);
        if (value === undefined) return `<#${node.name}#>`;
        return await evaluate(parse(String(value)), context, depth + 1);
      }
      case 'IndirectVariable': {
        let currentKey = node.name;
        if (!context.has(currentKey)) return `<##${node.name}##>`;
        let currentValue = context.get(currentKey);
        const visited = new Set<string>([currentKey]);

        // Keep resolving as long as the current value is a string AND it's a key in the context
        while (typeof currentValue === 'string' && context.has(currentValue)) {
          currentKey = currentValue;
          if (visited.has(currentKey)) throw new Error(`Circular indirect reference detected: ${[...visited, currentKey].join(' -> ')}`);
          visited.add(currentKey);
          currentValue = context.get(currentKey);
        }

        // After the loop, currentValue is the final resolved value.
        // If it's a string, it might be a template that needs further evaluation.
        // If it's not a string, it means the indirection resolved to a non-string value (like an array or number),
        // in which case the *key* that led to this value is the array name we need.
        if (typeof currentValue === 'string') {
          return await evaluate(parse(currentValue), context, depth + 1);
        } else {
          // The indirection resolved to a a non-string value (e.g., an array, number, boolean).
          // We return the *key* that mapped to this value, as this is typically what's expected
          // when an indirect variable is used to point to an array.
          return currentKey;
        }
      }
      case 'FunctionCall': {
        const { functionName, args } = node;
        const func = privateFunctions.get(functionName);
        if (!func) throw new Error(`Attempted to call unregistered function: "${functionName}"`);
        const resolvedArgs = await Promise.all(args.map(arg => evaluate(arg, context, depth + 1)));
        const result = await func(...resolvedArgs);
        return String(result);
      }
      case 'Array':
        // This case should ideally not be reached if parser correctly nests Array nodes inside CrossProduct.
        // It's here as a safeguard.
        throw new Error(`Invalid AST: Encountered a standalone ArrayNode. Should be nested in CrossProduct.`);
      case 'CrossProduct': {
        let arrayName: string;
        if (typeof node.iterator.name === 'string') {
          arrayName = node.iterator.name;
        } else {
          // Evaluate nested template within ArrayRule for Story 9
          // This evaluates the template within the ArrayRule's brackets to get the string name.
          arrayName = await evaluate(node.iterator.name, context, depth + 1);
        }

        const rawArrayData = context.get(arrayName);

        if (!Array.isArray(rawArrayData) || rawArrayData.length === 0) return '';

        const originalArrayLength = rawArrayData.length; // Store original length for numberofelements

        // Apply slicing logic (Story 8)
        // Convert to 0-based index. If offset is 0 from parser (for {limit}), then 0 - 1 = -1.
        let startIndex = node.offset !== undefined ? node.offset - 1 : 0;
        // Clamp startIndex to ensure it's never negative, even if node.offset was 0.
        startIndex = Math.max(0, startIndex);

        // Calculate endIndex. If limit is undefined, go to end of array.
        let endIndex = node.limit !== undefined ? startIndex + node.limit : rawArrayData.length;

        // Adjust for out-of-bounds or invalid slices
        endIndex = Math.min(rawArrayData.length, endIndex);

        const slicedArrayData = rawArrayData.slice(startIndex, endIndex);

        const iterationResults = await Promise.all(slicedArrayData.map(async (item, index) => {
          // Ensure item is a Map (object), otherwise skip or convert
          if (!(item instanceof Map)) {
            // Depending on desired behavior, could stringify or skip non-Map items
            // For now, consistent with existing behavior, skip.
            return '';
          }
          const subContext = new Map([...context, ...item]);
          // elementindex should be 1-based index relative to the *original* array.
          subContext.set(`${arrayName}.elementindex`, String(startIndex + index + 1));
          subContext.set(`${arrayName}.numberofelements`, String(originalArrayLength)); // Original array length (Story 8 AC)

          return await evaluate(node.template, subContext, depth + 1);
        }));

        if (node.delimiter !== null && node.delimiter !== undefined) {
          return iterationResults.join(node.delimiter) + (node.terminator || '');
        }
        return iterationResults.join('');
      }
      case 'Conditional': {
        const conditionResult = await evaluate(node.condition, context, depth + 1);
        return conditionResult !== '0' && conditionResult !== ''
          ? await evaluate(node.trueBranch, context, depth + 1)
          : await evaluate(node.falseBranch, context, depth + 1);
      }
      default:
        const exhaustiveCheck: never = node;
        throw new Error(`Unhandled AST node type: ${(exhaustiveCheck as any)?.type}`);
    }
  };
}
