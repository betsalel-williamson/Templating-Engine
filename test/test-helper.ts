import { createSecureEvaluator } from '../src/evaluator.js';
import { AstNode, DataContext, FunctionRegistry } from '../src/types.js';

// Import both parsers
import { parse as parseLegacy } from '../lib/parser.js';
import { parse as parseNew } from '../lib/parser_new.js';

// The factory now only accepts the cloneFunctions flag and a parser choice.
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

    // The options object is now empty as tracing is removed.
    const options = {
      enablePeggyTracing: enableTracing
    };

    const ast = parser(template, options) as AstNode;
    return secureEvaluate(ast, context);
  };
}
