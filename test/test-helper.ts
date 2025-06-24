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

// The factory now accepts the cloneFunctions flag, a parser choice, and a tracing flag.
export function createTestEvaluator(
  functions: FunctionRegistry = new Map(),
  cloneFunctions: boolean = false,
  parserType: 'legacy' | 'new' = 'legacy', // Default to legacy parser
  enableTracing: boolean = true // New flag for conditional logging
) {
  const secureEvaluate = createSecureEvaluator({ functions, cloneFunctions });

  return async (template: string, context: DataContext = new Map()) => {
    let parser;
    if (parserType === 'new') {
      parser = parseNew;
    } else {
      parser = parseLegacy;
    }

    // Pass the tracing flag to the parser options.
    const options = {
      tracer: fileTracer,
      enablePeggyTracing: enableTracing // This flag will control the new logging
    };

    const ast = parser(template, options) as AstNode;
    return secureEvaluate(ast, context);
  };
}
