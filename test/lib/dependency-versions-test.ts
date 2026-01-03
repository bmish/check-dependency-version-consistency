import {
  calculateVersionsForEachDependency,
  calculateDependenciesAndVersions,
  filterOutIgnoredDependencies,
  fixVersionsMismatching,
} from '../../lib/dependency-versions.js';
import { getPackages } from '../../lib/workspace.js';
import {
  FIXTURE_PATH_VALID,
  FIXTURE_PATH_INCONSISTENT_VERSIONS,
  FIXTURE_PATH_NO_PACKAGES,
  FIXTURE_PATH_NO_DEPENDENCIES,
  FIXTURE_PATH_PACKAGE_MISSING_PACKAGE_JSON,
  FIXTURE_PATH_INCONSISTENT_LOCAL_PACKAGE_VERSION,
  FIXTURE_PATH_RESOLUTIONS,
  FIXTURE_PATH_ALL_VERSION_TYPES,
  FIXTURE_PATH_VALID_WITH_COMMENTS,
  FIXTURE_PATH_VALID_WITH_WORKSPACE_PREFIX,
  FIXTURE_PATH_INCONSISTENT_WITH_WORKSPACE_PREFIX,
} from '../fixtures/index.js';
import { DEPENDENCY_TYPE } from '../../lib/types.js';
import mockFs from 'mock-fs';
import { readFileSync } from 'node:fs';
import type { PackageJson } from 'type-fest';
import { join } from 'node:path';

function getPackagesHelper(root: string) {
  return getPackages(root, [], [], [], []);
}

describe('Utils | dependency-versions', function () {
  describe('#calculateDependenciesAndVersions', function () {
    it('has no mismatches with valid fixture', function () {
      const dependencyVersions = calculateVersionsForEachDependency(
        getPackagesHelper(FIXTURE_PATH_VALID),
      );
      const dependenciesAndVersions =
        calculateDependenciesAndVersions(dependencyVersions);
      const dependenciesAndVersionsWithMismatches =
        dependenciesAndVersions.filter(({ versions }) => versions.length > 1);
      expect(dependenciesAndVersionsWithMismatches).toStrictEqual([]);
    });

    it('has mismatches with fixture with inconsistent versions', function () {
      const dependencyVersions = calculateVersionsForEachDependency(
        getPackagesHelper(FIXTURE_PATH_INCONSISTENT_VERSIONS),
      );
      const dependenciesAndVersions =
        calculateDependenciesAndVersions(dependencyVersions);
      const dependenciesAndVersionsWithMismatches =
        dependenciesAndVersions.filter(({ versions }) => versions.length > 1);
      expect(dependenciesAndVersionsWithMismatches).toStrictEqual([
        {
          dependency: 'baz',
          versions: [
            {
              version: '^7.8.9',
              packages: [
                expect.objectContaining({
                  path: join(
                    FIXTURE_PATH_INCONSISTENT_VERSIONS,
                    '@scope1',
                    'package1',
                  ),
                }),
              ],
            },
            {
              version: '^8.0.0',
              packages: [
                expect.objectContaining({
                  path: join(
                    FIXTURE_PATH_INCONSISTENT_VERSIONS,
                    '@scope1',
                    'package2',
                  ),
                }),
              ],
            },
          ],
        },
        {
          dependency: 'foo',
          versions: [
            {
              version: '1.2.0',
              packages: [
                expect.objectContaining({
                  path: join(FIXTURE_PATH_INCONSISTENT_VERSIONS),
                }),
                expect.objectContaining({
                  path: join(
                    FIXTURE_PATH_INCONSISTENT_VERSIONS,
                    '@scope1',
                    'package2',
                  ),
                }),
                expect.objectContaining({
                  path: join(
                    FIXTURE_PATH_INCONSISTENT_VERSIONS,
                    '@scope1',
                    'package3',
                  ),
                }),
              ],
            },
            {
              version: '1.3.0',
              packages: [
                expect.objectContaining({
                  path: join(
                    FIXTURE_PATH_INCONSISTENT_VERSIONS,
                    '@scope1',
                    'package1',
                  ),
                }),
              ],
            },
          ],
        },
      ]);
    });

    it('has empty results when no packages', function () {
      const dependencyVersions = calculateVersionsForEachDependency(
        getPackagesHelper(FIXTURE_PATH_NO_PACKAGES),
      );
      expect(
        calculateDependenciesAndVersions(dependencyVersions),
      ).toStrictEqual([]);
    });

    it('has empty results when no dependencies', function () {
      const dependencyVersions = calculateVersionsForEachDependency(
        getPackagesHelper(FIXTURE_PATH_NO_DEPENDENCIES),
      );
      expect(
        calculateDependenciesAndVersions(dependencyVersions),
      ).toStrictEqual([]);
    });

    it('has empty results when a package is missing package.json', function () {
      const dependencyVersions = calculateVersionsForEachDependency(
        getPackagesHelper(FIXTURE_PATH_PACKAGE_MISSING_PACKAGE_JSON),
      );
      expect(
        calculateDependenciesAndVersions(dependencyVersions),
      ).toStrictEqual([]);
    });

    it('has mismatches with inconsistent local package version', function () {
      const dependencyVersions = calculateVersionsForEachDependency(
        getPackagesHelper(FIXTURE_PATH_INCONSISTENT_LOCAL_PACKAGE_VERSION),
      );
      expect(
        calculateDependenciesAndVersions(dependencyVersions),
      ).toStrictEqual([
        {
          dependency: 'package2',
          versions: [
            {
              version: '^0.0.0',
              packages: [
                expect.objectContaining({
                  path: join(
                    FIXTURE_PATH_INCONSISTENT_LOCAL_PACKAGE_VERSION,
                    'package1',
                  ),
                }),
              ],
            },
            {
              version: '1.0.0',
              packages: [
                expect.objectContaining({
                  path: join(
                    FIXTURE_PATH_INCONSISTENT_LOCAL_PACKAGE_VERSION,
                    'package2',
                  ),
                }),
              ],
            },
          ],
        },
      ]);
    });

    it('has mismatches with resolutions', function () {
      const dependencyVersions = calculateVersionsForEachDependency(
        getPackagesHelper(FIXTURE_PATH_RESOLUTIONS),
      );
      const dependenciesAndVersions =
        calculateDependenciesAndVersions(dependencyVersions);
      const dependenciesAndVersionsWithMismatches =
        dependenciesAndVersions.filter(({ versions }) => versions.length > 1);
      expect(dependenciesAndVersionsWithMismatches).toStrictEqual([
        {
          dependency: 'foo',
          versions: [
            {
              version: '^1.2.0',
              packages: [
                expect.objectContaining({
                  path: FIXTURE_PATH_RESOLUTIONS,
                }),
              ],
            },
            {
              version: '1.3.0',
              packages: [
                expect.objectContaining({
                  path: join(FIXTURE_PATH_RESOLUTIONS, 'package1'),
                }),
              ],
            },
            {
              version: '^2.0.0',
              packages: [
                expect.objectContaining({
                  path: FIXTURE_PATH_RESOLUTIONS,
                }),
              ],
            },
          ],
        },
      ]);
    });

    it('has no problem with all version types', function () {
      const dependencyVersions = calculateVersionsForEachDependency(
        getPackagesHelper(FIXTURE_PATH_ALL_VERSION_TYPES),
      );
      const dependenciesAndVersions =
        calculateDependenciesAndVersions(dependencyVersions);
      const dependenciesAndVersionsWithMismatches =
        dependenciesAndVersions.filter(({ versions }) => versions.length > 1);
      expect(dependenciesAndVersionsWithMismatches).toStrictEqual([]);
    });

    it('has no problem with consistent workspace prefixes', function () {
      const dependencyVersions = calculateVersionsForEachDependency(
        getPackagesHelper(FIXTURE_PATH_VALID_WITH_WORKSPACE_PREFIX),
      );
      const dependenciesAndVersions =
        calculateDependenciesAndVersions(dependencyVersions);
      const dependenciesAndVersionsWithMismatches =
        dependenciesAndVersions.filter(({ versions }) => versions.length > 1);
      expect(dependenciesAndVersionsWithMismatches).toStrictEqual([]);
    });

    it('has mismatches with inconsistent workspace prefixes', function () {
      const dependencyVersions = calculateVersionsForEachDependency(
        getPackagesHelper(FIXTURE_PATH_INCONSISTENT_WITH_WORKSPACE_PREFIX),
      );
      const dependenciesAndVersions =
        calculateDependenciesAndVersions(dependencyVersions);
      const dependenciesAndVersionsWithMismatches =
        dependenciesAndVersions.filter(({ versions }) => versions.length > 1);
      expect(dependenciesAndVersionsWithMismatches).toStrictEqual([
        {
          dependency: 'package1',
          versions: [
            {
              version: 'workspace:*',
              packages: [
                expect.objectContaining({
                  path: FIXTURE_PATH_INCONSISTENT_WITH_WORKSPACE_PREFIX,
                }),
              ],
            },
            {
              version: 'workspace:^',
              packages: [
                expect.objectContaining({
                  path: join(
                    FIXTURE_PATH_INCONSISTENT_WITH_WORKSPACE_PREFIX,
                    'package2',
                  ),
                }),
              ],
            },
          ],
        },
      ]);
    });
  });

  describe('#filterOutIgnoredDependencies', function () {
    it('filters out an ignored dependency', function () {
      const dependencyVersions = calculateDependenciesAndVersions(
        calculateVersionsForEachDependency(
          getPackagesHelper(FIXTURE_PATH_INCONSISTENT_VERSIONS),
        ),
      );
      expect(
        filterOutIgnoredDependencies(dependencyVersions, ['foo'], []),
      ).toStrictEqual([
        expect.objectContaining({ dependency: 'bar' }),
        expect.objectContaining({ dependency: 'baz' }),
      ]);
    });

    it('filters out an ignored dependency with regexp', function () {
      const dependencyVersions = calculateDependenciesAndVersions(
        calculateVersionsForEachDependency(
          getPackagesHelper(FIXTURE_PATH_INCONSISTENT_VERSIONS),
        ),
      );
      expect(
        filterOutIgnoredDependencies(
          dependencyVersions,
          [],
          [new RegExp('^f.+$')],
        ),
      ).toStrictEqual([
        expect.objectContaining({ dependency: 'bar' }),
        expect.objectContaining({ dependency: 'baz' }),
      ]);
    });

    it('filters out a local package inconsistency', function () {
      const dependencyVersions = calculateDependenciesAndVersions(
        calculateVersionsForEachDependency(
          getPackagesHelper(FIXTURE_PATH_INCONSISTENT_LOCAL_PACKAGE_VERSION),
        ),
      );
      expect(
        filterOutIgnoredDependencies(dependencyVersions, ['package2'], []),
      ).toStrictEqual([]);
    });

    it('filters out comments', function () {
      const dependencyVersions = calculateDependenciesAndVersions(
        calculateVersionsForEachDependency(
          getPackagesHelper(FIXTURE_PATH_VALID_WITH_COMMENTS),
        ),
      );
      expect(
        filterOutIgnoredDependencies(dependencyVersions, [], []),
      ).toStrictEqual([
        expect.objectContaining({ dependency: 'bar' }),
        expect.objectContaining({ dependency: 'baz' }),
        expect.objectContaining({ dependency: 'foo' }),
      ]);
    });

    it('throws when unnecessarily ignoring a dependency that has no mismatches', function () {
      const dependencyVersions = calculateDependenciesAndVersions(
        calculateVersionsForEachDependency(
          getPackagesHelper(FIXTURE_PATH_INCONSISTENT_VERSIONS),
        ),
      );
      expect(() =>
        filterOutIgnoredDependencies(
          dependencyVersions,
          ['nonexistentDep'],
          [],
        ),
      ).toThrowErrorMatchingInlineSnapshot(
        "[Error: Specified option '--ignore-dep nonexistentDep', but no version mismatches detected for this dependency.]",
      );
    });

    it('throws when unnecessarily regexp-ignoring a dependency that has no mismatches', function () {
      const dependencyVersions = calculateDependenciesAndVersions(
        calculateVersionsForEachDependency(
          getPackagesHelper(FIXTURE_PATH_INCONSISTENT_VERSIONS),
        ),
      );
      expect(() =>
        filterOutIgnoredDependencies(
          dependencyVersions,
          [],
          [new RegExp('nonexistentDep')],
        ),
      ).toThrowErrorMatchingInlineSnapshot(
        "[Error: Specified option '--ignore-dep-pattern /nonexistentDep/', but no matching dependencies with version mismatches detected.]",
      );
    });

    it('does not filter anything out when nothing to ignore', function () {
      const dependencyVersions = calculateDependenciesAndVersions(
        calculateVersionsForEachDependency(
          getPackagesHelper(FIXTURE_PATH_INCONSISTENT_VERSIONS),
        ),
      );
      expect(
        filterOutIgnoredDependencies(dependencyVersions, [], []).length,
      ).toStrictEqual(3);
    });
  });

  describe('#fixVersionsMismatching', function () {
    describe('inconsistent dependency versions', function () {
      beforeEach(function () {
        // Create a mock workspace filesystem for temporary usage in this test because changes will be written to some files.
        mockFs({
          'package.json': JSON.stringify({
            workspaces: ['@scope1/*'],
            devDependencies: { foo: '^1.0.0' },
          }),
          '@scope1/package1': {
            'package.json': JSON.stringify({
              name: '@scope1/package1',
              dependencies: { foo: '^1.0.0', bar: '^3.0.0', 'a.b.c': '5.0.0' },
              devDependencies: {
                'one.two.three': '^4.1.0',
                '@types/one': '1.0.1',
              },
            }),
          },
          '@scope1/package2': {
            'package.json': `${JSON.stringify({
              name: '@scope1/package2',
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
        const packages = getPackagesHelper('.');
        const versionsMismatching = calculateDependenciesAndVersions(
          calculateVersionsForEachDependency(packages),
        );
        const { fixable, notFixable } = fixVersionsMismatching(
          packages,
          versionsMismatching,
        );

        // Read in package.json files.
        const packageJsonRootContents = readFileSync('package.json', 'utf8');
        const packageJson1Contents = readFileSync(
          '@scope1/package1/package.json',
          'utf8',
        );
        const packageJson2Contents = readFileSync(
          '@scope1/package2/package.json',
          'utf8',
        );
        const packageJsonRoot = JSON.parse(
          packageJsonRootContents,
        ) as PackageJson;
        const packageJson1 = JSON.parse(packageJson1Contents) as PackageJson;
        const packageJson2 = JSON.parse(packageJson2Contents) as PackageJson;

        // foo
        // updates the package1 `foo` version to the latest version
        expect(
          packageJson1.dependencies && packageJson1.dependencies['foo'],
        ).toStrictEqual('^2.0.0');
        // does not change package2 `foo` version since already at latest version
        expect(
          packageJson2.dependencies && packageJson2.dependencies['foo'],
        ).toStrictEqual('^2.0.0');
        // updates the root package `foo` version to the latest version
        expect(
          packageJsonRoot.devDependencies &&
            packageJsonRoot.devDependencies['foo'],
        ).toStrictEqual('^2.0.0');

        // bar
        // does not change package1 `bar` version due to abnormal version present
        expect(
          packageJson1.dependencies && packageJson1.dependencies['bar'],
        ).toStrictEqual('^3.0.0');
        // does not change package2 `bar` version due to abnormal version present
        expect(
          packageJson2.dependencies && packageJson2.dependencies['bar'],
        ).toStrictEqual('invalidVersion');

        // a.b.c
        // updates the package1 `a.b.c` version to the latest version
        expect(
          packageJson1.dependencies && packageJson1.dependencies['a.b.c'],
        ).toStrictEqual('~5.5.0');
        // does not change package2 `a.b.c` version since already at latest version
        expect(
          packageJson2.dependencies && packageJson2.dependencies['a.b.c'],
        ).toStrictEqual('~5.5.0');

        // one.two.three
        // does not change package1 `one.two.three` version since already at latest version
        expect(
          packageJson1.devDependencies &&
            packageJson1.devDependencies['one.two.three'],
        ).toStrictEqual('^4.1.0');
        // updates the package2 `one.two.three` version to the latest version
        expect(
          packageJson2.devDependencies &&
            packageJson2.devDependencies['one.two.three'],
        ).toStrictEqual('^4.1.0');

        // @types/one
        // does not change package1 `@types/one` version since already at latest version
        expect(
          packageJson1.devDependencies &&
            packageJson1.devDependencies['@types/one'],
        ).toStrictEqual('1.0.1');
        // updates the package2 `@types/one` version to the latest version
        expect(
          packageJson2.devDependencies &&
            packageJson2.devDependencies['@types/one'],
        ).toStrictEqual('1.0.1');

        // Check return value.
        expect(notFixable).toStrictEqual([
          {
            // Should not be fixable due to the abnormal version present.
            dependency: 'bar',
            versions: [
              {
                version: '^3.0.0',
                packages: [
                  expect.objectContaining({
                    path: join('@scope1', 'package1'),
                  }),
                ],
              },
              {
                version: 'invalidVersion',
                packages: [
                  expect.objectContaining({
                    path: join('@scope1', 'package2'),
                  }),
                ],
              },
            ],
          },
        ]);

        expect(fixable).toStrictEqual([
          {
            dependency: '@types/one',
            versions: [
              {
                version: '1.0.0',
                packages: [
                  expect.objectContaining({
                    path: join('@scope1', 'package2'),
                  }),
                ],
              },
              {
                version: '1.0.1',
                packages: [
                  expect.objectContaining({
                    path: join('@scope1', 'package1'),
                  }),
                ],
              },
            ],
          },
          {
            dependency: 'a.b.c',
            versions: [
              {
                version: '5.0.0',
                packages: [
                  expect.objectContaining({
                    path: join('@scope1', 'package1'),
                  }),
                ],
              },
              {
                version: '~5.5.0',
                packages: [
                  expect.objectContaining({
                    path: join('@scope1', 'package2'),
                  }),
                ],
              },
            ],
          },
          {
            dependency: 'foo',
            versions: [
              {
                version: '^1.0.0',
                packages: [
                  expect.objectContaining({
                    path: '.',
                  }),
                  expect.objectContaining({
                    path: join('@scope1', 'package1'),
                  }),
                ],
              },
              {
                version: '^2.0.0',
                packages: [
                  expect.objectContaining({
                    path: join('@scope1', 'package2'),
                  }),
                ],
              },
            ],
          },
          {
            dependency: 'one.two.three',
            versions: [
              {
                version: '^4.0.0',
                packages: [
                  expect.objectContaining({
                    path: join('@scope1', 'package2'),
                  }),
                ],
              },
              {
                version: '^4.1.0',
                packages: [
                  expect.objectContaining({
                    path: join('@scope1', 'package1'),
                  }),
                ],
              },
            ],
          },
        ]);

        // Existing newline at end of file should be maintained.
        expect(packageJson1Contents).not.toMatch(/\n$/); // package1 should not end in newline
        expect(packageJson2Contents).toMatch(/\n$/); // package2 should end in newline
      });
    });

    describe('inconsistent local package versions', function () {
      beforeEach(function () {
        // Create a mock workspace filesystem for temporary usage in this test because changes will be written to some files.
        mockFs({
          'package.json': JSON.stringify({
            workspaces: ['*'],
          }),
          package1: {
            'package.json': JSON.stringify({
              name: 'package1',
              version: '1.0.0',
              dependencies: {
                package2: '^1.0.0', // Lower than actual version of this local package.
              },
            }),
          },
          package2: {
            'package.json': JSON.stringify({
              name: 'package2',
              version: '2.0.0',
              dependencies: {
                package1: '^2.0.0', // Higher than actual version of this local package.
              },
            }),
          },
          package3: {
            'package.json': JSON.stringify({
              name: 'package3',
              dependencies: {
                package1: '^0.0.0', // Lower than actual version of this local package.
              },
            }),
          },
        });
      });

      afterEach(function () {
        mockFs.restore();
      });

      it('fixes the fixable inconsistencies', function () {
        const packages = getPackagesHelper('.');
        const versionsMismatching = calculateDependenciesAndVersions(
          calculateVersionsForEachDependency(packages),
        );
        const { fixable, notFixable } = fixVersionsMismatching(
          packages,
          versionsMismatching,
        );

        // Read in package.json files.
        const packageJson1Contents = readFileSync(
          'package1/package.json',
          'utf8',
        );
        const packageJson2Contents = readFileSync(
          'package2/package.json',
          'utf8',
        );
        const packageJson3Contents = readFileSync(
          'package3/package.json',
          'utf8',
        );
        const packageJson1 = JSON.parse(packageJson1Contents) as PackageJson;
        const packageJson2 = JSON.parse(packageJson2Contents) as PackageJson;
        const packageJson3 = JSON.parse(packageJson3Contents) as PackageJson;

        expect(
          packageJson1.dependencies && packageJson1.dependencies['package2'],
        ).toStrictEqual('^2.0.0');

        expect(
          packageJson2.dependencies && packageJson2.dependencies['package1'],
        ).toStrictEqual('^2.0.0');

        expect(
          packageJson3.dependencies && packageJson3.dependencies['package1'],
        ).toStrictEqual('^0.0.0');

        expect(notFixable).toStrictEqual([
          {
            // Not fixable since found version higher than actual version of this local package.
            dependency: 'package1',
            versions: [
              {
                version: '^0.0.0',
                packages: [expect.objectContaining({ path: 'package3' })],
              },
              {
                version: '1.0.0',
                packages: [expect.objectContaining({ path: 'package1' })],
              },
              {
                version: '^2.0.0',
                packages: [expect.objectContaining({ path: 'package2' })],
              },
            ],
          },
        ]);

        expect(fixable).toStrictEqual([
          {
            // Fixable since updated to actual version of this local package.
            dependency: 'package2',
            versions: [
              {
                version: '^1.0.0',
                packages: [
                  expect.objectContaining({
                    path: 'package1',
                  }),
                ],
              },
              {
                version: '2.0.0',
                packages: [
                  expect.objectContaining({
                    path: 'package2',
                  }),
                ],
              },
            ],
          },
        ]);
      });
    });

    describe('resolutions', function () {
      beforeEach(function () {
        // Create a mock workspace filesystem for temporary usage in this test because changes will be written to some files.
        mockFs({
          'package.json': JSON.stringify({
            workspaces: ['*'],
            devDependencies: {
              foo: '^1.2.0',
            },
            resolutions: {
              foo: '^1.0.0',
              bar: '^1.0.0',
            },
          }),
          package1: {
            'package.json': JSON.stringify({
              name: 'package1',
              dependencies: {
                foo: '^2.0.0',
                bar: '^1.0.0',
              },
            }),
          },
        });
      });

      afterEach(function () {
        mockFs.restore();
      });

      it('fixes the fixable inconsistencies', function () {
        const packages = getPackagesHelper('.');
        const versionsMismatching = calculateDependenciesAndVersions(
          calculateVersionsForEachDependency(packages),
        );
        const { fixable, notFixable } = fixVersionsMismatching(
          packages,
          versionsMismatching,
        );

        // Read in package.json files.
        const packageJsonRootContents = readFileSync('package.json', 'utf8');
        const packageJson1Contents = readFileSync(
          'package1/package.json',
          'utf8',
        );
        const packageJsonRoot = JSON.parse(
          packageJsonRootContents,
        ) as PackageJson;
        const packageJson1 = JSON.parse(packageJson1Contents) as PackageJson;

        expect(
          packageJsonRoot.devDependencies &&
            packageJsonRoot.devDependencies['foo'],
        ).toStrictEqual('^2.0.0');

        expect(
          packageJsonRoot.resolutions && packageJsonRoot.resolutions['foo'],
        ).toStrictEqual('^2.0.0');

        expect(
          packageJson1.dependencies && packageJson1.dependencies['foo'],
        ).toStrictEqual('^2.0.0');

        expect(notFixable).toStrictEqual([]);

        expect(fixable).toStrictEqual([
          {
            dependency: 'foo',
            versions: [
              {
                version: '^1.0.0',
                packages: [
                  expect.objectContaining({
                    path: '.',
                  }),
                ],
              },
              {
                version: '^1.2.0',
                packages: [
                  expect.objectContaining({
                    path: '.',
                  }),
                ],
              },
              {
                version: '^2.0.0',
                packages: [
                  expect.objectContaining({
                    path: 'package1',
                  }),
                ],
              },
            ],
          },
        ]);
      });
    });

    describe('increasable range', function () {
      beforeEach(function () {
        // Create a mock workspace filesystem for temporary usage in this test because changes will be written to some files.
        mockFs({
          'package.json': JSON.stringify({
            workspaces: ['*'],
          }),
          package1: {
            'package.json': JSON.stringify({
              name: 'package1',
              dependencies: {
                foo: '^1.0.0',
              },
            }),
          },
          package2: {
            'package.json': JSON.stringify({
              name: 'package2',
              dependencies: {
                foo: '1.5.0',
              },
            }),
          },
        });
      });

      afterEach(function () {
        mockFs.restore();
      });

      it('increases the range', function () {
        const packages = getPackagesHelper('.');
        const versionsMismatching = calculateDependenciesAndVersions(
          calculateVersionsForEachDependency(packages),
        );
        fixVersionsMismatching(packages, versionsMismatching);

        // Read in package.json files.
        const packageJson1Contents = readFileSync(
          'package1/package.json',
          'utf8',
        );
        const packageJson2Contents = readFileSync(
          'package2/package.json',
          'utf8',
        );
        const packageJson1 = JSON.parse(packageJson1Contents) as PackageJson;
        const packageJson2 = JSON.parse(packageJson2Contents) as PackageJson;

        expect(
          packageJson1.dependencies && packageJson1.dependencies['foo'],
        ).toStrictEqual('^1.5.0');

        expect(
          packageJson2.dependencies && packageJson2.dependencies['foo'],
        ).toStrictEqual('^1.5.0');
      });
    });

    describe('dryrun with optionalDependencies, peerDependencies, resolutions', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            workspaces: ['*'],
            resolutions: {
              foo: '^1.0.0',
            },
          }),
          package1: {
            'package.json': JSON.stringify({
              name: 'package1',
              optionalDependencies: {
                foo: '^2.0.0',
              },
              peerDependencies: {
                bar: '^1.0.0',
              },
            }),
          },
          package2: {
            'package.json': JSON.stringify({
              name: 'package2',
              optionalDependencies: {
                foo: '^1.0.0',
              },
              peerDependencies: {
                bar: '^2.0.0',
              },
              resolutions: {
                foo: '^2.0.0',
              },
            }),
          },
        });
      });

      afterEach(function () {
        mockFs.restore();
      });

      it('does not write changes with dryrun=true', function () {
        const packages = getPackagesHelper('.');
        const depTypes = [
          DEPENDENCY_TYPE.optionalDependencies,
          DEPENDENCY_TYPE.peerDependencies,
          DEPENDENCY_TYPE.resolutions,
        ];
        const versionsMismatching = calculateDependenciesAndVersions(
          calculateVersionsForEachDependency(packages, depTypes),
        );
        const { fixable } = fixVersionsMismatching(
          packages,
          versionsMismatching,
          true, // dryrun
        );

        // Read in package.json files - they should be unchanged.
        const packageJsonRootContents = readFileSync('package.json', 'utf8');
        const packageJson1Contents = readFileSync(
          'package1/package.json',
          'utf8',
        );
        const packageJson2Contents = readFileSync(
          'package2/package.json',
          'utf8',
        );
        const packageJsonRoot = JSON.parse(
          packageJsonRootContents,
        ) as PackageJson;
        const packageJson1 = JSON.parse(packageJson1Contents) as PackageJson;
        const packageJson2 = JSON.parse(packageJson2Contents) as PackageJson;

        // Files should remain unchanged since dryrun=true
        expect(packageJsonRoot.resolutions?.['foo']).toStrictEqual('^1.0.0');
        expect(packageJson1.optionalDependencies?.['foo']).toStrictEqual(
          '^2.0.0',
        );
        expect(packageJson1.peerDependencies?.['bar']).toStrictEqual('^1.0.0');
        expect(packageJson2.optionalDependencies?.['foo']).toStrictEqual(
          '^1.0.0',
        );
        expect(packageJson2.peerDependencies?.['bar']).toStrictEqual('^2.0.0');
        expect(packageJson2.resolutions?.['foo']).toStrictEqual('^2.0.0');

        // But fixable should still report what would have been fixed
        expect(fixable.length).toBeGreaterThan(0);
      });
    });
  });

  describe('#calculateVersionsForEachDependency', function () {
    describe('handles falsy dependency versions', function () {
      afterEach(function () {
        mockFs.restore();
      });

      it('skips empty string devDependencies versions', function () {
        mockFs({
          'package.json': JSON.stringify({
            workspaces: ['*'],
          }),
          package1: {
            'package.json': JSON.stringify({
              name: 'package1',
              devDependencies: {
                foo: '',
                bar: '^1.0.0',
              },
            }),
          },
        });

        const packages = getPackagesHelper('.');
        const dependencyVersions = calculateVersionsForEachDependency(packages);
        const dependenciesAndVersions =
          calculateDependenciesAndVersions(dependencyVersions);

        // foo with empty version should be skipped
        expect(
          dependenciesAndVersions.find((d) => d.dependency === 'foo'),
        ).toBeUndefined();
        // bar should still be present
        expect(
          dependenciesAndVersions.find((d) => d.dependency === 'bar'),
        ).toBeDefined();
      });

      it('skips empty string optionalDependencies versions', function () {
        mockFs({
          'package.json': JSON.stringify({
            workspaces: ['*'],
          }),
          package1: {
            'package.json': JSON.stringify({
              name: 'package1',
              optionalDependencies: {
                foo: '',
                bar: '^1.0.0',
              },
            }),
          },
        });

        const packages = getPackagesHelper('.');
        const dependencyVersions = calculateVersionsForEachDependency(packages);
        const dependenciesAndVersions =
          calculateDependenciesAndVersions(dependencyVersions);

        expect(
          dependenciesAndVersions.find((d) => d.dependency === 'foo'),
        ).toBeUndefined();
        expect(
          dependenciesAndVersions.find((d) => d.dependency === 'bar'),
        ).toBeDefined();
      });

      it('skips empty string peerDependencies versions', function () {
        mockFs({
          'package.json': JSON.stringify({
            workspaces: ['*'],
          }),
          package1: {
            'package.json': JSON.stringify({
              name: 'package1',
              peerDependencies: {
                foo: '',
                bar: '^1.0.0',
              },
            }),
          },
        });

        const packages = getPackagesHelper('.');
        const dependencyVersions = calculateVersionsForEachDependency(
          packages,
          [DEPENDENCY_TYPE.peerDependencies],
        );
        const dependenciesAndVersions =
          calculateDependenciesAndVersions(dependencyVersions);

        expect(
          dependenciesAndVersions.find((d) => d.dependency === 'foo'),
        ).toBeUndefined();
        expect(
          dependenciesAndVersions.find((d) => d.dependency === 'bar'),
        ).toBeDefined();
      });

      it('skips empty string resolutions versions', function () {
        mockFs({
          'package.json': JSON.stringify({
            workspaces: ['*'],
            resolutions: {
              foo: '',
              bar: '^1.0.0',
            },
          }),
          package1: {
            'package.json': JSON.stringify({
              name: 'package1',
            }),
          },
        });

        const packages = getPackagesHelper('.');
        const dependencyVersions = calculateVersionsForEachDependency(packages);
        const dependenciesAndVersions =
          calculateDependenciesAndVersions(dependencyVersions);

        expect(
          dependenciesAndVersions.find((d) => d.dependency === 'foo'),
        ).toBeUndefined();
        expect(
          dependenciesAndVersions.find((d) => d.dependency === 'bar'),
        ).toBeDefined();
      });
    });
  });
});
