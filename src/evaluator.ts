import {
  AstNode,
  DataContext,
  DataContextValue,
} from './types.js';

function resolveVariable(name: string, context: DataContext): DataContextValue | undefined {
  let currentValue = context.get(name);
  let currentName = name;
  const visited = new Set<string>([currentName]);

  // FIX: Loop to resolve recursive variables (e.g., var1 -> var2 -> value).
  while (typeof currentValue === 'string' && context.has(currentValue)) {
    currentName = currentValue;
    if (visited.has(currentName)) {
      throw new Error(`Circular variable reference detected: ${currentName}`);
    }
    visited.add(currentName);
    currentValue = context.get(currentName);
  }
  return currentValue;
}

// FIX: A separate function to resolve indirect array names without full evaluation.
function resolveArrayName(node: { type: 'Variable', name: string } | string, context: DataContext): string {
    if (typeof node === 'string') {
        return node;
    }
    const resolved = resolveVariable(node.name, context);
    return String(resolved);
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
      return value !== undefined ? String(value) : `<#${node.name}#>`;
    }

    case 'IndirectVariable': {
      let currentName = node.name;
      let value: DataContextValue | undefined;
      const visited = new Set<string>();

      while(true) {
        if (visited.has(currentName)) {
            throw new Error(`Circular indirect reference detected: ${node.name}`);
        }
        visited.add(currentName);
        value = resolveVariable(currentName, context);
        if (typeof value === 'string' && context.has(value)) {
          currentName = value;
        } else {
          break;
        }
      }
      return value !== undefined ? String(value) : `<##${node.name}##>`;
    }

    case 'Array': {
        throw new Error(`Invalid AST: Encountered a standalone ArrayNode.`);
    }

    case 'CrossProduct': {
      const arrayName = resolveArrayName(node.iterator.name, context);
      const list = resolveVariable(arrayName, context);

      if (!Array.isArray(list)) {
        console.warn(`Warning: Cross-product target '${arrayName}' is not an array.`);
        return '';
      }

      const outputs: string[] = [];
      for (const item of list) {
        const subContext = new Map(context);
        if (item instanceof Map) {
          for (const [key, val] of item.entries()) {
            subContext.set(key, val);
          }
        } else {
          subContext.set('item', item);
        }
        outputs.push(await evaluate(node.template, subContext));
      }
      return outputs.join('');
    }

    case 'Conditional': {
        const conditionResult = await evaluate(node.condition, context);
        const isTrue = conditionResult !== '0' && conditionResult !== '';
        return isTrue
            ? await evaluate(node.trueBranch, context)
            : await evaluate(node.falseBranch, context);
    }

    default:
      const exhaustiveCheck: never = node;
      throw new Error(`Unhandled AST node type: ${(exhaustiveCheck as any)?.type}`);
  }
}
