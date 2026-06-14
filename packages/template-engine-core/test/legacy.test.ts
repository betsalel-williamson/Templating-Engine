import { describe, it, expect } from 'vitest';
import { createTestEvaluator } from './test-helper.js';
import { comprehensiveContext } from './fixtures/test-data.js';

describe('Regression Test Suite (Legacy Tests)', () => {
  const evaluate = createTestEvaluator();

  describe('Legacy README Parity Tests', () => {
    it('README line 34: simple multiplication', async () => {
      const template =
        'Hi <#var3#> <~<`<#var1#> <#values.elementindex#> of <#values.numberofelements#> `><*><[values]>~>';
      const result = await evaluate(template, comprehensiveContext);
      // NOTE: The legacy README's expected output had a typo, joining with spaces.
      // Our implementation joins without a separator unless one is specified.
      const expected = 'Hi there value1 1 of 3 value2 2 of 3 value3 3 of 3 ';
      expect(result).toBe(expected);
    });

    it('README line 70: complex multiplication', async () => {
      // NOTE: Legacy README output shows "Hi" only once, which is correct as it's outside the loop.
      const template = 'Hi <~<`<#var3#> <#xar1#> <#xar2#>\n`><*><[morevalues]>~>';
      const result = await evaluate(template, comprehensiveContext);
      const expected =
        'Hi there xalue1A xalue2A\n' + 'there xalue1B xalue2B\n' + 'there xalue1C xalue2C\n';
      expect(result).toBe(expected);
    });

    it('README line 121: conditional with missing false branch (true case)', async () => {
      const template = '<~<+><`TRUE`><?<#isTrue#>?>~>';
      const result = await evaluate(template, new Map([['isTrue', '1']]));
      expect(result).toBe('TRUE');
    });

    it('README line 122: conditional with missing false branch (false case)', async () => {
      const template = '<~<+><`TRUE`><?<#isTrue#>?>~>';
      const result = await evaluate(template, new Map([['isTrue', '0']]));
      expect(result).toBe('');
    });
  });
});
