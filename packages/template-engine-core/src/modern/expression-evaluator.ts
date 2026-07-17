import { DataContext, DataContextValue, ExpressionNode, IfConditionNode } from '../types.js';
import { createDefaultFilterRegistry } from '../filters/registry.js';
import { createTemplateEvaluationError } from '../errors/template-evaluation-error.js';

export interface ExpressionEvaluatorConfig {
  resolveAliases?: boolean;
}

function resolveAliasChain(
  context: DataContext,
  startKey: string,
  visited: Set<string> = new Set()
): DataContextValue | undefined {
  let currentKey = startKey;

  while (true) {
    if (visited.has(currentKey)) {
      throw new Error(
        `Circular alias reference detected: ${[...Array.from(visited), currentKey].join(' -> ')}`
      );
    }
    visited.add(currentKey);

    const value = context.get(currentKey);
    if (value === undefined) {
      return undefined;
    }

    if (typeof value === 'string' && value.length > 0 && context.has(value)) {
      const nextValue = context.get(value);
      if (typeof nextValue === 'string') {
        currentKey = value;
        continue;
      }
    }

    return value;
  }
}

function resolvePropertyPath(
  context: DataContext,
  path: string[],
  resolveAliases: boolean
): DataContextValue | undefined {
  if (path.length === 0) return undefined;

  let current: DataContextValue | undefined;
  if (resolveAliases && path.length === 1) {
    current = resolveAliasChain(context, path[0]);
  } else {
    current = context.get(path[0]);
  }

  for (let i = 1; i < path.length; i++) {
    if (!(current instanceof Map)) {
      return undefined;
    }
    current = current.get(path[i]);
  }

  return current;
}

export async function evaluateExpression(
  expression: ExpressionNode,
  context: DataContext,
  config: ExpressionEvaluatorConfig = {}
): Promise<DataContextValue> {
  const resolveAliases = config.resolveAliases ?? false;

  switch (expression.type) {
    case 'Identifier': {
      if (resolveAliases) {
        return resolveAliasChain(context, expression.name);
      }
      return context.get(expression.name);
    }
    case 'PropertyAccess':
      return resolvePropertyPath(context, expression.path, resolveAliases);
    case 'BracketLookup': {
      const keyValue = await evaluateExpression(expression.key, context, {
        ...config,
        resolveAliases: false,
      });
      if (keyValue === undefined) return undefined;
      return context.get(String(keyValue));
    }
    case 'Concat': {
      const parts = await Promise.all(
        expression.parts.map((part) => evaluateExpression(part, context, config))
      );
      return parts.map((part) => (part === undefined ? '' : String(part))).join('');
    }
    case 'StringLiteral':
      return expression.value;
    case 'FilterPipeline': {
      let value = await evaluateExpression(expression.input, context, config);
      const registry = createDefaultFilterRegistry();
      for (const filter of expression.filters) {
        const filterFn = registry.get(filter.name);
        if (!filterFn) {
          throw createTemplateEvaluationError(`Unknown filter: "${filter.name}"`, filter.location);
        }
        const args = await Promise.all(
          filter.args.map((arg) => evaluateExpression(arg, context, config))
        );
        value = filterFn(value, context, ...args.map((arg) => String(arg ?? '')));
      }
      return value;
    }
    default: {
      const exhaustiveCheck: never = expression;
      throw new Error(`Unhandled expression type: ${(exhaustiveCheck as ExpressionNode).type}`);
    }
  }
}

export async function evaluateIfCondition(
  condition: IfConditionNode,
  context: DataContext,
  config: ExpressionEvaluatorConfig = {}
): Promise<boolean> {
  if (condition.type === 'NotCondition') {
    return !(await evaluateIfCondition(condition.operand, context, config));
  }

  const value = await evaluateExpression(condition.expression, context, config);
  return isTruthy(value);
}

export function isTruthy(value: DataContextValue | undefined): boolean {
  if (value === undefined || value === null) return false;
  if (value === '' || value === '0' || value === 0) return false;
  return true;
}

export function stringifyExpressionValue(value: DataContextValue | undefined): string {
  if (value === undefined) return '';
  if (value instanceof Map || Array.isArray(value)) return '';
  return String(value);
}
