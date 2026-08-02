import { buildDependencies } from './dependency-versions.js';
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
    options?.depType?.some((dt) => !Object.keys(DEPENDENCY_TYPE).includes(dt))
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
      options?.depType && options.depType.length > 0
        ? options.depType
        : DEFAULT_DEP_TYPES,
  };

  const packages = getPackages(
    path,
    optionsWithDefaults.ignorePackage,
    optionsWithDefaults.ignorePackagePattern.map((s) => new RegExp(s)),
    optionsWithDefaults.ignorePath,
    optionsWithDefaults.ignorePathPattern.map((s) => new RegExp(s)),
  );

  return {
    dependencies: buildDependencies(packages, {
      depType: optionsWithDefaults.depType.map((dt) => DEPENDENCY_TYPE[dt]),
      ignoreDep: optionsWithDefaults.ignoreDep,
      ignoreDepPattern: optionsWithDefaults.ignoreDepPattern.map(
        (s) => new RegExp(s),
      ),
      fix: optionsWithDefaults.fix,
    }),
  };
}
