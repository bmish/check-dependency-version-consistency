import 'mocha'; // eslint-disable-line import/no-unassigned-import -- to get Mocha types to work
import { mismatchingVersionsToOutputLines } from '../../lib/output';
import { deepStrictEqual } from 'assert';

describe('Utils | output', function () {
  describe('#mismatchingVersionsToOutputLines', function () {
    it('behaves correctly', function () {
      deepStrictEqual(
        mismatchingVersionsToOutputLines([
          { dependency: 'foo', versions: ['1.2.3', '4.5.6'] },
          { dependency: 'bar', versions: ['1.4.0', '2.0.0'] },
        ]),
        [
          'foo has more than one version: 1.2.3, 4.5.6',
          'bar has more than one version: 1.4.0, 2.0.0',
        ]
      );
    });

    it('behaves correctly with empty input', function () {
      deepStrictEqual(mismatchingVersionsToOutputLines([]), []);
    });
  });
});
