import { beforeAll } from 'vitest';
import { createSecureEvaluator } from '../src/evaluator.js';
import { parse } from '../lib/parser.js';
import { AstNode, DataContext, FunctionRegistry } from '../src/types.js';
import { fileTracer, clearTraceLog as doClear } from '../src/tracer.js';

beforeAll(() => {
  doClear();
});

// The factory now accepts the cloneFunctions flag to pass to the evaluator.
export function createTestEvaluator(
  functions: FunctionRegistry = new Map(),
  cloneFunctions: boolean = false
) {
  const secureEvaluate = createSecureEvaluator({ functions, cloneFunctions });

  return async (template: string, context: DataContext = new Map()) => {
    const ast = parse(template, { tracer: fileTracer }) as AstNode;
    return secureEvaluate(ast, context);
  };
}
