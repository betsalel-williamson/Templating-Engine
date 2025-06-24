import { parse } from '../lib/parser.js';
import { evaluate } from './evaluator.js';
import { AstNode, DataContext, DataContextValue } from './types.js';

async function main() {
  console.log('--- TypeScript Template Engine ---');

  const data: DataContext = new Map<string, DataContextValue>([
    ['var3', 'there'],
    ['isTrue', '1'],
    ['values', [
        new Map([['var1', 'value1']]),
        new Map([['var1', 'value2']]),
        new Map([['var1', 'value3']]),
    ]],
    ['recursive1', 'recursive2'],
    ['recursive2', 'Recursive Value'],
  ]);

  const templateString = "Hi <#var3#>. <~<#var1#> ~><*><[values]>~> -> Conditional: <+TRUE<->FALSE<?<#isTrue#>?>>";
  console.log(`\nTemplate: ${templateString}`);

  try {
    const ast = parse(templateString, {}) as AstNode;
    const output = await evaluate(ast, data);
    console.log(`\nOutput: ${output}\n`);
  } catch (e: unknown) {
    console.error('\n--- ERROR ---');
    // Robustly check for the format method before calling it.
    if (e && typeof (e as any).format === 'function') {
        const errorSources = [{ source: 'templateString', text: templateString }];
        console.error((e as any).format(errorSources));
    } else {
        console.error(e);
    }
  }
}

main();
