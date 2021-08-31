import 'mocha'; // eslint-disable-line import/no-unassigned-import -- to get Mocha types to work
import { getDirectoriesInPath } from '../../lib/fs.js';
import { deepStrictEqual } from 'node:assert';
import { FIXTURE_PATH_VALID } from '../fixtures/index.js';

describe('Utils | fs', function () {
  describe('#getDirectoriesInPath', function () {
    it('behaves correctly', function () {
      deepStrictEqual(getDirectoriesInPath(FIXTURE_PATH_VALID), [
        'package1',
        'scope1',
        'scope2',
      ]);
    });
  });
});
