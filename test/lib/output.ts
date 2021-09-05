import 'mocha'; // eslint-disable-line import/no-unassigned-import -- to get Mocha types to work
import { mismatchingVersionsToOutputLines } from '../../lib/output.js';
import { deepStrictEqual } from 'node:assert';

describe('Utils | output', function () {
  describe('#mismatchingVersionsToOutputLines', function () {
    it('behaves correctly', function () {
      deepStrictEqual(
        mismatchingVersionsToOutputLines([
          {
            dependency: 'foo',
            versions: [
              { version: '1.2.3', count: 1 },
              { version: '4.5.6', count: 2 },
            ],
          },
          {
            dependency: 'bar',
            versions: [
              { version: '2.0.0', count: 4 },
              { version: '1.4.0', count: 3 },
            ],
          },
          {
            dependency: 'baz',
            versions: [
              { version: '^2.0.0', count: 1 },
              { version: '~2.0.0', count: 1 },
              { version: '^1.0.0', count: 1 },
            ],
          },
        ]),
        [
          '\u001B[1mfoo\u001B[22m has more than one version:\n  \u001B[92m1.2.3\u001B[39m (1 usage)\n  \u001B[92m4.5.6\u001B[39m (2 usages)',
          '\u001B[1mbar\u001B[22m has more than one version:\n  \u001B[92m1.4.0\u001B[39m (3 usages)\n  \u001B[92m2.0.0\u001B[39m (4 usages)',
          '\u001B[1mbaz\u001B[22m has more than one version:\n  \u001B[92m^1.0.0\u001B[39m (1 usage)\n  \u001B[92m~2.0.0\u001B[39m (1 usage)\n  \u001B[92m^2.0.0\u001B[39m (1 usage)',
        ]
      );
    });

    it('behaves correctly with empty input', function () {
      deepStrictEqual(mismatchingVersionsToOutputLines([]), []);
    });
  });
});
