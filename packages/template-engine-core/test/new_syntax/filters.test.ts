import { describe, it, expect } from 'vitest';
import { DataContext } from '../../src/types.js';
import { createTestEvaluator } from '../test-helper.js';

describe('New Syntax: Filter Pipeline and Join', () => {
  const evaluate = createTestEvaluator(new Map(), false, 'new', false);

  const usersContext: DataContext = new Map([
    [
      'users',
      [
        new Map([
          ['name', 'Alice'],
          ['roles', 'admin'],
        ]),
        new Map([
          ['name', 'Bob'],
          ['roles', 'user'],
        ]),
      ],
    ],
  ]);

  describe('join filter', () => {
    it('should join mapped values with a delimiter', async () => {
      const template = `{{ users | map('name') | join(', ') }}`;
      const result = await evaluate(template, usersContext);
      expect(result).toBe('Alice, Bob');
    });

    it('should join with an empty delimiter', async () => {
      const template = `{{ users | map('name') | join('') }}`;
      const result = await evaluate(template, usersContext);
      expect(result).toBe('AliceBob');
    });
  });

  describe('length filter', () => {
    it('should return array length', async () => {
      const template = `{{ users | length }}`;
      const result = await evaluate(template, usersContext);
      expect(result).toBe('2');
    });
  });

  describe('slice filter', () => {
    it('should slice with offset and limit using 1-based offset', async () => {
      const context: DataContext = new Map([
        ['offset', 2],
        ['limit', 2],
        [
          'items',
          [
            new Map([['name', 'one']]),
            new Map([['name', 'two']]),
            new Map([['name', 'three']]),
            new Map([['name', 'four']]),
          ],
        ],
      ]);
      const template = `{% for item in items | slice(offset, limit) %}{{ item.name }}{% endfor %}`;
      const result = await evaluate(template, context);
      expect(result).toBe('twothree');
    });
  });

  describe('boundary cases', () => {
    it('should return empty string when joining an empty array', async () => {
      const context: DataContext = new Map([['empty', []]]);
      const result = await evaluate(`{{ empty | join(', ') }}`, context);
      expect(result).toBe('');
    });

    it('should throw for unknown filters', async () => {
      await expect(evaluate(`{{ users | unknown }}`, usersContext)).rejects.toThrow(
        'Unknown filter: "unknown"'
      );
    });
  });
});
