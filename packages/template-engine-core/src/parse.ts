import { parse as parseLegacyImpl } from '../lib/parser.js';
import { parse as parseModernImpl } from '../lib/parser_new.js';
import type { AstNode } from './types.js';

export interface ParseOptions {
  enablePeggyTracing?: boolean;
  /** File path or label attached to parse errors (maps to Peggy `grammarSource`). */
  sourcePath?: string;
}

function toPeggyOptions(options?: ParseOptions) {
  if (!options) {
    return undefined;
  }

  return {
    enablePeggyTracing: options.enablePeggyTracing,
    grammarSource: options.sourcePath,
  };
}

export function parseLegacy(input: string, options?: ParseOptions): AstNode {
  return parseLegacyImpl(input, toPeggyOptions(options));
}

export function parseModern(input: string, options?: ParseOptions): AstNode {
  return parseModernImpl(input, toPeggyOptions(options));
}
