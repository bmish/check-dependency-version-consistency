import 'mocha'; // eslint-disable-line import/no-unassigned-import -- to get Mocha types to work
import {
  calculateVersionsForEachDependency,
  calculateMismatchingVersions,
  filterOutIgnoredDependencies,
} from '../../lib/dependency-versions';
import { deepStrictEqual, throws } from 'assert';
import {
  FIXTURE_PATH_VALID,
  FIXTURE_PATH_INCONSISTENT_VERSIONS,
  FIXTURE_PATH_NO_PACKAGES,
  FIXTURE_PATH_NO_DEPENDENCIES,
  FIXTURE_PATH_PACKAGE_MISSING_PACKAGE_JSON,
} from '../fixtures';

describe('Utils | dependency-versions', function () {
  describe('#calculateMismatchingVersions', function () {
    it('has no mismatches with valid fixture', function () {
      const dependencyVersions = calculateVersionsForEachDependency(
        FIXTURE_PATH_VALID
      );
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
              count: 1,
              version: '^7.8.9',
            },
            {
              count: 1,
              version: '^8.0.0',
            },
          ],
        },
        {
          dependency: 'foo',
          versions: [
            {
              count: 2,
              version: '1.2.0',
            },
            {
              count: 1,
              version: '1.3.0',
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
                count: 1,
                version: '^7.8.9',
              },
              {
                count: 1,
                version: '^8.0.0',
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
});
