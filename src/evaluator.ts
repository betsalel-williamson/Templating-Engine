import {
  AstNode,
  DataContext,
  DataContextValue,
} from './types.js';

/**
 * Resolves a variable name to its final value, following a chain of references.
 * Detects and throws an error for circular references.
 * e.g., context { a: "b", b: "c", c: "Result" }, resolveVariable("a", context) -> "Result"
 */
function resolveVariable(name: string, context: DataContext): DataContextValue | undefined {
  let currentName = name;
  let currentValue = context.get(currentName);
  const visited = new Set<string>([currentName]);

  // Keep resolving as long as the current value is a string that is also a key in the context.
  while (typeof currentValue === 'string' && context.has(currentValue)) {
    currentName = currentValue;
    if (visited.has(currentName)) {
      // Cycle detected.
      throw new Error(`Circular variable reference detected: ${[...visited, currentName].join(' -> ')}`);
    }
    visited.add(currentName);
    currentValue = context.get(currentName);
  }

  // If the initial name was not in the context, currentValue will be undefined.
  // If the chain ended on a valid value, that value is returned.
  // If the chain ended because a key was not found (e.g., a -> b, but b is not a key),
  // this will return the value of the last valid key ('b' in this case).
  // The outer 'evaluate' function needs to handle this. Let's adjust.

  // Correct logic: The loop continues as long as we find valid keys.
  // If the loop terminates, `currentValue` holds the final value, which might be undefined.
  if (context.has(name)) {
      return currentValue;
  }
  return undefined;
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
      // The `resolveVariable` helper handles the recursive lookup and cycle detection.
      const value = resolveVariable(node.name, context);
      // If resolution results in an undefined value (e.g., not found, or chain breaks),
      // leave the original tag in place.
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
