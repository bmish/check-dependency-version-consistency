import { getPackages, getWorkspaces } from '../../lib/workspace.js';
import { join } from 'node:path';
import {
  FIXTURE_PATH_NOT_A_WORKSPACE,
  FIXTURE_PATH_NO_PACKAGE_JSON,
  FIXTURE_PATH_VALID,
  FIXTURE_PATH_VALID_WITH_PACKAGES,
  FIXTURE_PATH_VALID_NOHOIST_WITH_NODE_MODULES,
  FIXTURE_PATH_WORKSPACE_NOT_AN_ARRAY,
  FIXTURE_PATH_WORKSPACE_PACKAGE_NOT_AN_ARRAY,
  FIXTURE_PATH_NESTED_WORKSPACES,
} from '../fixtures/index.js';

describe('Utils | workspace', function () {
  describe('#getPackages', function () {
    it('behaves correctly', function () {
      expect(
        getPackages(FIXTURE_PATH_VALID, [], [], [], []).map(
          (package_) => package_.path
        )
      ).toStrictEqual(
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
      expect(
        getPackages(FIXTURE_PATH_VALID, ['@scope1/package1'], [], [], []).map(
          (package_) => package_.path
        )
      ).toStrictEqual(
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
      expect(
        getPackages(
          FIXTURE_PATH_VALID,
          [],
          [new RegExp('^@scope1/.+')],
          [],
          []
        ).map((package_) => package_.path)
      ).toStrictEqual(
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
      expect(
        getPackages(FIXTURE_PATH_VALID, [], [], ['nested-scope'], []).map(
          (package_) => package_.path
        )
      ).toStrictEqual(
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
      expect(
        getPackages(
          FIXTURE_PATH_VALID,
          [],
          [],
          [],
          [new RegExp('^nested-scope.+')]
        ).map((package_) => package_.path)
      ).toStrictEqual(
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

    it('behaves correctly with nested workspaces', function () {
      expect(
        getPackages(FIXTURE_PATH_NESTED_WORKSPACES, [], [], [], []).map(
          (package_) => package_.path
        )
      ).toStrictEqual(
        [
          '.',
          'nested-workspace',
          'nested-workspace/n1',
          'nested-workspace/n2',
          'nested-workspace/foo1',
        ].map((path) => join(FIXTURE_PATH_NESTED_WORKSPACES, path))
      );
    });

    it('does not include packages in node_modules from nohoist usage (or crash from malformed package.json in node_modules test fixture)', function () {
      expect(
        getPackages(
          FIXTURE_PATH_VALID_NOHOIST_WITH_NODE_MODULES,
          [],
          [],
          [],
          []
        ).map((package_) => package_.path)
      ).toStrictEqual(
        ['.', '/packages/package-a'].map((path) =>
          join(FIXTURE_PATH_VALID_NOHOIST_WITH_NODE_MODULES, path)
        )
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

    it('behaves correctly with valid fixture for using nohoist', function () {
      expect(getWorkspaces(FIXTURE_PATH_VALID_WITH_PACKAGES))
        .toMatchInlineSnapshot(`
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

    it('throws with fixture that does not have workspace packages specified as array', function () {
      expect(() =>
        getWorkspaces(FIXTURE_PATH_WORKSPACE_PACKAGE_NOT_AN_ARRAY)
      ).toThrowErrorMatchingInlineSnapshot(
        '"package.json `workspaces.packages` is not a string array."'
      );
    });
  });
});
