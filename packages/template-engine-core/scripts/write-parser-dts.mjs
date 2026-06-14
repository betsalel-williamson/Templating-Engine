import { writeFileSync } from 'node:fs';
const dts = `import type { AstNode } from '../src/types.js';
export function parse(
  input: string,
  options?: { enablePeggyTracing?: boolean }
): AstNode;
`;
writeFileSync('lib/parser.d.ts', dts);
writeFileSync('lib/parser_new.d.ts', dts);
