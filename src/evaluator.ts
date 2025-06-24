import {
  AstNode,
  DataContext,
} from './types.js';
import { parse } from '../lib/parser.js';

const MAX_EVAL_DEPTH = 50;

export async function evaluate(node: AstNode, context: DataContext, depth: number = 0): Promise<string> {
  if (depth > MAX_EVAL_DEPTH) {
    throw new Error("Max evaluation depth exceeded, possible infinite loop in template variables.");
  }

  if (!node) return ''; // Guard against undefined nodes from faulty parsing

  switch (node.type) {
    case 'Template':
      if (!node.body) return '';
      const results = await Promise.all(node.body.map(child => evaluate(child, context, depth + 1)));
      return results.join('');

    case 'Literal':
      return node.value;

    case 'Variable': {
      const value = context.get(node.name);
      if (value === undefined) {
        return `<#${node.name}#>`;
      }
      // "Template-in-a-variable" strategy: parse the value as a new template and evaluate it.
      const subAst = parse(String(value));
      return await evaluate(subAst, context, depth + 1);
    }

    case 'IndirectVariable': {
      // "Key-chain-lookup" strategy: follow a chain of keys.
      let currentKey = node.name;
      if (!context.has(currentKey)) {
        return `<##${node.name}##>`;
      }

      let currentValue = context.get(currentKey);
      const visited = new Set<string>([currentKey]);

      while (typeof currentValue === 'string' && context.has(currentValue)) {
        currentKey = currentValue;
        if (visited.has(currentKey)) {
          throw new Error(`Circular indirect reference detected: ${[...visited, currentKey].join(' -> ')}`);
        }
        visited.add(currentKey);
        currentValue = context.get(currentKey);
      }
      // The final value might be a template itself, so it needs one final evaluation pass.
      const subAst = parse(String(currentValue));
      return await evaluate(subAst, context, depth + 1);
    }

    case 'Array': {
        throw new Error(`Invalid AST: Encountered a standalone ArrayNode.`);
    }

    case 'CrossProduct': {
      const { template, iterator } = node;

      // 1. Resolve array name from iterator (handles direct and indirect names)
      let arrayName: string;
      if (typeof iterator.name === 'string') {
        arrayName = iterator.name;
      } else {
        // Evaluate the VariableNode to get the array's name string
        arrayName = await evaluate(iterator.name, context, depth + 1);
      }

      const arrayData = context.get(arrayName);

      if (!Array.isArray(arrayData)) {
        // If the key doesn't exist or is not an array, produce no output.
        return '';
      }

      // 2. Iterate, create sub-contexts, and evaluate
      const iterationPromises = arrayData.map(async (item, index) => {
        if (!(item instanceof Map)) {
          // Items must be Maps to create a new variable scope.
          return '';
        }

        // 3. Create sub-context with item properties and special iteration variables
        const subContext = new Map([...context, ...item]);
        subContext.set(`${arrayName}.elementindex`, String(index + 1));
        subContext.set(`${arrayName}.numberofelements`, String(arrayData.length));

        // 4. Evaluate the nested template with the sub-context
        return await evaluate(template, subContext, depth + 1);
      });

      const iterationResults = await Promise.all(iterationPromises);
      return iterationResults.join('');
    }

    case 'Conditional': {
        // This logic is for a future story.
        console.warn("Conditional evaluation is not yet implemented.");
        return '';
    }

    default:
      const exhaustiveCheck: never = node;
      throw new Error(`Unhandled AST node type: ${(exhaustiveCheck as any)?.type}`);
  }
}
