import { describe, it, expect } from 'vitest';
import { DataContext } from '../../src/types.js';
import { createTestEvaluator } from '../test-helper.js';

describe('New Syntax: Output and Literal Boundary Contracts', () => {
  const evaluate = createTestEvaluator(new Map(), false, 'new', false);

  describe('empty and minimal templates', () => {
    it('should evaluate an empty template to empty string', async () => {
      expect(await evaluate('')).toBe('');
    });

    it('should evaluate whitespace-only template to the whitespace', async () => {
      expect(await evaluate('   \n\t  ')).toBe('   \n\t  ');
    });

    it('should evaluate a for loop with an empty body to empty string', async () => {
      const context: DataContext = new Map([['items', [new Map([['a', '1']])]]]);
      expect(await evaluate('{% for item in items %}{% endfor %}', context)).toBe('');
    });
  });

  describe('output type boundaries', () => {
    it('should render empty string for array values in output tags', async () => {
      const context: DataContext = new Map([['items', [1, 2, 3]]]);
      expect(await evaluate('{{ items }}', context)).toBe('');
    });

    it('should render empty string for map values in output tags', async () => {
      const context: DataContext = new Map([['user', new Map([['name', 'Ada']])]]);
      expect(await evaluate('{{ user }}', context)).toBe('');
    });

    it('should stringify numeric values in output tags', async () => {
      const context: DataContext = new Map([['count', 42]]);
      expect(await evaluate('{{ count }}', context)).toBe('42');
    });

    it('should leave the raw tag for missing top-level identifiers', async () => {
      expect(await evaluate('{{ missing }}')).toBe('{{ missing }}');
    });

    it('should render empty string for missing property paths', async () => {
      const context: DataContext = new Map([['user', new Map([['name', 'Ada']])]]);
      expect(await evaluate('{{ user.address.city }}', context)).toBe('');
    });

    it('should render empty string when traversing through a non-map intermediate', async () => {
      const context: DataContext = new Map([['label', 'plain-text']]);
      expect(await evaluate('{{ label.length }}', context)).toBe('');
    });
  });

  describe('literal and delimiter boundaries', () => {
    it('should preserve literal text between adjacent tags without extra separators', async () => {
      const context: DataContext = new Map([
        ['a', '1'],
        ['b', '2'],
      ]);
      expect(await evaluate('{{ a }},{{ b }}', context)).toBe('1,2');
    });

    it('should keep single-brace sequences in literal text', async () => {
      expect(await evaluate('{ not a template tag }')).toBe('{ not a template tag }');
    });
  });
});
