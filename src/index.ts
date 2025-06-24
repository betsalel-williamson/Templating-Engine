import { parse } from '../lib/parser.js';
import { createSecureEvaluator } from './evaluator.js';
import { AstNode, DataContext, DataContextValue, FunctionRegistry } from './types.js';

async function main() {
  console.log('--- TypeScript Template Engine Demo ---');

  // 1. Define a registry of trusted, safe functions during application startup.
  const functions: FunctionRegistry = new Map([
    ['toUpperCase', async (str: string) => str.toUpperCase()],
    ['add', async (a: string, b: string) => String(Number(a) + Number(b))],
  ]);

  // 2. Create the secure evaluator instance.
  // The function registry is now privately copied and cannot be mutated at runtime.
  const secureEvaluate = createSecureEvaluator({ functions });

  // 3. Define a data context for a specific evaluation run.
  const data: DataContext = new Map<string, DataContextValue>([
    ['template_var', 'This template contains another variable: <#inner_var#>'],
    ['inner_var', 'Success!'],
    ['user', 'Alice'],
    ['num', '5'],
  ]);

  // 4. Helper function to run and display examples.
  const runExample = async (title: string, template: string) => {
    console.log(`\n--- ${title} ---`);
    console.log(`Template: "${template}"`);
    try {
      const ast = parse(template) as AstNode;
      // Use the secure evaluator instance created earlier.
      const output = await secureEvaluate(ast, data);
      console.log(`Output:   "${output}"`);
    } catch (e) {
      console.log(`Output:   Caught expected error: ${(e as Error).message}`);
    }
  };

  // 5. Run examples demonstrating various features.
  await runExample(
    'Standard Variable Replacement',
    'Standard expansion: <#template_var#>'
  );

  await runExample(
    'Function Call with Variable',
    'Function call with variable: <{toUpperCase(<#user#>)}>'
  );

  await runExample(
    'Function Call with Mixed Arguments',
    'Mixed arguments: <{add(<#num#>, 10)}>'
  );

  await runExample(
    'Unregistered Function (Error Case)',
    'This will fail: <{nonExistentFunc()}>'
  );
}

main();
