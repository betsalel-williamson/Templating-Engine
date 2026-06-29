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
