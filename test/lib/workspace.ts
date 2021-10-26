import 'mocha'; // eslint-disable-line import/no-unassigned-import -- to get Mocha types to work
import { getPackageJsonPaths, getWorkspaces } from '../../lib/workspace.js';
import { deepStrictEqual, throws } from 'node:assert';
import { join } from 'node:path';
import {
  FIXTURE_PATH_NOT_A_WORKSPACE,
  FIXTURE_PATH_NO_PACKAGE_JSON,
  FIXTURE_PATH_VALID,
} from '../fixtures/index.js';

describe('Utils | workspace', function () {
  describe('#getPackageJsonPaths', function () {
    it('behaves correctly', function () {
      deepStrictEqual(
        getPackageJsonPaths(FIXTURE_PATH_VALID),
        [
          'package.json',
          'scope1/package1/package.json',
          'scope1/package2/package.json',
          'scope2/deps-only/package.json',
          'scope2/dev-deps-only/package.json',
          'package1/package.json',
        ].map((path) => join(FIXTURE_PATH_VALID, path))
      );
    });
  });

  describe('#getWorkspaces', function () {
    it('behaves correctly with valid fixture', function () {
      deepStrictEqual(getWorkspaces(FIXTURE_PATH_VALID), [
        'scope1/*',
        'scope2/*',
        'package1',
      ]);
    });

    it('throws with fixture that has no package.json', function () {
      throws(
        () => getWorkspaces(FIXTURE_PATH_NO_PACKAGE_JSON),
        new Error('No package.json found at provided path.')
      );
    });

    it('throws with fixture that does not have workspace specified', function () {
      throws(
        () => getWorkspaces(FIXTURE_PATH_NOT_A_WORKSPACE),
        new Error(
          'package.json at provided path does not specify `workspaces`.'
        )
      );
    });
  });
});
