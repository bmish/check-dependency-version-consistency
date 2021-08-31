import 'mocha'; // eslint-disable-line import/no-unassigned-import -- to get Mocha types to work
import { flatMap } from '../../lib/js.js';
import { deepStrictEqual } from 'node:assert';

describe('Utils | js', function () {
  describe('#flatMap', function () {
    it('behaves correctly', function () {
      deepStrictEqual(
        flatMap([], (item) => item),
        []
      );

      deepStrictEqual(
        flatMap([1, 2, 3], (item) => item),
        [1, 2, 3]
      );

      deepStrictEqual(
        flatMap([[1], [2], [3]], (item) => item),
        [1, 2, 3]
      );

      deepStrictEqual(
        flatMap([[1, 2, 3], [4, 5, 6], 7], (item) => item),
        [1, 2, 3, 4, 5, 6, 7]
      );

      deepStrictEqual(
        flatMap([1, 2, 3], (item) => item * 2),
        [2, 4, 6]
      );
    });
  });
});
