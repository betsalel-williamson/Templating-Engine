import { beforeAll } from 'vitest';
import { createSecureEvaluator } from '../src/evaluator.js';
import { AstNode, DataContext, FunctionRegistry } from '../src/types.js';
import { fileTracer, clearTraceLog as doClear } from '../src/tracer.js';

// Import both parsers
import { parse as parseLegacy } from '../lib/parser.js';
import { parse as parseNew } from '../lib/parser_new.js';

beforeAll(() => {
  doClear();
});

// The factory now accepts the cloneFunctions flag and a parser choice.
export function createTestEvaluator(
  functions: FunctionRegistry = new Map(),
  cloneFunctions: boolean = false,
  parserType: 'legacy' | 'new' = 'legacy' // New parameter
) {
  const secureEvaluate = createSecureEvaluator({ functions, cloneFunctions });

  return async (template: string, context: DataContext = new Map()) => {
    let parser;
    if (parserType === 'new') {
      parser = parseNew;
    } else {
      parser = parseLegacy;
    }
    const ast = parser(template, { tracer: fileTracer }) as AstNode;
    return secureEvaluate(ast, context);
  };
}
