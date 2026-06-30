import { describe, it, expect } from 'vitest';
import { DataContext } from '../../src/types.js';
import { createTestEvaluator } from '../test-helper.js';

describe('New Syntax: Basic Iteration ({% for ... %})', () => {
  const evaluate = createTestEvaluator(new Map(), false, 'new', false);

  const numbersContext: DataContext = new Map([
    [
      'numbers',
      [new Map([['value', 'one']]), new Map([['value', 'two']]), new Map([['value', 'three']])],
    ],
  ]);

  describe('basic iteration', () => {
    it('should iterate over an array and render each item', async () => {
      const template = '{% for item in numbers %}{{ item.value }}{% endfor %}';
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('onetwothree');
    });

    it('should expose loop metadata variables', async () => {
      const template = '{% for item in numbers %}{{ loop.index0 }}:{{ item.value }};{% endfor %}';
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('0:one;1:two;2:three;');
    });

    it('should render literal text between iterations', async () => {
      const template = '{% for item in numbers %}[{{ item.value }}]{% endfor %}';
      const result = await evaluate(template, numbersContext);
      expect(result).toBe('[one][two][three]');
    });
  });

  describe('boundary cases', () => {
    it('should produce empty output for an empty array', async () => {
      const context: DataContext = new Map([['empty', []]]);
      const result = await evaluate('{% for item in empty %}{{ item }}{% endfor %}', context);
      expect(result).toBe('');
    });

    it('should produce empty output when the array key is missing', async () => {
      const result = await evaluate('{% for item in missing %}{{ item }}{% endfor %}');
      expect(result).toBe('');
    });

    it('should handle a single-item array', async () => {
      const context: DataContext = new Map([['items', [new Map([['name', 'only']])]]]);
      const result = await evaluate('{% for item in items %}{{ item.name }}{% endfor %}', context);
      expect(result).toBe('only');
    });
  });

  describe('out-of-bounds access', () => {
    const itemsContext: DataContext = new Map([
      ['items', [new Map([['n', '1']]), new Map([['n', '2']]), new Map([['n', '3']])]],
    ]);

    it('should render empty string when a loop item property is missing', async () => {
      const template = '{% for item in items %}{{ item.missing }}|{% endfor %}';
      expect(await evaluate(template, itemsContext)).toBe('|||');
    });

    it('should render empty string when a nested property path is missing on loop items', async () => {
      const template = '{% for item in items %}{{ item.address.city }}|{% endfor %}';
      expect(await evaluate(template, itemsContext)).toBe('|||');
    });

    it('should render empty string when an inner loop collection is missing on the item', async () => {
      const context: DataContext = new Map([
        ['rows', [new Map([['cells', [new Map([['v', 'a']])]]]), new Map([['label', 'no-cells']])]],
      ]);
      const template =
        '{% for row in rows %}{% for cell in row.cells %}{{ cell.v }}{% endfor %};{% endfor %}';
      expect(await evaluate(template, context)).toBe('a;;');
    });

    it('should render empty string when an inner loop collection is an empty array', async () => {
      const context: DataContext = new Map([
        ['rows', [new Map([['cells', []]]), new Map([['cells', [new Map([['v', 'b']])]]])]],
      ]);
      const template =
        '{% for row in rows %}{% for cell in row.cells %}{{ cell.v }}{% endfor %};{% endfor %}';
      expect(await evaluate(template, context)).toBe(';b;');
    });

    it('should produce empty output when slice offset is beyond array length', async () => {
      const context: DataContext = new Map([['highOffset', 10], ['takeOne', 1], ...itemsContext]);
      const template =
        '{% for item in items | slice(highOffset, takeOne) %}{{ item.n }}{% endfor %}';
      expect(await evaluate(template, context)).toBe('');
    });

    it('should clamp slice limit to remaining elements instead of failing', async () => {
      const context: DataContext = new Map([
        ['startOffset', 2],
        ['largeLimit', 100],
        ...itemsContext,
      ]);
      const template =
        '{% for item in items | slice(startOffset, largeLimit) %}{{ item.n }}{% endfor %}';
      expect(await evaluate(template, context)).toBe('23');
    });

    it('should produce empty output when slice limit is zero', async () => {
      const context: DataContext = new Map([['startOffset', 1], ['zeroLimit', 0], ...itemsContext]);
      const template =
        '{% for item in items | slice(startOffset, zeroLimit) %}{{ item.n }}{% endfor %}';
      expect(await evaluate(template, context)).toBe('');
    });

    it('should mark loop.first and loop.last on the only item in a single-element array', async () => {
      const context: DataContext = new Map([['items', [new Map([['n', '1']])]]]);
      const template =
        '{% for item in items %}{{ loop.first }}-{{ loop.last }}-{{ item.n }}{% endfor %}';
      expect(await evaluate(template, context)).toBe('1-1-1');
    });
  });

  describe('stress cases', () => {
    it('should iterate over a large array', async () => {
      const size = 100;
      const items = Array.from({ length: size }, (_, i) => new Map([['n', String(i)]]));
      const context: DataContext = new Map([['items', items]]);
      const result = await evaluate('{% for item in items %}{{ item.n }}{% endfor %}', context);
      expect(result).toBe(Array.from({ length: size }, (_, i) => String(i)).join(''));
    });

    it('should support nested loops', async () => {
      const context: DataContext = new Map([
        [
          'rows',
          [
            new Map([['cells', [new Map([['v', 'a']]), new Map([['v', 'b']])]]]),
            new Map([['cells', [new Map([['v', 'c']])]]]),
          ],
        ],
      ]);
      const template =
        '{% for row in rows %}{% for cell in row.cells %}{{ cell.v }}{% endfor %};{% endfor %}';
      const result = await evaluate(template, context);
      expect(result).toBe('ab;c;');
    });
  });
});
