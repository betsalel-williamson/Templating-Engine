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
        while (typeof currentValue === 'string' && context.has(currentValue)) {
          currentKey = currentValue;
          if (visited.has(currentKey)) throw new Error(`Circular indirect reference detected: ${[...visited, currentKey].join(' -> ')}`);
          visited.add(currentKey);
          currentValue = context.get(currentKey);
        }
        return await evaluate(parse(String(currentValue)), context, depth + 1);
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
        throw new Error(`Invalid AST: Encountered a standalone ArrayNode.`);
      case 'CrossProduct': {
        let arrayName = '';
        if (typeof node.iterator.name === 'string') {
          arrayName = node.iterator.name;
        } else {
          arrayName = await evaluate(node.iterator.name, context, depth + 1);
        }
        const arrayData = context.get(arrayName);
        if (!Array.isArray(arrayData) || arrayData.length === 0) return '';
        const iterationResults = await Promise.all(arrayData.map(async (item, index) => {
          if (!(item instanceof Map)) return '';
          const subContext = new Map([...context, ...item]);
          subContext.set(`${arrayName}.elementindex`, String(index + 1));
          subContext.set(`${arrayName}.numberofelements`, String(arrayData.length));
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
