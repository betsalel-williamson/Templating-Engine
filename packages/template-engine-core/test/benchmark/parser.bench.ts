import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { bench, describe } from 'vitest';
import { parse as parseModern } from '../../lib/parser_new.js';

const recipesDir = join(import.meta.dirname, '../../recipes');

function readRecipe(name: string): string {
  return readFileSync(join(recipesDir, name), 'utf8');
}

const recipe01 = readRecipe('01-dynamic-sql-generation.v2.template');
const recipe04 = readRecipe('04-paginated-ui-component.v2.template');
const textHeavy = (() => {
  const literalPerSegment = Math.floor(50_000 / 21);
  const segments = [];
  for (let i = 0; i < 20; i++) {
    segments.push('x'.repeat(literalPerSegment));
    segments.push(`{{ item_${i}.name }}`);
  }
  segments.push('x'.repeat(literalPerSegment));
  return segments.join('');
})();
const tagHeavy = Array.from({ length: 500 }, (_, i) => `{{ item_${i}.name }}`).join(' ');

describe('grammar_new parser', () => {
  bench('recipe 01 dynamic SQL', () => {
    parseModern(recipe01);
  });

  bench('recipe 04 paginated UI', () => {
    parseModern(recipe04);
  });

  bench('text-heavy 50KB literal', () => {
    parseModern(textHeavy);
  });

  bench('tag-heavy 500 expressions', () => {
    parseModern(tagHeavy);
  });

  bench('simple property access', () => {
    parseModern('{{ user.address.city }}');
  });
});
