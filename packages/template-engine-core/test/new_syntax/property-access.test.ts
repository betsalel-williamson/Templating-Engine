import { describe, it, expect } from 'vitest';
import { DataContext } from '../../src/types.js';
import { createTestEvaluator } from '../test-helper.js';

describe('New Syntax: Dot Notation and Bracket Property Access', () => {
  const evaluate = createTestEvaluator(new Map(), false, 'new', false);

  describe('dot notation', () => {
    it('should resolve nested map properties', async () => {
      const context: DataContext = new Map([
        [
          'user',
          new Map([
            ['name', 'Alice'],
            ['address', new Map([['city', 'Portland']])],
          ]),
        ],
      ]);
      const result = await evaluate('{{ user.address.city }}', context);
      expect(result).toBe('Portland');
    });

    it('should resolve hyphenated keys as a single identifier segment', async () => {
      const context: DataContext = new Map([['db-user', 'auth_user']]);
      const result = await evaluate('{{ db-user }}', context);
      expect(result).toBe('auth_user');
    });
  });

  describe('bracket lookup', () => {
    it('should resolve dynamically constructed keys', async () => {
      const context: DataContext = new Map([
        ['env', 'prod'],
        ['prod-db-host', 'prod-db-cluster.aws.internal'],
      ]);
      const result = await evaluate(`{{ [env ~ '-db-host'] }}`, context);
      expect(result).toBe('prod-db-cluster.aws.internal');
    });

    it('should resolve dynamic iteration sources', async () => {
      const context: DataContext = new Map([
        ['report_source', 'logs'],
        [
          'logs',
          [
            new Map([
              ['id', '1'],
              ['title', 'Login'],
            ]),
          ],
        ],
      ]);
      const template = '{% for entry in [report_source] %}{{ entry.title }}{% endfor %}';
      const result = await evaluate(template, context);
      expect(result).toBe('Login');
    });
  });

  describe('boundary cases', () => {
    it('should leave output empty for missing nested properties', async () => {
      const context: DataContext = new Map([['user', new Map([['name', 'Alice']])]]);
      const result = await evaluate('{{ user.missing }}', context);
      expect(result).toBe('');
    });

    it('should return raw tag for missing top-level variables', async () => {
      const result = await evaluate('{{ missing }}');
      expect(result).toBe('{{ missing }}');
    });
  });
});
