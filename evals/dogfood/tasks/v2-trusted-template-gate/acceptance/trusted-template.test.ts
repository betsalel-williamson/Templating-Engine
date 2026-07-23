import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

async function loadCore() {
  const root = process.env.DOGFOOD_WORKTREE;
  if (!root) throw new Error('DOGFOOD_WORKTREE is required');
  const entry = pathToFileURL(path.join(root, 'packages/template-engine-core/dist/index.js')).href;
  return import(entry);
}

describe('TrustedTemplate gate', () => {
  it('exports TrustedTemplate', async () => {
    const core = await loadCore();
    expect(core.TrustedTemplate).toBeTypeOf('function');
  });

  it('does not re-parse plain context strings that contain mustache tags', async () => {
    const { createSecureEvaluator, parseModern, TrustedTemplate } = await loadCore();
    void TrustedTemplate; // must exist; plain Map values stay data
    const evaluate = createSecureEvaluator({
      functions: new Map(),
      parseTemplate: parseModern,
      resolveAliases: true,
    });
    const ast = parseModern('X{{payload}}Y');
    const context = new Map([['payload', 'Hello {{name}}']]);
    context.set('name', 'World');
    const result = await evaluate(ast, context);
    // Plain string data must NOT expand inner {{name}}
    expect(result).toBe('XHello {{name}}Y');
  });

  it('expands TrustedTemplate values as nested template fragments', async () => {
    const { createSecureEvaluator, parseModern, TrustedTemplate } = await loadCore();
    const evaluate = createSecureEvaluator({
      functions: new Map(),
      parseTemplate: parseModern,
      resolveAliases: true,
    });
    const ast = parseModern('X{{payload}}Y');
    const context = new Map([
      ['payload', new TrustedTemplate('Hello {{name}}')],
      ['name', 'World'],
    ]);
    const result = await evaluate(ast, context);
    expect(result).toBe('XHello WorldY');
  });
});
