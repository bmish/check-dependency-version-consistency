import 'mocha'; // eslint-disable-line import/no-unassigned-import -- to get Mocha types to work
import {
  calculateVersionsForEachDependency,
  calculateMismatchingVersions,
  filterOutIgnoredDependencies,
  fixMismatchingVersions,
  compareRanges,
} from '../../lib/dependency-versions.js';
import { strictEqual, deepStrictEqual, throws } from 'node:assert';
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
        filterOutIgnoredDependencies(dependencyVersions, ['foo']),
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
      throws(
        () =>
          filterOutIgnoredDependencies(dependencyVersions, ['nonexistentDep']),
        new Error(
          "Specified option '--ignore-dep nonexistentDep', but no mismatches detected."
        )
      );
    });
  });

  describe('#fixMismatchingVersions', function () {
    beforeEach(function () {
      // Create a mock workspace filesystem for temporary usage in this test because changes will be written to some files.
      mockFs({
        'package.json': '{"workspaces": ["scope1/*"]}',
        'scope1/package1': {
          'package.json':
            '{"dependencies": {"foo": "^1.0.0", "bar": "^3.0.0" }}',
        },
        'scope1/package2': {
          'package.json':
            '{"dependencies": {"foo": "^2.0.0", "bar": "invalidVersion" }}',
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

      const packageJson1: PackageJson = JSON.parse(
        readFileSync('scope1/package1/package.json', 'utf-8')
      );
      const packageJson2: PackageJson = JSON.parse(
        readFileSync('scope1/package2/package.json', 'utf-8')
      );

      strictEqual(
        packageJson1.dependencies && packageJson1.dependencies.foo,
        '^2.0.0',
        'updates the package1 `foo` version to the highest version'
      );
      strictEqual(
        packageJson1.dependencies && packageJson1.dependencies.bar,
        '^3.0.0',
        'does not change package1 `bar` version due to abnormal version present'
      );
      strictEqual(
        packageJson2.dependencies && packageJson2.dependencies.foo,
        '^2.0.0',
        'does not change package1 `foo` version since already at highest version'
      );
      strictEqual(
        packageJson2.dependencies && packageJson2.dependencies.bar,
        'invalidVersion',
        'does not change package1 `bar` version due to abnormal version present'
      );

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
      throws(
        () => compareRanges('foo', '~6.0.0'),
        new Error('Invalid Version: foo')
      );
      throws(
        () => compareRanges('~6.0.0', 'foo'),
        new Error('Invalid Version: foo')
      );
    });
  });
});
