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
      // This logic is for a future story.
      console.warn("CrossProduct evaluation is not yet implemented.");
      return '';
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
