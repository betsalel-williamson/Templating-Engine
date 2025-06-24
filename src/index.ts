import { parse } from '../lib/parser.js';
import { evaluate } from './evaluator.js';
import { AstNode, DataContext, DataContextValue } from './types.js';

async function main() {
  console.log('--- TypeScript Template Engine (Story 1 Demo) ---');

  const data: DataContext = new Map<string, DataContextValue>([
    ['name', 'Developer'],
    // Recursive chain: active_host -> staging_host -> "staging.db.internal"
    ['active_host', 'staging_host'],
    ['staging_host', 'staging.db.internal'],
    // Circular reference: cycle1 -> cycle2 -> cycle1
    ['cycle1', 'cycle2'],
    ['cycle2', 'cycle1'],
  ]);

  const template1 = "Connecting to DB host: <#active_host#>";
  console.log(`\nTemplate: "${template1}"`);
  try {
    const ast = parse(template1, {}) as AstNode;
    const output = await evaluate(ast, data);
    console.log(`Output:   "${output}"`);
  } catch (e) {
    console.error(e);
  }

  const template2 = "Testing circular reference: <#cycle1#>";
  console.log(`\nTemplate: "${template2}"`);
  try {
    const ast = parse(template2, {}) as AstNode;
    await evaluate(ast, data);
  } catch (e) {
    console.log(`Output:   Successfully caught expected error: ${(e as Error).message}`);
  }
}

main();
