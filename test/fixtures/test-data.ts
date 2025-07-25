import { DataContext, DataContextValue } from '../../src/types.js';

export const comprehensiveContext: DataContext = new Map<string, DataContextValue>([
  ['var3', 'there'],
  ['recursive1', '<#recursive2#>'],
  ['recursive2', 'Recursive 2'],
  ['indirection-0', 'indirection-1'],
  ['indirection-1', 'indirection-2'],
  ['indirection-2', 'indirection-3'],
  ['indirection-3', 'The real value we are seeking'],
  [
    'values',
    [new Map([['var1', 'value1']]), new Map([['var1', 'value2']]), new Map([['var1', 'value3']])],
  ],
  [
    'morevalues',
    [
      new Map([
        ['xar1', 'xalue1A'],
        ['xar2', 'xalue2A'],
      ]),
      new Map([
        ['xar1', 'xalue1B'],
        ['xar2', 'xalue2B'],
      ]),
      new Map([
        ['xar1', 'xalue1C'],
        ['xar2', 'xalue2C'],
      ]),
    ],
  ],
  ['arrayNameVar', 'values'],
]);
