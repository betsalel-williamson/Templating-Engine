import { describe, it, expect } from 'vitest';
import { comprehensiveContext } from './fixtures/test-data.js';
import { createTestEvaluator } from './test-helper.js';

describe('Comprehensive Template Tests', () => {
  const evaluate = createTestEvaluator();

  describe('Conditional Cross-Product (Story 6)', () => {
    const sqlContext = new Map([
      [
        'attributes',
        [
          new Map([
            ['attribute', 'attr1'],
            ['type', 'integer'],
          ]),
          new Map([
            ['attribute', 'attr2'],
            ['type', 'integer'],
          ]),
          new Map([
            ['attribute', 'attr3'],
            ['type', 'integer'],
          ]),
        ],
      ],
    ]);

    it('should generate a SQL CREATE TABLE statement with correct delimiters', async () => {
      const template =
        'create table someTable (\n<~<`  <#attribute#> <#type#>`><*?,\n:\n><[attributes]>~>);';
      const result = await evaluate(template, sqlContext);
      const expected =
        'create table someTable (\n' +
        '  attr1 integer,\n' +
        '  attr2 integer,\n' +
        '  attr3 integer\n' +
        ');';
      expect(result).toBe(expected);
    });

    it('should handle only a delimiter', async () => {
      const template = '[<~<`<#attribute#>`><*?,:><[attributes]>~>]';
      const result = await evaluate(template, sqlContext);
      expect(result).toBe('[attr1,attr2,attr3]');
    });

    it('should handle only a terminator', async () => {
      const template = '<~<`<#attribute#>`><*?:;><[attributes]>~>';
      const result = await evaluate(template, sqlContext);
      expect(result).toBe('attr1attr2attr3;');
    });
  });
});
