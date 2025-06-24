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
        let value = context.get(node.name);
        if (value === undefined && node.name.includes('.')) {
          const pathSegments = node.name.split('.');
          value = resolveDotNotation(context, pathSegments);
        }
        if (value === undefined) return node.raw;
        return await evaluate(parse(String(value)), context, depth + 1);
      }
      case 'IndirectVariable': {
        const firstKeyToLookup = await evaluate(node.name, context, depth + 1);

        let currentKeyToLookup: string = firstKeyToLookup;
        let lastResolvedStringValue: string | undefined;

        const visitedKeysInChain = new Set<string>();

        let initialValue: DataContextValue | undefined;
        if (currentKeyToLookup.includes('.')) {
          initialValue = resolveDotNotation(context, currentKeyToLookup.split('.'));
        } else {
          initialValue = context.get(currentKeyToLookup);
        }

        // CORRECTED: If the initial key lookup fails, return the original raw tag.
        if (initialValue === undefined) {
          return node.raw;
        }

        visitedKeysInChain.add(currentKeyToLookup);
        let resolvedValue: DataContextValue = initialValue;

        while (typeof resolvedValue === 'string') {
          const nextKeyCandidate = resolvedValue;
          if (visitedKeysInChain.has(nextKeyCandidate)) {
            throw new Error(`Circular indirect reference detected: ${[...Array.from(visitedKeysInChain), nextKeyCandidate].join(' -> ')}`);
          }
          visitedKeysInChain.add(nextKeyCandidate);

          let tempValue: DataContextValue | undefined;
          if (nextKeyCandidate.includes('.')) {
            tempValue = resolveDotNotation(context, nextKeyCandidate.split('.'));
          } else {
            tempValue = context.get(nextKeyCandidate);
          }

          if (tempValue === undefined) {
            lastResolvedStringValue = nextKeyCandidate;
            resolvedValue = undefined;
            break;
          }

          if (typeof tempValue !== 'string') {
            lastResolvedStringValue = nextKeyCandidate;
            resolvedValue = undefined;
            break;
          }
          resolvedValue = tempValue;
        }

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
        throw new Error(`Invalid AST: Encountered a standalone ArrayNode. Should be nested in CrossProduct.`);
      case 'CrossProduct': {
        const arrayName: string = await evaluate(node.iterator.name, context, depth + 1);
        const rawArrayData = resolveDotNotation(context, arrayName.split('.'));

        if (!Array.isArray(rawArrayData) || rawArrayData.length === 0) return '';
        const originalArrayLength = rawArrayData.length;
        let startIndex = node.offset !== undefined ? node.offset : 0;
        startIndex = Math.max(0, startIndex);
        let endIndex = node.limit !== undefined ? startIndex + node.limit : rawArrayData.length;
        endIndex = Math.min(rawArrayData.length, endIndex);
        const slicedArrayData = rawArrayData.slice(startIndex, endIndex);

        const iterationResults = await Promise.all(slicedArrayData.map(async (item, index) => {
          if (!(item instanceof Map)) return '';
          const subContext = new Map([...context, ...item]);
          const oneBasedIndex = startIndex + index + 1;
          const zeroBasedIndex = startIndex + index;
          subContext.set(`${arrayName}.elementindex`, String(oneBasedIndex));
          subContext.set(`${arrayName}.numberofelements`, String(originalArrayLength));
          subContext.set(`${arrayName}.index`, String(zeroBasedIndex));
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
    }
  };
}
