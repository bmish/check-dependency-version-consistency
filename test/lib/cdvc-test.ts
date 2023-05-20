import {
  FIXTURE_PATH_INCONSISTENT_VERSIONS,
  FIXTURE_PATH_VALID,
} from '../fixtures/index.js';
import { CDVC } from '../../lib/cdvc.js';
import mockFs from 'mock-fs';
import { readFileSync } from 'node:fs';
import type { PackageJson } from 'type-fest';
import path from 'node:path';

describe('CDVC', function () {
  describe('valid fixture', function () {
    it('behaves correctly', function () {
      const cdvc = new CDVC(FIXTURE_PATH_VALID);
      const dependencies = cdvc.getDependencies();

      expect(cdvc.hasMismatchingDependencies).toBe(false);
      expect(cdvc.hasMismatchingDependenciesFixable).toBe(false);
      expect(cdvc.hasMismatchingDependenciesNotFixable).toBe(false);
      expect(dependencies).toStrictEqual([
        {
          isFixable: false,
          isMismatching: false,
          name: 'bar',
          versions: [
            {
              packages: [
                path.join('@scope1', 'package1'),
                path.join('@scope1', 'package2'),
                path.join('@scope2', 'deps-only'),
                'package1',
              ],
              version: '^4.5.6',
            },
          ],
        },
        {
          isFixable: false,
          isMismatching: false,
          name: 'baz',
          versions: [
            {
              packages: [
                path.join('@scope1', 'package1'),
                path.join('@scope1', 'package2'),
                path.join('@scope2', 'dev-deps-only'),
                'package1',
              ],
              version: '^7.8.9',
            },
          ],
        },
        {
          isFixable: false,
          isMismatching: false,
          name: 'foo',
          versions: [
            {
              packages: [
                '',
                path.join('@scope1', 'package1'),
                path.join('@scope1', 'package2'),
                path.join('@scope2', 'deps-only'),
                'package1',
              ],
              version: '1.2.3',
            },
          ],
        },
        {
          isFixable: false,
          isMismatching: false,
          name: 'foo1',
          versions: [
            {
              packages: ['package1'],
              version: '^1.0.0',
            },
          ],
        },
      ]);

      // Generated property.
      expect(dependencies.map((dep) => dep.isMismatching)).toStrictEqual([
        false,
        false,
        false,
        false,
      ]);

      expect(cdvc.getDependency('foo')).toStrictEqual({
        isFixable: false,
        isMismatching: false,
        name: 'foo',
        versions: [
          {
            packages: [
              '',
              path.join('@scope1', 'package1'),
              path.join('@scope1', 'package2'),
              path.join('@scope2', 'deps-only'),
              'package1',
            ],
            version: '1.2.3',
          },
        ],
      });
    });
  });

  describe('invalid fixture', function () {
    it('behaves correctly', function () {
      const cdvc = new CDVC(FIXTURE_PATH_INCONSISTENT_VERSIONS);
      const dependencies = cdvc.getDependencies();

      expect(cdvc.hasMismatchingDependencies).toBe(true);
      expect(cdvc.hasMismatchingDependenciesFixable).toBe(true);
      expect(cdvc.hasMismatchingDependenciesNotFixable).toBe(false);
      expect(dependencies).toStrictEqual([
        {
          isFixable: false,
          isMismatching: false,
          name: 'bar',
          versions: [
            {
              packages: [
                path.join('@scope1', 'package1'),
                path.join('@scope1', 'package2'),
              ],
              version: '^4.5.6',
            },
          ],
        },
        {
          isFixable: true,
          isMismatching: true,
          name: 'baz',
          versions: [
            {
              packages: [path.join('@scope1', 'package1')],
              version: '^7.8.9',
            },
            {
              packages: [path.join('@scope1', 'package2')],
              version: '^8.0.0',
            },
          ],
        },
        {
          isFixable: true,
          isMismatching: true,
          name: 'foo',
          versions: [
            {
              packages: [
                '',
                path.join('@scope1', 'package2'),
                path.join('@scope1', 'package3'),
              ],
              version: '1.2.0',
            },
            {
              packages: [path.join('@scope1', 'package1')],
              version: '1.3.0',
            },
          ],
        },
      ]);

      // Generated property.
      expect(dependencies.map((dep) => dep.isMismatching)).toStrictEqual([
        false,
        true,
        true,
      ]);
    });
  });

  describe('invalid fixture and ignore patterns', function () {
    it('behaves correctly', function () {
      const cdvc = new CDVC(FIXTURE_PATH_INCONSISTENT_VERSIONS, {
        ignorePackagePattern: ['package3'],
        ignorePathPattern: ['package3'],
        ignoreDepPattern: ['foo'],
      });
      const dependencies = cdvc.getDependencies();

      expect(cdvc.hasMismatchingDependencies).toBe(true);
      expect(cdvc.hasMismatchingDependenciesFixable).toBe(true);
      expect(cdvc.hasMismatchingDependenciesNotFixable).toBe(false);
      expect(dependencies).toStrictEqual([
        {
          isFixable: false,
          isMismatching: false,
          name: 'bar',
          versions: [
            {
              packages: [
                path.join('@scope1', 'package1'),
                path.join('@scope1', 'package2'),
              ],
              version: '^4.5.6',
            },
          ],
        },
        {
          isFixable: true,
          isMismatching: true,
          name: 'baz',
          versions: [
            {
              packages: [path.join('@scope1', 'package1')],
              version: '^7.8.9',
            },
            {
              packages: [path.join('@scope1', 'package2')],
              version: '^8.0.0',
            },
          ],
        },
      ]);

      // Generated property.
      expect(dependencies.map((dep) => dep.isMismatching)).toStrictEqual([
        false,
        true,
      ]);
    });
  });

  describe('mocking the filesystem, with an unfixable version', function () {
    let expectedPackage1: PackageJson;
    let expectedPackage2: PackageJson;
    beforeEach(function () {
      // Create a mock workspace filesystem for temporary usage in this test because changes will be written to some files.
      expectedPackage1 = {
        name: 'package1',
        dependencies: {
          foo: '^1.0.0',
        },
      };
      expectedPackage2 = {
        name: 'package2',
        dependencies: {
          foo: '*',
        },
      };
      mockFs({
        'package.json': JSON.stringify({
          workspaces: ['*'],
        }),
        package1: {
          'package.json': JSON.stringify(expectedPackage1),
        },
        package2: {
          'package.json': JSON.stringify(expectedPackage2),
        },
      });
    });

    afterEach(function () {
      mockFs.restore();
    });

    it('does not fix because of unfixable version and returns the unfixable list', function () {
      const cdvc = new CDVC('.', { fix: true });

      expect(cdvc.getDependencies()).toStrictEqual([
        {
          isFixable: false,
          isMismatching: true,
          name: 'foo',
          versions: [
            {
              packages: ['package1'],
              version: '^1.0.0',
            },
            {
              packages: ['package2'],
              version: '*',
            },
          ],
        },
      ]);

      // Read in package.json files.
      const packageJson1Contents = readFileSync(
        'package1/package.json',
        'utf8'
      );
      const packageJson2Contents = readFileSync(
        'package2/package.json',
        'utf8'
      );
      const actualPackageJson1 = JSON.parse(
        packageJson1Contents
      ) as PackageJson;
      const actualPackageJson2 = JSON.parse(
        packageJson2Contents
      ) as PackageJson;

      expect(actualPackageJson1).toStrictEqual(expectedPackage1);
      expect(actualPackageJson2).toStrictEqual(expectedPackage2);
    });
  });

  describe('mocking the filesystem, without fixing', function () {
    let expectedPackage1: PackageJson;
    let expectedPackage2: PackageJson;
    beforeEach(function () {
      // Create a mock workspace filesystem for temporary usage in this test because changes will be written to some files.
      expectedPackage1 = {
        name: 'package1',
        dependencies: {
          foo: '^1.0.0',
        },
      };
      expectedPackage2 = {
        name: 'package2',
        dependencies: {
          foo: '1.5.0',
        },
      };
      mockFs({
        'package.json': JSON.stringify({
          workspaces: ['*'],
        }),
        package1: {
          'package.json': JSON.stringify(expectedPackage1),
        },
        package2: {
          'package.json': JSON.stringify(expectedPackage2),
        },
      });
    });

    afterEach(function () {
      mockFs.restore();
    });

    it('does not fix by default', function () {
      const cdvc = new CDVC('.');

      expect(cdvc.getDependencies()).toStrictEqual([
        {
          isFixable: true,
          isMismatching: true,
          name: 'foo',
          versions: [
            {
              packages: ['package1'],
              version: '^1.0.0',
            },
            {
              packages: ['package2'],
              version: '1.5.0',
            },
          ],
        },
      ]);

      // Read in package.json files.
      const packageJson1Contents = readFileSync(
        'package1/package.json',
        'utf8'
      );
      const packageJson2Contents = readFileSync(
        'package2/package.json',
        'utf8'
      );
      const actualPackageJson1 = JSON.parse(
        packageJson1Contents
      ) as PackageJson;
      const actualPackageJson2 = JSON.parse(
        packageJson2Contents
      ) as PackageJson;

      expect(actualPackageJson1).toStrictEqual(expectedPackage1);
      expect(actualPackageJson2).toStrictEqual(expectedPackage2);
    });
  });

  describe('mocking the filesystem, with fixing', function () {
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

    it('fixes when option provided', function () {
      const cdvc = new CDVC('.', { fix: true });

      expect(cdvc.getDependencies()).toStrictEqual([
        {
          isFixable: true,
          isMismatching: true,
          name: 'foo',
          versions: [
            {
              packages: ['package1'],
              version: '^1.0.0',
            },
            {
              packages: ['package2'],
              version: '1.5.0',
            },
          ],
        },
      ]);

      // Read in package.json files.
      const packageJson1Contents = readFileSync(
        'package1/package.json',
        'utf8'
      );
      const packageJson2Contents = readFileSync(
        'package2/package.json',
        'utf8'
      );
      const actualPackageJson1 = JSON.parse(
        packageJson1Contents
      ) as PackageJson;
      const actualPackageJson2 = JSON.parse(
        packageJson2Contents
      ) as PackageJson;

      expect(
        actualPackageJson1.dependencies && actualPackageJson1.dependencies.foo
      ).toStrictEqual('^1.5.0');
      expect(
        actualPackageJson2.dependencies && actualPackageJson2.dependencies.foo
      ).toStrictEqual('^1.5.0');
    });
  });
});
