import {
  AstNode,
  DataContext,
  FunctionRegistry,
  RegisteredFunction,
  DataContextValue,
} from './types.js';
import { parse } from '../lib/parser.js';

const MAX_EVAL_DEPTH = 50;

interface EvaluatorConfig {
  functions: FunctionRegistry;
  cloneFunctions?: boolean;
}

// Helper function to resolve dot-separated variable names in a DataContext Map
function resolveDotNotation(context: DataContext, path: string[]): DataContextValue | undefined {
  let current: DataContextValue | undefined = context;
  for (let i = 0; i < path.length; i++) {
    const segment = path[i];
    if (current instanceof Map) {
      current = current.get(segment);
    } else {
      // If at any point current is not a Map, we cannot resolve further.
      return undefined;
    }
  }
  return current;
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
        // First, try to find the full variable name directly in the current context.
        // This is crucial for "magic" iteration variables (e.g., 'users.index', 'users.elementindex')
        // which are set directly as keys in the sub-context.
        let value = context.get(node.name);

        // If not found as a direct key, and the name contains a dot,
        // try resolving it as a dot-notation path for nested objects.
        if (value === undefined && node.name.includes('.')) {
          const pathSegments = node.name.split('.');
          value = resolveDotNotation(context, pathSegments);
        }

        if (value === undefined) return node.raw; // Use the raw string from the parsed node
        return await evaluate(parse(String(value)), context, depth + 1);
      }
      case 'IndirectVariable': {
        let currentKeyToLookup: string = node.name; // The key we are currently trying to resolve
        let lastResolvedStringValue: string | undefined; // Stores the last string value successfully resolved or the last key

        const visitedKeysInChain = new Set<string>(); // Tracks the *keys* that have been looked up in this chain

        // Resolve the very first key to get its value
        let initialValue: DataContextValue | undefined;
        if (currentKeyToLookup.includes('.')) {
          initialValue = resolveDotNotation(context, currentKeyToLookup.split('.'));
        } else {
          initialValue = context.get(currentKeyToLookup);
        }

        // If the initial key is not found, return the original tag.
        if (initialValue === undefined) {
          return `<##${node.name}##>`;
        }

        // Add the first key to the visited set
        visitedKeysInChain.add(currentKeyToLookup);

        // The resolved value from the current key. This can be a string, Map, array, etc.
        let resolvedValue: DataContextValue = initialValue;

        // Loop as long as the resolved value is a string and potentially points to another key.
        // The string value from the previous step becomes the key for the next.
        while (typeof resolvedValue === 'string') {
          const nextKeyCandidate = resolvedValue; // The string value becomes the next key

          // Check for circular reference before attempting to resolve the next key
          if (visitedKeysInChain.has(nextKeyCandidate)) {
            throw new Error(`Circular indirect reference detected: ${[...Array.from(visitedKeysInChain), nextKeyCandidate].join(' -> ')}`);
          }
          visitedKeysInChain.add(nextKeyCandidate); // Add the candidate key to visited

          let tempValue: DataContextValue | undefined;
          if (nextKeyCandidate.includes('.')) {
            tempValue = resolveDotNotation(context, nextKeyCandidate.split('.'));
          } else {
            tempValue = context.get(nextKeyCandidate);
          }

          if (tempValue === undefined) {
            // The chain breaks because the `nextKeyCandidate` does not exist as a key.
            // The final result of the indirection is this `nextKeyCandidate` string itself.
            lastResolvedStringValue = nextKeyCandidate;
            resolvedValue = undefined; // Signal termination
            break;
          }

          // If tempValue is not a string, the indirection chain terminates.
          // The result of the indirect variable should be the *key string* that pointed to it.
          // This is critical for ArrayRule's string requirement.
          if (typeof tempValue !== 'string') {
            lastResolvedStringValue = nextKeyCandidate; // The key string that led to the non-string value
            resolvedValue = undefined; // Signal termination
            break;
          }

          // Continue the chain
          resolvedValue = tempValue;
        }

        // At this point, lastResolvedStringValue holds the final string result of the indirection.
        // This string might also contain template syntax, so parse and evaluate it one last time.
        return await evaluate(parse(lastResolvedStringValue as string), context, depth + 1);
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
        // The grammar's ArrayRule always produces a TemplateNode for node.iterator.name.
        // Therefore, typeof node.iterator.name === 'string' will always be false.
        // Simplified logic to always evaluate the name as a template.
        const arrayName: string = await evaluate(node.iterator.name, context, depth + 1);

        // Use resolveDotNotation for array data lookup as well
        const rawArrayData = resolveDotNotation(context, arrayName.split('.'));

        if (!Array.isArray(rawArrayData) || rawArrayData.length === 0) return '';

        const originalArrayLength = rawArrayData.length; // Store original length for numberofelements

        // Apply slicing logic (Story 8)
        // # IMPORTANT CHANGE: offset from parser is now expected to be 0-based.
        let startIndex = node.offset !== undefined ? node.offset : 0;
        // Clamp startIndex to ensure it's never negative.
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
          const oneBasedIndex = startIndex + index + 1;
          const zeroBasedIndex = startIndex + index; // Calculate 0-based index

          // Legacy variables (for backward compatibility) - remain 1-based
          subContext.set(`${arrayName}.elementindex`, String(oneBasedIndex));
          subContext.set(`${arrayName}.numberofelements`, String(originalArrayLength));

          // New, modernized variables - index is 0-based, length remains original length
          subContext.set(`${arrayName}.index`, String(zeroBasedIndex)); // Changed to 0-based
          subContext.set(`${arrayName}.length`, String(originalArrayLength));

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
    } /* v8 ignore next */ // each case statement either returns or throws and will not reach here
  };
}
