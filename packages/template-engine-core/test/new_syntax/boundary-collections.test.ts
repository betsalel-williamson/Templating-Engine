import { describe, it, expect } from 'vitest';
import { DataContext } from '../../src/types.js';
import { createTestEvaluator } from '../test-helper.js';

describe('New Syntax: Collection and Filter Boundary Contracts', () => {
  const evaluate = createTestEvaluator(new Map(), false, 'new', false);

  it('should produce empty output when iterating a string collection', async () => {
    const context: DataContext = new Map([['name', 'abc']]);
    expect(await evaluate('{% for ch in name %}{{ ch }}{% endfor %}', context)).toBe('');
  });

  it('should produce empty output when iterating a map collection', async () => {
    const context: DataContext = new Map([['data', new Map([['k', 'v']])]]);
    expect(await evaluate('{% for entry in data %}{{ entry }}{% endfor %}', context)).toBe('');
  });

  it('should iterate scalar values in an array', async () => {
    const context: DataContext = new Map([['tags', ['a', 'b', 'c']]]);
    expect(await evaluate('{% for tag in tags %}{{ tag }}{% endfor %}', context)).toBe('abc');
  });

  it('should produce empty output when slice offset is beyond array length', async () => {
    const context: DataContext = new Map([
      ['highOffset', 99],
      ['takeOne', 1],
      ['items', [new Map([['n', '1']]), new Map([['n', '2']])]],
    ]);
    const template = '{% for item in items | slice(highOffset, takeOne) %}{{ item.n }}{% endfor %}';
    expect(await evaluate(template, context)).toBe('');
  });

  it('should return empty string when joining a non-array through the join filter', async () => {
    const context: DataContext = new Map([['label', 'not-an-array']]);
    expect(await evaluate(`{{ label | join(', ') }}`, context)).toBe('');
  });

  it('should return zero when length filter receives undefined input', async () => {
    expect(await evaluate('{{ missing | length }}')).toBe('0');
  });

  it('should return string length when length filter receives a string', async () => {
    const context: DataContext = new Map([['name', 'hello']]);
    expect(await evaluate('{{ name | length }}', context)).toBe('5');
  });

  it('should return empty array from map filter on non-array input', async () => {
    const context: DataContext = new Map([['label', 'text']]);
    expect(await evaluate(`{{ label | map('name') | join(',') }}`, context)).toBe('');
  });
});
