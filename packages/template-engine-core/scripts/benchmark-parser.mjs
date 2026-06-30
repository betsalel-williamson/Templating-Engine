/**
 * Parser benchmark harness for grammar_new.peggy (and legacy comparison).
 *
 * Usage:
 *   node scripts/benchmark-parser.mjs
 *   node scripts/benchmark-parser.mjs --json
 *   node --expose-gc scripts/benchmark-parser.mjs
 *
 * Run from packages/template-engine-core after `pnpm run build:parsers`.
 */
import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parse as parseModern } from '../lib/parser_new.js';
import { parse as parseLegacy } from '../lib/parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const recipesDir = join(__dirname, '../recipes');

const WARMUP_ITERATIONS = 50;
const MEASURE_ITERATIONS = 500;
const MEMORY_ITERATIONS = 200;

function readRecipe(name) {
  return readFileSync(join(recipesDir, name), 'utf8');
}

function buildTextHeavyTemplate(totalLiteralChars, tagCount) {
  const literalPerSegment = Math.floor(totalLiteralChars / (tagCount + 1));
  const segments = [];
  for (let i = 0; i < tagCount; i++) {
    segments.push('x'.repeat(literalPerSegment));
    segments.push(`{{ item_${i}.name }}`);
  }
  segments.push('x'.repeat(literalPerSegment));
  return segments.join('');
}

function buildTagHeavyTemplate(tagCount) {
  return Array.from({ length: tagCount }, (_, i) => `{{ item_${i}.name }}`).join(' ');
}

function buildNestedForTemplate(rowCount, colCount) {
  const columns = Array.from({ length: colCount }, (_, i) => `col_${i}`).join(', ');
  const rows = Array.from({ length: rowCount }, (_, row) => {
    const cells = Array.from({ length: colCount }, (_, col) => `'${row}_${col}'`).join(', ');
    return `  (${cells})`;
  }).join(',\n');
  return `INSERT INTO users (${columns})\nVALUES\n${rows};`;
}

function countAstNodes(node) {
  if (node == null || typeof node !== 'object') {
    return 0;
  }
  let count = 1;
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        count += countAstNodes(entry);
      }
    } else if (value && typeof value === 'object') {
      count += countAstNodes(value);
    }
  }
  return count;
}

function timeParse(parseFn, input, iterations) {
  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    parseFn(input);
  }

  const start = performance.now();
  let lastResult;
  for (let i = 0; i < iterations; i++) {
    lastResult = parseFn(input);
  }
  const elapsedMs = performance.now() - start;

  return {
    iterations,
    totalMs: elapsedMs,
    msPerParse: elapsedMs / iterations,
    parsesPerSecond: iterations / (elapsedMs / 1000),
    astNodes: countAstNodes(lastResult),
  };
}

function measureHeapDelta(parseFn, input, iterations) {
  if (typeof globalThis.gc !== 'function') {
    return { heapDeltaBytesPerParse: null, note: 'Run with --expose-gc for heap measurements' };
  }

  globalThis.gc();
  const before = process.memoryUsage().heapUsed;
  for (let i = 0; i < iterations; i++) {
    parseFn(input);
  }
  globalThis.gc();
  const after = process.memoryUsage().heapUsed;

  return {
    heapDeltaBytesPerParse: (after - before) / iterations,
    note: null,
  };
}

const fixtures = [
  {
    id: 'recipe-01-v2',
    parser: 'modern',
    description: 'Dynamic SQL generation (nested for/if)',
    input: readRecipe('01-dynamic-sql-generation.v2.template'),
  },
  {
    id: 'recipe-02-v2',
    parser: 'modern',
    description: 'Multi-environment config',
    input: readRecipe('02-multi-env-config.v2.template'),
  },
  {
    id: 'recipe-03-v2',
    parser: 'modern',
    description: 'Generic reporting with for loop',
    input: readRecipe('03-generic-reporting.v2.template'),
  },
  {
    id: 'recipe-04-v2',
    parser: 'modern',
    description: 'Paginated UI component',
    input: readRecipe('04-paginated-ui-component.v2.template'),
  },
  {
    id: 'expr-simple',
    parser: 'modern',
    description: 'Single output expression',
    input: '{{ user.address.city }}',
  },
  {
    id: 'expr-filter-pipeline',
    parser: 'modern',
    description: 'Filter pipeline expression',
    input: '{{ items | map("name") | join(", ") }}',
  },
  {
    id: 'text-heavy',
    parser: 'modern',
    description: '50 KB literal text with 20 tags',
    input: buildTextHeavyTemplate(50_000, 20),
  },
  {
    id: 'tag-heavy',
    parser: 'modern',
    description: '500 consecutive output tags',
    input: buildTagHeavyTemplate(500),
  },
  {
    id: 'nested-for-stress',
    parser: 'modern',
    description: 'Large static SQL (no tags, parse-as-literal)',
    input: buildNestedForTemplate(200, 8),
  },
  {
    id: 'legacy-recipe-01',
    parser: 'legacy',
    description: 'Legacy dynamic SQL recipe (baseline comparison)',
    input: readRecipe('01-dynamic-sql-generation.template'),
  },
];

const parsers = {
  modern: parseModern,
  legacy: parseLegacy,
};

const results = {
  generatedAt: new Date().toISOString(),
  nodeVersion: process.version,
  warmupIterations: WARMUP_ITERATIONS,
  measureIterations: MEASURE_ITERATIONS,
  memoryIterations: MEMORY_ITERATIONS,
  fixtures: [],
};

for (const fixture of fixtures) {
  const parseFn = parsers[fixture.parser];
  const timing = timeParse(parseFn, fixture.input, MEASURE_ITERATIONS);
  const memory = measureHeapDelta(parseFn, fixture.input, MEMORY_ITERATIONS);

  results.fixtures.push({
    id: fixture.id,
    parser: fixture.parser,
    description: fixture.description,
    inputBytes: Buffer.byteLength(fixture.input, 'utf8'),
    ...timing,
    ...memory,
  });
}

const jsonOutput = process.argv.includes('--json');
if (jsonOutput) {
  console.log(JSON.stringify(results, null, 2));
} else {
  console.log('Parser benchmark (grammar_new.peggy focus)\n');
  console.log(
    `Node ${results.nodeVersion} | warmup=${WARMUP_ITERATIONS} measure=${MEASURE_ITERATIONS}\n`
  );
  console.log(
    `${'Fixture'.padEnd(22)} ${'Parser'.padEnd(8)} ${'KB'.padStart(6)} ${'µs/parse'.padStart(10)} ${'parse/s'.padStart(12)} ${'AST nodes'.padStart(10)}`
  );
  console.log('-'.repeat(78));
  for (const row of results.fixtures) {
    const kb = (row.inputBytes / 1024).toFixed(1);
    const micros = (row.msPerParse * 1000).toFixed(2);
    const rate = Math.round(row.parsesPerSecond).toLocaleString();
    console.log(
      `${row.id.padEnd(22)} ${row.parser.padEnd(8)} ${kb.padStart(6)} ${micros.padStart(10)} ${rate.padStart(12)} ${String(row.astNodes).padStart(10)}`
    );
  }
  const heapNote = results.fixtures.find((f) => f.note)?.note;
  if (heapNote) {
    console.log(`\n${heapNote}`);
  }
}
