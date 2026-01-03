import {
  calculateVersionsForEachDependency,
  calculateDependenciesAndVersions,
  filterOutIgnoredDependencies,
  fixVersionsMismatching,
} from './dependency-versions.js';
import { DEPENDENCY_TYPE } from './types.js';
import type { Dependencies, Options } from './types.js';
import { getPackages } from './workspace.js';
import { DEFAULT_DEP_TYPES } from './defaults.js';

/**
 * Checks for inconsistencies across a workspace. Optionally fixes them.
 * @param path - path to the workspace root
 * @param options
 * @param options.depType - Dependency type(s) to check
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
  options?: Options,
): {
  dependencies: Dependencies;
} {
  if (
    options &&
    options.depType &&
    options.depType.some((dt) => !Object.keys(DEPENDENCY_TYPE).includes(dt))
  ) {
    throw new Error(
      `Invalid depType provided. Choices are: ${Object.keys(
        DEPENDENCY_TYPE,
      ).join(', ')}.`,
    );
  }

  const optionsWithDefaults = {
    fix: false,
    ignoreDep: [],
    ignoreDepPattern: [],
    ignorePackage: [],
    ignorePackagePattern: [],
    ignorePath: [],
    ignorePathPattern: [],
    ...options,

    // Fallback to default if no depType(s) provided.
    depType:
      options && options.depType && options.depType.length > 0
        ? options.depType
        : DEFAULT_DEP_TYPES,
  };

  // Calculate.
  const packages = getPackages(
    path,
    optionsWithDefaults.ignorePackage,
    optionsWithDefaults.ignorePackagePattern.map((s) => new RegExp(s)),
    optionsWithDefaults.ignorePath,
    optionsWithDefaults.ignorePathPattern.map((s) => new RegExp(s)),
  );

  const dependencies = calculateVersionsForEachDependency(
    packages,
    optionsWithDefaults.depType.map((dt) => DEPENDENCY_TYPE[dt]), // Convert string to enum.
  );
  const dependenciesAndVersions =
    calculateDependenciesAndVersions(dependencies);
  const dependenciesAndVersionsWithMismatches = dependenciesAndVersions.filter(
    ({ versions }) => versions.length > 1,
  );

  // Information about all dependencies.
  const dependenciesAndVersionsWithoutIgnored = filterOutIgnoredDependencies(
    dependenciesAndVersions,
    optionsWithDefaults.ignoreDep,
    optionsWithDefaults.ignoreDepPattern.map((s) => new RegExp(s)),
  );

  // Information about mismatches.
  const dependenciesAndVersionsMismatchesWithoutIgnored =
    filterOutIgnoredDependencies(
      dependenciesAndVersionsWithMismatches,
      optionsWithDefaults.ignoreDep,
      optionsWithDefaults.ignoreDepPattern.map((s) => new RegExp(s)),
    );
  const resultsAfterFix = fixVersionsMismatching(
    packages,
    dependenciesAndVersionsMismatchesWithoutIgnored,
    !optionsWithDefaults.fix, // Do dry-run if not fixing.
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
              (dep) => dep.dependency === dependency,
            ),
            isMismatching: dependenciesAndVersionsMismatchesWithoutIgnored.some(
              (dep) => dep.dependency === dependency,
            ),
            versions,
          },
        ];
      }),
    ),
  };
}
