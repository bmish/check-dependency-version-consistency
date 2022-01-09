import {
  calculateVersionsForEachDependency,
  calculateMismatchingVersions,
  filterOutIgnoredDependencies,
  fixMismatchingVersions,
  compareRanges,
} from '../../lib/dependency-versions.js';
import { ok, strictEqual, deepStrictEqual } from 'node:assert';
import {
  FIXTURE_PATH_VALID,
  FIXTURE_PATH_INCONSISTENT_VERSIONS,
  FIXTURE_PATH_NO_PACKAGES,
  FIXTURE_PATH_NO_DEPENDENCIES,
  FIXTURE_PATH_PACKAGE_MISSING_PACKAGE_JSON,
} from '../fixtures/index.js';
import mockFs from 'mock-fs';
import { readFileSync } from 'node:fs';
import type { PackageJson } from 'type-fest';
import { join } from 'node:path';

describe('Utils | dependency-versions', function () {
  describe('#calculateMismatchingVersions', function () {
    it('has no mismatches with valid fixture', function () {
      const dependencyVersions =
        calculateVersionsForEachDependency(FIXTURE_PATH_VALID);
      deepStrictEqual(calculateMismatchingVersions(dependencyVersions), []);
    });

    it('has mismatches with fixture with inconsistent versions', function () {
      const dependencyVersions = calculateVersionsForEachDependency(
        FIXTURE_PATH_INCONSISTENT_VERSIONS
      );
      deepStrictEqual(calculateMismatchingVersions(dependencyVersions), [
        {
          dependency: 'baz',
          versions: [
            {
              version: '^7.8.9',
              packages: [join('scope1', 'package1')],
            },
            {
              version: '^8.0.0',
              packages: [join('scope1', 'package2')],
            },
          ],
        },
        {
          dependency: 'foo',
          versions: [
            {
              version: '1.2.0',
              packages: [
                '.',
                join('scope1', 'package2'),
                join('scope1', 'package3'),
              ],
            },
            {
              version: '1.3.0',
              packages: [join('scope1', 'package1')],
            },
          ],
        },
      ]);
    });

    it('has empty results when no packages', function () {
      const dependencyVersions = calculateVersionsForEachDependency(
        FIXTURE_PATH_NO_PACKAGES
      );
      deepStrictEqual(calculateMismatchingVersions(dependencyVersions), []);
    });

    it('has empty results when no dependencies', function () {
      const dependencyVersions = calculateVersionsForEachDependency(
        FIXTURE_PATH_NO_DEPENDENCIES
      );
      deepStrictEqual(calculateMismatchingVersions(dependencyVersions), []);
    });

    it('has empty results when a package is missing package.json', function () {
      const dependencyVersions = calculateVersionsForEachDependency(
        FIXTURE_PATH_PACKAGE_MISSING_PACKAGE_JSON
      );
      deepStrictEqual(calculateMismatchingVersions(dependencyVersions), []);
    });
  });

  describe('#filterOutIgnoredDependencies', function () {
    it('filters out an ignored dependency', function () {
      const dependencyVersions = calculateMismatchingVersions(
        calculateVersionsForEachDependency(FIXTURE_PATH_INCONSISTENT_VERSIONS)
      );
      deepStrictEqual(
        filterOutIgnoredDependencies(dependencyVersions, ['foo'], []),
        [
          {
            dependency: 'baz',
            versions: [
              {
                version: '^7.8.9',
                packages: [join('scope1', 'package1')],
              },
              {
                version: '^8.0.0',
                packages: [join('scope1', 'package2')],
              },
            ],
          },
        ]
      );
    });

    it('filters out an ignored dependency with regexp', function () {
      const dependencyVersions = calculateMismatchingVersions(
        calculateVersionsForEachDependency(FIXTURE_PATH_INCONSISTENT_VERSIONS)
      );
      deepStrictEqual(
        filterOutIgnoredDependencies(
          dependencyVersions,
          [],
          [new RegExp('^f.+$')]
        ),
        [
          {
            dependency: 'baz',
            versions: [
              {
                version: '^7.8.9',
                packages: [join('scope1', 'package1')],
              },
              {
                version: '^8.0.0',
                packages: [join('scope1', 'package2')],
              },
            ],
          },
        ]
      );
    });

    it('throws when unnecessarily ignoring a dependency that has no mismatches', function () {
      const dependencyVersions = calculateMismatchingVersions(
        calculateVersionsForEachDependency(FIXTURE_PATH_INCONSISTENT_VERSIONS)
      );
      expect(() =>
        filterOutIgnoredDependencies(dependencyVersions, ['nonexistentDep'], [])
      ).toThrowErrorMatchingInlineSnapshot(
        '"Specified option \'--ignore-dep nonexistentDep\', but no mismatches detected."'
      );
    });

    it('does not throw when unnecessarily regexp-ignoring a dependency that has no mismatches (less strict vs. --ignore-dep to provide greater flexibility)', function () {
      const dependencyVersions = calculateMismatchingVersions(
        calculateVersionsForEachDependency(FIXTURE_PATH_INCONSISTENT_VERSIONS)
      );
      strictEqual(
        filterOutIgnoredDependencies(
          dependencyVersions,
          [],
          [new RegExp('nonexistentDep')]
        ).length,
        2
      );
    });
  });

  describe('#fixMismatchingVersions', function () {
    beforeEach(function () {
      // Create a mock workspace filesystem for temporary usage in this test because changes will be written to some files.
      mockFs({
        'package.json': JSON.stringify({
          workspaces: ['scope1/*'],
          devDependencies: { foo: '^1.0.0' },
        }),
        'scope1/package1': {
          'package.json': JSON.stringify({
            dependencies: { foo: '^1.0.0', bar: '^3.0.0', 'a.b.c': '5.0.0' },
            devDependencies: {
              'one.two.three': '^4.1.0',
              '@types/one': '1.0.1',
            },
          }),
        },
        'scope1/package2': {
          'package.json': `${JSON.stringify({
            dependencies: {
              foo: '^2.0.0',
              bar: 'invalidVersion',
              'a.b.c': '~5.5.0',
            },
            devDependencies: {
              'one.two.three': '^4.0.0',
              '@types/one': '1.0.0',
            },
          })}\n`, // Ends in newline.
        },
      });
    });

    afterEach(function () {
      mockFs.restore();
    });

    it('fixes the fixable inconsistencies', function () {
      const mismatchingVersions = calculateMismatchingVersions(
        calculateVersionsForEachDependency('.')
      );
      const fixedMismatchingVersions = fixMismatchingVersions(
        '.',
        mismatchingVersions
      );

      // Read in package.json files.
      const packageJsonRootContents = readFileSync('package.json', 'utf-8');
      const packageJson1Contents = readFileSync(
        'scope1/package1/package.json',
        'utf-8'
      );
      const packageJson2Contents = readFileSync(
        'scope1/package2/package.json',
        'utf-8'
      );
      const packageJsonRoot: PackageJson = JSON.parse(packageJsonRootContents);
      const packageJson1: PackageJson = JSON.parse(packageJson1Contents);
      const packageJson2: PackageJson = JSON.parse(packageJson2Contents);

      // foo
      strictEqual(
        packageJson1.dependencies && packageJson1.dependencies.foo,
        '^2.0.0',
        'updates the package1 `foo` version to the highest version'
      );
      strictEqual(
        packageJson2.dependencies && packageJson2.dependencies.foo,
        '^2.0.0',
        'does not change package2 `foo` version since already at highest version'
      );
      strictEqual(
        packageJsonRoot.devDependencies && packageJsonRoot.devDependencies.foo,
        '^2.0.0',
        'updates the root package `foo` version to the highest version'
      );

      // bar
      strictEqual(
        packageJson1.dependencies && packageJson1.dependencies.bar,
        '^3.0.0',
        'does not change package1 `bar` version due to abnormal version present'
      );
      strictEqual(
        packageJson2.dependencies && packageJson2.dependencies.bar,
        'invalidVersion',
        'does not change package2 `bar` version due to abnormal version present'
      );

      // a.b.c
      strictEqual(
        packageJson1.dependencies && packageJson1.dependencies['a.b.c'],
        '~5.5.0',
        'updates the package1 `a.b.c` version to the highest version'
      );
      strictEqual(
        packageJson2.dependencies && packageJson2.dependencies['a.b.c'],
        '~5.5.0',
        'does not change package2 `a.b.c` version since already at highest version'
      );

      // one.two.three
      strictEqual(
        packageJson1.devDependencies &&
          packageJson1.devDependencies['one.two.three'],
        '^4.1.0',
        'does not change package1 `one.two.three` version since already at highest version'
      );
      strictEqual(
        packageJson2.devDependencies &&
          packageJson2.devDependencies['one.two.three'],
        '^4.1.0',
        'updates the package2 `one.two.three` version to the highest version'
      );

      // @types/one
      strictEqual(
        packageJson1.devDependencies &&
          packageJson1.devDependencies['@types/one'],
        '1.0.1',
        'does not change package1 `@types/one` version since already at highest version'
      );
      strictEqual(
        packageJson2.devDependencies &&
          packageJson2.devDependencies['@types/one'],
        '1.0.1',
        'updates the package2 `@types/one` version to the highest version'
      );

      // Check return value.
      deepStrictEqual(
        fixedMismatchingVersions,
        [
          {
            dependency: 'bar',
            versions: [
              {
                version: '^3.0.0',
                packages: [join('scope1', 'package1')],
              },
              {
                version: 'invalidVersion',
                packages: [join('scope1', 'package2')],
              },
            ],
          },
        ],
        'should return only the dependency that could not be fixed due to the abnormal version present'
      );

      // Existing newline at end of file should be maintained.
      ok(
        !packageJson1Contents.endsWith('\n'),
        'package1 should not end in newline'
      );
      ok(packageJson2Contents.endsWith('\n'), 'package2 should end in newline');
    });
  });

  describe('#compareRanges', function () {
    it('correctly chooses the higher range', function () {
      // 1 (greater than)
      strictEqual(compareRanges('1.2.3', '1.2.2'), 1);
      strictEqual(compareRanges('5.0.0', '4.0.0'), 1);
      strictEqual(compareRanges('8.0.0-beta.1', '^7'), 1);
      strictEqual(compareRanges('^5.0.0', '4.0.0'), 1);
      strictEqual(compareRanges('^5.0.0', '^4.0.0'), 1);
      strictEqual(compareRanges('^5.0.0', '~4.0.0'), 1);
      strictEqual(compareRanges('^5.0.0', '~5.0.0'), 1);
      strictEqual(compareRanges('~5.0.0', '5.0.0'), 1);
      strictEqual(compareRanges('~5.0.0', '~4.0.0'), 1);

      // -1 (less than)
      strictEqual(compareRanges('4.0.0', '5.0.0'), -1);
      strictEqual(compareRanges('5.0.0', '~5.0.0'), -1);
      strictEqual(compareRanges('^4.0.0', '^5.0.0'), -1);
      strictEqual(compareRanges('~4.0.0', '~5.0.0'), -1);
      strictEqual(compareRanges('~5.0.0', '^5.0.0'), -1);

      // 0 (equal)
      strictEqual(compareRanges('6', '6'), 0);
      strictEqual(compareRanges('6.0', '6.0'), 0);
      strictEqual(compareRanges('6.0.0', '6.0.0'), 0);
      strictEqual(compareRanges('^6.0.0', '^6.0.0'), 0);
      strictEqual(compareRanges('v6', '6'), 0);
      strictEqual(compareRanges('~6.0.0', '~6.0.0'), 0);
    });

    it('throws with invalid ranges', function () {
      expect(() =>
        compareRanges('foo', '~6.0.0')
      ).toThrowErrorMatchingInlineSnapshot('"Invalid Version: foo"');
      expect(() =>
        compareRanges('~6.0.0', 'foo')
      ).toThrowErrorMatchingInlineSnapshot('"Invalid Version: foo"');
    });
  });
});
