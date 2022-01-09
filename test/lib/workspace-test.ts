import { getPackageJsonPaths, getWorkspaces } from '../../lib/workspace.js';
import { deepStrictEqual } from 'node:assert';
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
          'nested-scope/nested-level/package/package.json',
          'foo1/package.json',
          'foo2/package.json',
          'package1/package.json',
        ].map((path) => join(FIXTURE_PATH_VALID, path))
      );
    });
  });

  describe('#getWorkspaces', function () {
    it('behaves correctly with valid fixture', function () {
      expect(getWorkspaces(FIXTURE_PATH_VALID)).toMatchInlineSnapshot(`
        Array [
          "scope1/*",
          "scope2/*",
          "nested-scope/**",
          "foo*",
          "package1",
        ]
      `);
    });

    it('throws with fixture that has no package.json', function () {
      expect(() =>
        getWorkspaces(FIXTURE_PATH_NO_PACKAGE_JSON)
      ).toThrowErrorMatchingInlineSnapshot(
        '"No package.json found at provided path."'
      );
    });

    it('throws with fixture that does not have workspace specified', function () {
      expect(() =>
        getWorkspaces(FIXTURE_PATH_NOT_A_WORKSPACE)
      ).toThrowErrorMatchingInlineSnapshot(
        '"package.json at provided path does not specify `workspaces`."'
      );
    });
  });
});
