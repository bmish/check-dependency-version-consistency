import 'mocha'; // eslint-disable-line import/no-unassigned-import -- to get Mocha types to work
import { getDirectoriesInPath } from '../../lib/fs';
import { deepStrictEqual } from 'assert';
import { FIXTURE_PATH_VALID } from '../fixtures';

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
