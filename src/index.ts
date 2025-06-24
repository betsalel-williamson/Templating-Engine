import { parse } from '../lib/parser.js';
import { evaluate } from './evaluator.js';
import { AstNode, DataContext, DataContextValue } from './types.js';

async function main() {
  console.log('--- TypeScript Template Engine (Story 0 Demo) ---');

  const data: DataContext = new Map<string, DataContextValue>([
    ['name', 'Developer'],
    ['tool', 'RPL Engine'],
  ]);

  const templateString = "Hello, <#name#>. Welcome to the <#tool#>. This is a <#missing_variable#>.\n";
  console.log(`\nTemplate: ${templateString}`);

  try {
    const ast = parse(templateString, {}) as AstNode;
    const output = await evaluate(ast, data);
    console.log(`Output: ${output}`);
  } catch (e: unknown) {
    console.error('\n--- ERROR ---');
    if (e && typeof (e as any).format === 'function') {
        const errorSources = [{ source: 'templateString', text: templateString }];
        console.error((e as any).format(errorSources));
    } else {
        console.error(e);
    }
  }
}

main();
