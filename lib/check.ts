import {
  calculateVersionsForEachDependency,
  calculateDependenciesAndVersions,
  filterOutIgnoredDependencies,
  fixVersionsMismatching,
} from './dependency-versions.js';
import { Dependencies, Options } from './types.js';
import { getPackages } from './workspace.js';

/**
 * Checks for inconsistencies across a workspace. Optionally fixes them.
 * @param path - path to the workspace root
 * @param options
 * @param options.fix - Whether to autofix inconsistencies (using latest version present)
 * @param options.ignoreDep - Dependency(s) to ignore mismatches for
 * @param options.ignoreDepPattern - RegExp(s) of dependency names to ignore mismatches for
 * @param options.ignorePackage - Workspace package(s) to ignore mismatches for
 * @param options.ignorePackagePattern - RegExp(s) of package names to ignore mismatches for
 * @param options.ignorePath - Workspace-relative path(s) of packages to ignore mismatches for
 * @param options.ignorePathPattern - RegExp(s) of workspace-relative path of packages to ignore mismatches for
 * @returns an object with the following properties:
 * - `dependencies`: An object mapping each dependency in the workspace to information about it including the versions found of it.
 */
export function check(
  path: string,
  options?: Options
): {
  dependencies: Dependencies;
} {
  const optionsWithDefaults = {
    fix: false,
    ignoreDep: [],
    ignoreDepPattern: [],
    ignorePackage: [],
    ignorePackagePattern: [],
    ignorePath: [],
    ignorePathPattern: [],
    ...options,
  };

  // Calculate.
  const packages = getPackages(
    path,
    optionsWithDefaults.ignorePackage,
    optionsWithDefaults.ignorePackagePattern.map((s) => new RegExp(s)),
    optionsWithDefaults.ignorePath,
    optionsWithDefaults.ignorePathPattern.map((s) => new RegExp(s))
  );

  const dependencies = calculateVersionsForEachDependency(packages);
  const dependenciesAndVersions =
    calculateDependenciesAndVersions(dependencies);
  const dependenciesAndVersionsWithMismatches = dependenciesAndVersions.filter(
    ({ versions }) => versions.length > 1
  );

  // Information about all dependencies.
  const dependenciesAndVersionsWithoutIgnored = filterOutIgnoredDependencies(
    dependenciesAndVersions,
    optionsWithDefaults.ignoreDep,
    optionsWithDefaults.ignoreDepPattern.map((s) => new RegExp(s))
  );

  // Information about mismatches.
  const dependenciesAndVersionsMismatchesWithoutIgnored =
    filterOutIgnoredDependencies(
      dependenciesAndVersionsWithMismatches,
      optionsWithDefaults.ignoreDep,
      optionsWithDefaults.ignoreDepPattern.map((s) => new RegExp(s))
    );
  const resultsAfterFix = fixVersionsMismatching(
    packages,
    dependenciesAndVersionsMismatchesWithoutIgnored,
    !optionsWithDefaults.fix // Do dry-run if not fixing.
  );
  const versionsMismatchingFixable = resultsAfterFix.fixable;

  return {
    // Information about all dependencies.
    dependencies: Object.fromEntries(
      dependenciesAndVersionsWithoutIgnored.map(({ dependency, versions }) => {
        return [
          dependency,
          {
            isFixable: versionsMismatchingFixable.some(
              (dep) => dep.dependency === dependency
            ),
            isMismatching: dependenciesAndVersionsMismatchesWithoutIgnored.some(
              (dep) => dep.dependency === dependency
            ),
            versions,
          },
        ];
      })
    ),
  };
}
