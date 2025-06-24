import {
  AstNode,
  DataContext,
  DataContextValue,
} from './types.js';

/**
 * Resolves a variable name to its value from the context.
 * This is a direct lookup. Recursive and indirect lookups are handled by other functions.
 */
function resolveVariable(name: string, context: DataContext): DataContextValue | undefined {
  return context.get(name);
}

export async function evaluate(node: AstNode, context: DataContext): Promise<string> {
  if (!node) return ''; // Guard against undefined nodes from faulty parsing

  switch (node.type) {
    case 'Template':
      if (!node.body) return '';
      const results = await Promise.all(node.body.map(child => evaluate(child, context)));
      return results.join('');

    case 'Literal':
      return node.value;

    case 'Variable': {
      const value = resolveVariable(node.name, context);
      // Per AC, if a variable is not found, the tag is left as-is.
      return value !== undefined ? String(value) : `<#${node.name}#>`;
    }

    case 'IndirectVariable': {
      // This logic is for a future story. For now, treat it as a literal.
      return `<##${node.name}##>`;
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
