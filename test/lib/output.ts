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
          'foo has more than one version: 2.2.3 (1 usage), 4.5.6 (2 usages)',
          'bar has more than one version: 1.4.0 (3 usages), 2.0.0 (4 usages)',
          'baz has more than one version: ^1.0.0 (1 usage), ~2.0.0 (1 usage), ^2.0.0 (1 usage)',
        ]
      );
    });

    it('behaves correctly with empty input', function () {
      deepStrictEqual(mismatchingVersionsToOutputLines([]), []);
    });
  });
});
