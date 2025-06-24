import { parse } from '../lib/parser.js';
import { evaluate } from './evaluator.js';
import { AstNode, DataContext, DataContextValue } from './types.js';

async function main() {
  console.log('--- TypeScript Template Engine (Story 2 Demo) ---');

  const data: DataContext = new Map<string, DataContextValue>([
    // For standard variable test
    ['template_var', 'This template contains another variable: <#inner_var#>'],
    ['inner_var', 'Success!'],

    // For indirect variable test
    ['indirect_start', 'indirect_middle'],
    ['indirect_middle', 'indirect_end'],
    ['indirect_end', 'Final indirect value'],

    // For indirect circular reference test
    ['cycle_a', 'cycle_b'],
    ['cycle_b', 'cycle_a'],
  ]);

  const template1 = "Standard variable expansion: <#template_var#>";
  console.log(`\nTemplate: "${template1}"`);
  try {
    const ast = parse(template1, {}) as AstNode;
    const output = await evaluate(ast, data);
    console.log(`Output:   "${output}"`);
  } catch (e) {
    console.error(e);
  }

  const template2 = "Indirect variable expansion: <##indirect_start##>";
  console.log(`\nTemplate: "${template2}"`);
  try {
    const ast = parse(template2, {}) as AstNode;
    const output = await evaluate(ast, data);
    console.log(`Output:   "${output}"`);
  } catch (e) {
    console.error(e);
  }

  const template3 = "Testing indirect circular reference: <##cycle_a##>";
  console.log(`\nTemplate: "${template3}"`);
  try {
    const ast = parse(template3, {}) as AstNode;
    await evaluate(ast, data);
  } catch (e) {
    console.log(`Output:   Successfully caught expected error: ${(e as Error).message}`);
  }
}

main();
