import { DataContext, DataContextValue } from '../types.js';
import { Filter, FilterRegistry } from './types.js';

function asArray(value: DataContextValue): DataContextValue[] {
  return Array.isArray(value) ? value : [];
}

function asMap(value: DataContextValue): DataContext | undefined {
  return value instanceof Map ? value : undefined;
}

function parseSliceArgs(
  args: string[],
  context: DataContext
): { offset: number; limit: number | undefined } {
  const resolveArg = (arg: string): number => {
    const fromContext = context.get(arg);
    if (typeof fromContext === 'number') return fromContext;
    if (typeof fromContext === 'string') return parseInt(fromContext, 10);
    return parseInt(arg, 10);
  };

  if (args.length === 1) {
    const limit = resolveArg(args[0]);
    return { offset: 1, limit: isNaN(limit) ? undefined : limit };
  }

  const offset = resolveArg(args[0]);
  const limit = args[1] ? resolveArg(args[1]) : undefined;
  return {
    offset: isNaN(offset) || offset < 1 ? 1 : offset,
    limit: limit !== undefined && !isNaN(limit) ? limit : undefined,
  };
}

export function createDefaultFilterRegistry(): FilterRegistry {
  const registry: FilterRegistry = new Map();

  registry.set('length', (input) => {
    if (Array.isArray(input)) return input.length;
    if (typeof input === 'string') return input.length;
    return 0;
  });

  registry.set('join', (input, _context, delimiter = ', ') => {
    const items = asArray(input);
    return items
      .map((item) => {
        if (item instanceof Map) return '';
        return String(item ?? '');
      })
      .join(delimiter);
  });

  registry.set('map', (input, _context, propertyName) => {
    const items = asArray(input);
    return items.map((item) => {
      const map = asMap(item);
      if (!map || !propertyName) return undefined;
      return map.get(propertyName);
    });
  });

  registry.set('slice', (input, context, ...args) => {
    const items = asArray(input);
    const { offset, limit } = parseSliceArgs(args, context);
    const startIndex = offset - 1;
    const endIndex =
      limit !== undefined ? Math.min(items.length, startIndex + limit) : items.length;
    return items.slice(startIndex, endIndex);
  });

  return registry;
}

export type { Filter, FilterRegistry };
