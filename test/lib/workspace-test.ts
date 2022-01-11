import { getPackages, getWorkspaces } from '../../lib/workspace.js';
import { deepStrictEqual } from 'node:assert';
import { join } from 'node:path';
import {
  FIXTURE_PATH_NOT_A_WORKSPACE,
  FIXTURE_PATH_NO_PACKAGE_JSON,
  FIXTURE_PATH_VALID,
  FIXTURE_PATH_WORKSPACE_NOT_AN_ARRAY,
} from '../fixtures/index.js';

describe('Utils | workspace', function () {
  describe('#getPackages', function () {
    it('behaves correctly', function () {
      deepStrictEqual(
        getPackages(FIXTURE_PATH_VALID, [], [], [], []).map(
          (package_) => package_.path
        ),
        [
          '.',
          '@scope1/package1',
          '@scope1/package2',
          '@scope2/deps-only',
          '@scope2/dev-deps-only',
          'nested-scope/@nested-level/package',
          'foo1',
          'foo2',
          'package1',
        ].map((path) => join(FIXTURE_PATH_VALID, path))
      );
    });

    it('filters out ignored package', function () {
      deepStrictEqual(
        getPackages(FIXTURE_PATH_VALID, ['@scope1/package1'], [], [], []).map(
          (package_) => package_.path
        ),
        [
          '.',
          '@scope1/package2',
          '@scope2/deps-only',
          '@scope2/dev-deps-only',
          'nested-scope/@nested-level/package',
          'foo1',
          'foo2',
          'package1',
        ].map((path) => join(FIXTURE_PATH_VALID, path))
      );
    });

    it('throws when filtering out ignored package that does not exist', function () {
      expect(() =>
        getPackages(FIXTURE_PATH_VALID, ['does-not-exist'], [], [], [])
      ).toThrowErrorMatchingInlineSnapshot(
        '"Specified option \'--ignore-package does-not-exist\', but no such package detected in workspace."'
      );
    });

    it('filters out ignored package using regexp', function () {
      deepStrictEqual(
        getPackages(
          FIXTURE_PATH_VALID,
          [],
          [new RegExp('^@scope1/.+')],
          [],
          []
        ).map((package_) => package_.path),
        [
          '.',
          '@scope2/deps-only',
          '@scope2/dev-deps-only',
          'nested-scope/@nested-level/package',
          'foo1',
          'foo2',
          'package1',
        ].map((path) => join(FIXTURE_PATH_VALID, path))
      );
    });

    it('throws when filtering out using regexp ignored package that does not exist', function () {
      expect(() =>
        getPackages(FIXTURE_PATH_VALID, [], [new RegExp('fake')], [], [])
      ).toThrowErrorMatchingInlineSnapshot(
        '"Specified option \'--ignore-package-pattern /fake/\', but no matching packages detected in workspace."'
      );
    });

    it('filters out ignored path', function () {
      deepStrictEqual(
        getPackages(FIXTURE_PATH_VALID, [], [], ['nested-scope'], []).map(
          (package_) => package_.path
        ),
        [
          '.',
          '@scope1/package1',
          '@scope1/package2',
          '@scope2/deps-only',
          '@scope2/dev-deps-only',
          'foo1',
          'foo2',
          'package1',
        ].map((path) => join(FIXTURE_PATH_VALID, path))
      );
    });

    it('throws when filtering out ignored path that does not exist', function () {
      expect(() =>
        getPackages(FIXTURE_PATH_VALID, [], [], ['fake'], [])
      ).toThrowErrorMatchingInlineSnapshot(
        '"Specified option \'--ignore-path fake\', but no matching paths detected in workspace."'
      );
    });

    it('filters out ignored path using regexp', function () {
      deepStrictEqual(
        getPackages(
          FIXTURE_PATH_VALID,
          [],
          [],
          [],
          [new RegExp('^nested-scope.+')]
        ).map((package_) => package_.path),
        [
          '.',
          '@scope1/package1',
          '@scope1/package2',
          '@scope2/deps-only',
          '@scope2/dev-deps-only',
          'foo1',
          'foo2',
          'package1',
        ].map((path) => join(FIXTURE_PATH_VALID, path))
      );
    });

    it('throws when filtering out using regexp ignored path that does not exist', function () {
      expect(() =>
        getPackages(FIXTURE_PATH_VALID, [], [], [], [new RegExp('fake')])
      ).toThrowErrorMatchingInlineSnapshot(
        '"Specified option \'--ignore-path-pattern /fake/\', but no matching paths detected in workspace."'
      );
    });
  });

  describe('#getWorkspaces', function () {
    it('behaves correctly with valid fixture', function () {
      expect(getWorkspaces(FIXTURE_PATH_VALID)).toMatchInlineSnapshot(`
        Array [
          "@scope1/*",
          "@scope2/*",
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

    it('throws with fixture that does not have workspace specified as array', function () {
      expect(() =>
        getWorkspaces(FIXTURE_PATH_WORKSPACE_NOT_AN_ARRAY)
      ).toThrowErrorMatchingInlineSnapshot(
        '"package.json `workspaces` is not a string array."'
      );
    });
  });
});
