import editJsonFile from 'edit-json-file';
import semver from 'semver';
import { DEFAULT_DEP_TYPES } from './defaults.js';
import { Package } from './package.js';
import {
  compareVersionRanges,
  compareVersionRangesSafe,
  getHighestRangeType,
  getIncreasedLatestVersion,
  versionRangeToRange,
} from './semver.js';
import { DEPENDENCY_TYPE } from './types.js';
import type { DependencyType } from './types.js';

type DependenciesToVersionsSeen = Map<
  string,
  { package: Package; version: string; isLocalPackageVersion: boolean }[] // Array can't be readonly since we are adding to it.
>;

/** A dependency, the versions present of it, and the packages each of those versions are seen in. */
type DependencyAndVersions = {
  dependency: string;
  readonly versions: {
    version: string;
    packages: readonly Package[];
  }[];
};

/**
 * Creates a map of each dependency in the workspace to an array of the packages it is used in.
 *
 * Example of such a map represented as an object:
 *
 * {
 *  'ember-cli': [
 *     { package: Package...'@scope/package1', version: '~3.18.0' },
 *     { package: Package...'@scope/package2', version: '~3.18.0' }
 *  ]
 *  'eslint': [
 *     { package: Package...'@scope/package1', version: '^7.0.0' },
 *     { package: Package...'@scope/package2', version: '^7.0.0' }
 *  ]
 * }
 */
export function calculateVersionsForEachDependency(
  packages: readonly Package[],
  depType: readonly DependencyType[] = DEFAULT_DEP_TYPES,
): DependenciesToVersionsSeen {
  const dependenciesToVersionsSeen: DependenciesToVersionsSeen = new Map<
    string,
    { package: Package; version: string; isLocalPackageVersion: boolean }[]
  >();
  for (const package_ of packages) {
    recordDependencyVersionsForPackageJson(
      dependenciesToVersionsSeen,
      package_,
      depType,
    );
  }
  return dependenciesToVersionsSeen;
}

// eslint-disable-next-line complexity
function recordDependencyVersionsForPackageJson(
  dependenciesToVersionsSeen: DependenciesToVersionsSeen,
  package_: Package,
  depType: readonly DependencyType[],
) {
  if (package_.packageJson.name && package_.packageJson.version) {
    recordDependencyVersion(
      dependenciesToVersionsSeen,
      package_.packageJson.name,
      package_.packageJson.version,
      package_,
      true,
    );
  }

  if (
    depType.includes(DEPENDENCY_TYPE.dependencies) &&
    package_.packageJson.dependencies
  ) {
    for (const [dependency, dependencyVersion] of Object.entries(
      package_.packageJson.dependencies,
    )) {
      if (dependencyVersion) {
        recordDependencyVersion(
          dependenciesToVersionsSeen,
          dependency,
          dependencyVersion,
          package_,
        );
      }
    }
  }

  if (
    depType.includes(DEPENDENCY_TYPE.devDependencies) &&
    package_.packageJson.devDependencies
  ) {
    for (const [dependency, dependencyVersion] of Object.entries(
      package_.packageJson.devDependencies,
    )) {
      if (dependencyVersion) {
        recordDependencyVersion(
          dependenciesToVersionsSeen,
          dependency,
          dependencyVersion,
          package_,
        );
      }
    }
  }

  if (
    depType.includes(DEPENDENCY_TYPE.optionalDependencies) &&
    package_.packageJson.optionalDependencies
  ) {
    for (const [dependency, dependencyVersion] of Object.entries(
      package_.packageJson.optionalDependencies,
    )) {
      if (dependencyVersion) {
        recordDependencyVersion(
          dependenciesToVersionsSeen,
          dependency,
          dependencyVersion,
          package_,
        );
      }
    }
  }

  if (
    depType.includes(DEPENDENCY_TYPE.peerDependencies) &&
    package_.packageJson.peerDependencies
  ) {
    for (const [dependency, dependencyVersion] of Object.entries(
      package_.packageJson.peerDependencies,
    )) {
      if (dependencyVersion) {
        recordDependencyVersion(
          dependenciesToVersionsSeen,
          dependency,
          dependencyVersion,
          package_,
        );
      }
    }
  }

  if (
    depType.includes(DEPENDENCY_TYPE.resolutions) &&
    package_.packageJson.resolutions
  ) {
    for (const [dependency, dependencyVersion] of Object.entries(
      package_.packageJson.resolutions,
    )) {
      if (dependencyVersion) {
        recordDependencyVersion(
          dependenciesToVersionsSeen,
          dependency,
          dependencyVersion,
          package_,
        );
      }
    }
  }
}

function recordDependencyVersion(
  dependenciesToVersionsSeen: DependenciesToVersionsSeen,
  dependency: string,
  version: string,
  package_: Package,
  isLocalPackageVersion = false,
) {
  if (!dependenciesToVersionsSeen.has(dependency)) {
    dependenciesToVersionsSeen.set(dependency, []);
  }
  const list = dependenciesToVersionsSeen.get(dependency);
  /* v8 ignore start */
  if (list) {
    // `list` should always exist at this point, this if statement is just to please TypeScript.
    list.push({ package: package_, version, isLocalPackageVersion });
  }
  /* v8 ignore stop */
}

export function calculateDependenciesAndVersions(
  dependencyVersions: DependenciesToVersionsSeen,
): readonly DependencyAndVersions[] {
  // Loop through all dependencies seen.
  return [...dependencyVersions.entries()]
    .toSorted((a, b) => a[0].localeCompare(b[0]))
    .flatMap(([dependency, versionObjectsForDep]) => {
      // Check what versions we have seen for this dependency.
      let versions = versionObjectsForDep
        .filter((versionObject) => !versionObject.isLocalPackageVersion)
        .map((versionObject) => versionObject.version);

      // Check if this dependency is a local package.
      const localPackageVersions = versionObjectsForDep
        .filter((versionObject) => versionObject.isLocalPackageVersion)
        .map((versionObject) => versionObject.version);
      const localPackageVersion = localPackageVersions[0];
      const allVersionsHaveWorkspacePrefix = versions.every((version) =>
        version.startsWith('workspace:'),
      );
      const hasIncompatibilityWithLocalPackageVersion =
        localPackageVersion !== undefined &&
        versions.some(
          (version) => !semver.satisfies(localPackageVersion, version),
        );
      if (
        localPackageVersions.length === 1 &&
        !allVersionsHaveWorkspacePrefix &&
        hasIncompatibilityWithLocalPackageVersion
      ) {
        // If we saw a version for this dependency that isn't compatible with its actual local package version, add the local package version to the list of versions seen.
        // Note that using the `workspace:` prefix to refer to the local package version is allowed.
        versions = [...versions, ...localPackageVersions];
      }

      // Calculate unique versions seen for this dependency.
      const uniqueVersions = [...new Set(versions)].toSorted(
        compareVersionRangesSafe,
      );

      const uniqueVersionsWithInfo = versionsObjectsWithSortedPackages(
        uniqueVersions,
        versionObjectsForDep,
      );
      return {
        dependency,
        versions: uniqueVersionsWithInfo,
      };
    });
}

function versionsObjectsWithSortedPackages(
  versions: readonly string[],
  versionObjects: readonly {
    package: Package;
    version: string;
    isLocalPackageVersion: boolean;
  }[],
) {
  return versions.map((version) => {
    const matchingVersionObjects = versionObjects.filter(
      (versionObject) => versionObject.version === version,
    );
    return {
      version,
      packages: matchingVersionObjects
        .map((object) => object.package)
        .toSorted((a, b) => Package.comparator(a, b)),
    };
  });
}

const HARDCODED_IGNORED_DEPENDENCIES = new Set([
  '//', // May be used to add comments to package.json files.
]);
export function filterOutIgnoredDependencies(
  mismatchingVersions: readonly DependencyAndVersions[],
  ignoredDependencies: readonly string[],
  ignoredDependencyPatterns: readonly RegExp[],
): readonly DependencyAndVersions[] {
  for (const ignoreDependency of ignoredDependencies) {
    if (
      !mismatchingVersions.some(
        (mismatchingVersion) =>
          mismatchingVersion.dependency === ignoreDependency,
      )
    ) {
      throw new Error(
        `Specified option '--ignore-dep ${ignoreDependency}', but no version mismatches detected for this dependency.`,
      );
    }
  }

  for (const ignoredDependencyPattern of ignoredDependencyPatterns) {
    if (
      !mismatchingVersions.some((mismatchingVersion) =>
        ignoredDependencyPattern.test(mismatchingVersion.dependency),
      )
    ) {
      throw new Error(
        `Specified option '--ignore-dep-pattern ${String(
          ignoredDependencyPattern,
        )}', but no matching dependencies with version mismatches detected.`,
      );
    }
  }

  if (
    ignoredDependencies.length > 0 ||
    ignoredDependencyPatterns.length > 0 ||
    mismatchingVersions.some((mismatchingVersion) =>
      HARDCODED_IGNORED_DEPENDENCIES.has(mismatchingVersion.dependency),
    )
  ) {
    return mismatchingVersions.filter(
      (mismatchingVersion) =>
        !ignoredDependencies.includes(mismatchingVersion.dependency) &&
        !ignoredDependencyPatterns.some((ignoreDependencyPattern) =>
          mismatchingVersion.dependency.match(ignoreDependencyPattern),
        ) &&
        !HARDCODED_IGNORED_DEPENDENCIES.has(mismatchingVersion.dependency),
    );
  }

  return mismatchingVersions;
}

function writeDependencyVersion(
  packageJsonPath: string,
  packageJsonEndsInNewline: boolean,
  type: DependencyType,
  dependencyName: string,
  newVersion: string,
) {
  const packageJsonEditor = editJsonFile(packageJsonPath, {
    autosave: true,
    stringify_eol: packageJsonEndsInNewline, // If a newline at end of file exists, keep it.
  });

  packageJsonEditor.set(
    `${type}.${dependencyName.replaceAll(
      '.', // Escape dots to avoid creating unwanted nested properties.
      String.raw`\.`,
    )}`,
    newVersion,
    { preservePaths: false }, // Disable `preservePaths` so that nested dependency names (i.e. @types/jest) won't prevent the intentional dot in the path we provide from working.
  );
}

// eslint-disable-next-line complexity
export function fixVersionsMismatching(
  packages: readonly Package[],
  mismatchingVersions: readonly DependencyAndVersions[],
  dryrun = false,
): {
  fixable: readonly DependencyAndVersions[];
  notFixable: readonly DependencyAndVersions[];
} {
  const fixable: DependencyAndVersions[] = [];
  const notFixable: DependencyAndVersions[] = [];
  // Loop through each dependency that has a mismatching versions.
  for (const mismatchingVersion of mismatchingVersions) {
    // Decide what version we should fix to.
    const versions = mismatchingVersion.versions.map(
      (object) => object.version,
    );
    let fixedVersion;
    try {
      fixedVersion = getIncreasedLatestVersion(versions);
    } catch {
      // Skip this dependency.
      notFixable.push(mismatchingVersion);
      continue;
    }

    // If this dependency is from a local package and the version we want to fix to is higher than the actual package version, skip it.
    const localPackage = packages.find(
      (package_) => package_.name === mismatchingVersion.dependency,
    );
    if (
      localPackage &&
      localPackage.packageJson.version &&
      compareVersionRanges(fixedVersion, localPackage.packageJson.version) > 0
    ) {
      // Skip this dependency.
      notFixable.push(mismatchingVersion);
      continue;
    }

    if (localPackage && localPackage.packageJson.version === fixedVersion) {
      // When fixing to the version of a local package, don't just use the bare package version, but include the highest range type we have seen.
      const highestRangeTypeSeen = getHighestRangeType(
        versions.map((versionRange) => versionRangeToRange(versionRange)),
      );
      fixedVersion = `${highestRangeTypeSeen}${String(
        semver.coerce(fixedVersion),
      )}`;
    }

    // Update the dependency version in each package.json.
    let isFixed = false;
    for (const package_ of packages) {
      if (
        package_.packageJson.devDependencies &&
        package_.packageJson.devDependencies[mismatchingVersion.dependency] &&
        package_.packageJson.devDependencies[mismatchingVersion.dependency] !==
          fixedVersion
      ) {
        if (!dryrun) {
          writeDependencyVersion(
            package_.pathPackageJson,
            package_.packageJsonEndsInNewline,
            DEPENDENCY_TYPE.devDependencies,
            mismatchingVersion.dependency,
            fixedVersion,
          );
        }
        isFixed = true;
      }

      if (
        package_.packageJson.dependencies &&
        package_.packageJson.dependencies[mismatchingVersion.dependency] &&
        package_.packageJson.dependencies[mismatchingVersion.dependency] !==
          fixedVersion
      ) {
        if (!dryrun) {
          writeDependencyVersion(
            package_.pathPackageJson,
            package_.packageJsonEndsInNewline,
            DEPENDENCY_TYPE.dependencies,
            mismatchingVersion.dependency,
            fixedVersion,
          );
        }
        isFixed = true;
      }

      if (
        package_.packageJson.optionalDependencies &&
        package_.packageJson.optionalDependencies[
          mismatchingVersion.dependency
        ] &&
        package_.packageJson.optionalDependencies[
          mismatchingVersion.dependency
        ] !== fixedVersion
      ) {
        if (!dryrun) {
          writeDependencyVersion(
            package_.pathPackageJson,
            package_.packageJsonEndsInNewline,
            DEPENDENCY_TYPE.optionalDependencies,
            mismatchingVersion.dependency,
            fixedVersion,
          );
        }
        isFixed = true;
      }

      if (
        package_.packageJson.peerDependencies &&
        package_.packageJson.peerDependencies[mismatchingVersion.dependency] &&
        package_.packageJson.peerDependencies[mismatchingVersion.dependency] !==
          fixedVersion
      ) {
        if (!dryrun) {
          writeDependencyVersion(
            package_.pathPackageJson,
            package_.packageJsonEndsInNewline,
            DEPENDENCY_TYPE.peerDependencies,
            mismatchingVersion.dependency,
            fixedVersion,
          );
        }
        isFixed = true;
      }

      if (
        package_.packageJson.resolutions &&
        package_.packageJson.resolutions[mismatchingVersion.dependency] &&
        package_.packageJson.resolutions[mismatchingVersion.dependency] !==
          fixedVersion
      ) {
        if (!dryrun) {
          writeDependencyVersion(
            package_.pathPackageJson,
            package_.packageJsonEndsInNewline,
            DEPENDENCY_TYPE.resolutions,
            mismatchingVersion.dependency,
            fixedVersion,
          );
        }
        isFixed = true;
      }
    }

    if (isFixed) {
      fixable.push(mismatchingVersion);
    }
  }

  return {
    fixable,
    notFixable,
  };
}
