import semver from 'semver';
import editJsonFile from 'edit-json-file';
import { Package } from './package.js';

export type DependenciesToVersionsSeen = Map<
  string,
  { package: Package; version: string; isLocalPackageVersion: boolean }[]
>;

export type MismatchingDependencyVersions = Array<{
  dependency: string;
  versions: {
    version: string;
    packages: Package[];
  }[];
}>;

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
  packages: Package[]
): DependenciesToVersionsSeen {
  const dependenciesToVersionsSeen: DependenciesToVersionsSeen = new Map<
    string,
    { package: Package; version: string; isLocalPackageVersion: boolean }[]
  >();
  for (const package_ of packages) {
    recordDependencyVersionsForPackageJson(
      dependenciesToVersionsSeen,
      package_
    );
  }
  return dependenciesToVersionsSeen;
}

function recordDependencyVersionsForPackageJson(
  dependenciesToVersionsSeen: DependenciesToVersionsSeen,
  package_: Package
) {
  if (package_.packageJson.name && package_.packageJson.version) {
    recordDependencyVersion(
      dependenciesToVersionsSeen,
      package_.packageJson.name,
      package_.packageJson.version,
      package_,
      true
    );
  }

  if (package_.packageJson.dependencies) {
    for (const [dependency, dependencyVersion] of Object.entries(
      package_.packageJson.dependencies
    )) {
      recordDependencyVersion(
        dependenciesToVersionsSeen,
        dependency,
        dependencyVersion,
        package_
      );
    }
  }

  if (package_.packageJson.devDependencies) {
    for (const [dependency, dependencyVersion] of Object.entries(
      package_.packageJson.devDependencies
    )) {
      recordDependencyVersion(
        dependenciesToVersionsSeen,
        dependency,
        dependencyVersion,
        package_
      );
    }
  }
}

function recordDependencyVersion(
  dependenciesToVersionsSeen: DependenciesToVersionsSeen,
  dependency: string,
  version: string,
  package_: Package,
  isLocalPackageVersion = false
) {
  if (!dependenciesToVersionsSeen.has(dependency)) {
    dependenciesToVersionsSeen.set(dependency, []);
  }
  const list = dependenciesToVersionsSeen.get(dependency);
  /* istanbul ignore if */
  if (list) {
    // `list` should always exist at this point, this if statement is just to please TypeScript.
    list.push({ package: package_, version, isLocalPackageVersion });
  }
}

export function calculateMismatchingVersions(
  dependencyVersions: DependenciesToVersionsSeen
): MismatchingDependencyVersions {
  // Loop through all dependencies seen.
  return [...dependencyVersions.entries()]
    .sort()
    .flatMap(([dependency, versionObjectsForDep]) => {
      /* istanbul ignore if */
      if (!versionObjectsForDep) {
        // Should always exist at this point, this if statement is just to please TypeScript.
        return [];
      }

      // Check what versions we have seen for this dependency.
      let versions = versionObjectsForDep
        .filter((versionObject) => !versionObject.isLocalPackageVersion)
        .map((versionObject) => versionObject.version);

      // Check if this dependency is a local package.
      const localPackageVersions = versionObjectsForDep
        .filter((versionObject) => versionObject.isLocalPackageVersion)
        .map((versionObject) => versionObject.version);

      if (
        localPackageVersions.length === 1 &&
        versions.some(
          (uniqueVersion) =>
            !semver.satisfies(localPackageVersions[0], uniqueVersion)
        )
      ) {
        // If we saw a version for this dependency that isn't compatible with its actual local package version, add the local package version to the list of versions seen.
        versions = [...versions, ...localPackageVersions];
      }

      // Calculate unique versions seen for this dependency.
      const uniqueVersions = [...new Set(versions)].sort(
        compareVersionRangesSafe
      );

      // If we saw more than one unique version for this dependency, we found an inconsistency.
      if (uniqueVersions.length > 1) {
        const uniqueVersionsWithInfo = versionsObjectsWithSortedPackages(
          uniqueVersions,
          versionObjectsForDep
        );
        return {
          dependency,
          versions: uniqueVersionsWithInfo,
        };
      }

      return [];
    });
}

function versionsObjectsWithSortedPackages(
  versions: string[],
  versionObjects: {
    package: Package;
    version: string;
    isLocalPackageVersion: boolean;
  }[]
) {
  return versions.map((version) => {
    const matchingVersionObjects = versionObjects.filter(
      (versionObject) => versionObject.version === version
    );
    return {
      version,
      packages: matchingVersionObjects
        .map((object) => object.package)
        .sort(Package.comparator),
    };
  });
}

export function filterOutIgnoredDependencies(
  mismatchingVersions: MismatchingDependencyVersions,
  ignoredDependencies: string[],
  ignoredDependencyPatterns: RegExp[]
): MismatchingDependencyVersions {
  for (const ignoreDependency of ignoredDependencies) {
    if (
      !mismatchingVersions.some(
        (mismatchingVersion) =>
          mismatchingVersion.dependency === ignoreDependency
      )
    ) {
      throw new Error(
        `Specified option '--ignore-dep ${ignoreDependency}', but no version mismatches detected for this dependency.`
      );
    }
  }

  for (const ignoredDependencyPattern of ignoredDependencyPatterns) {
    if (
      !mismatchingVersions.some((mismatchingVersion) =>
        ignoredDependencyPattern.test(mismatchingVersion.dependency)
      )
    ) {
      throw new Error(
        `Specified option '--ignore-dep-pattern ${ignoredDependencyPattern}', but no matching dependencies with version mismatches detected.`
      );
    }
  }

  if (ignoredDependencies.length > 0 || ignoredDependencyPatterns.length > 0) {
    return mismatchingVersions.filter(
      (mismatchingVersion) =>
        !ignoredDependencies.includes(mismatchingVersion.dependency) &&
        !ignoredDependencyPatterns.some((ignoreDependencyPattern) =>
          mismatchingVersion.dependency.match(ignoreDependencyPattern)
        )
    );
  }

  return mismatchingVersions;
}

function writeDependencyVersion(
  packageJsonPath: string,
  packageJsonEndsInNewline: boolean,
  isDependency: boolean, // true for dependency, false for dev-dependency.
  dependencyName: string,
  newVersion: string
) {
  const packageJsonEditor = editJsonFile(packageJsonPath, {
    autosave: true,
    stringify_eol: packageJsonEndsInNewline, // If a newline at end of file exists, keep it.
  });

  packageJsonEditor.set(
    `${
      isDependency ? 'dependencies' : 'devDependencies'
    }.${dependencyName.replace(
      /\./g, // Escape dots to avoid creating unwanted nested properties.
      '\\.'
    )}`,
    newVersion,
    { preservePaths: false } // Disable `preservePaths` so that nested dependency names (i.e. @types/jest) won't prevent the intentional dot in the path we provide from working.
  );
}

export function fixMismatchingVersions(
  packages: Package[],
  mismatchingVersions: MismatchingDependencyVersions
): {
  fixed: MismatchingDependencyVersions;
  notFixed: MismatchingDependencyVersions;
} {
  const fixed = [];
  const notFixed = [];
  // Loop through each dependency that has a mismatching versions.
  for (const mismatchingVersion of mismatchingVersions) {
    // Decide what version we should fix to.
    const versions = mismatchingVersion.versions.map(
      (object) => object.version
    );
    let fixedVersion;
    try {
      fixedVersion = getLatestVersion(versions);
    } catch {
      // Skip this dependency.
      notFixed.push(mismatchingVersion);
      continue;
    }

    // If this dependency is from a local package and the version we want to fix to is higher than the actual package version, skip it.
    const localPackage = packages.find(
      (package_) => package_.name === mismatchingVersion.dependency
    );
    if (
      localPackage &&
      localPackage.packageJson.version &&
      compareVersionRanges(fixedVersion, localPackage.packageJson.version) > 0
    ) {
      // Skip this dependency.
      notFixed.push(mismatchingVersion);
      continue;
    }

    if (localPackage && localPackage.packageJson.version === fixedVersion) {
      // When fixing to the version of a local package, don't just use the bare package version, but include the highest range type we have seen.
      const highestRangeTypeSeen = getHighestRangeType(
        versions.map((versionRange) => versionRangeToRange(versionRange))
      );
      fixedVersion = `${highestRangeTypeSeen}${semver.coerce(fixedVersion)}`;
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
        writeDependencyVersion(
          package_.pathPackageJson,
          package_.packageJsonEndsInNewline,
          false,
          mismatchingVersion.dependency,
          fixedVersion
        );
        isFixed = true;
      }

      if (
        package_.packageJson.dependencies &&
        package_.packageJson.dependencies[mismatchingVersion.dependency] &&
        package_.packageJson.dependencies[mismatchingVersion.dependency] !==
          fixedVersion
      ) {
        writeDependencyVersion(
          package_.pathPackageJson,
          package_.packageJsonEndsInNewline,
          true,
          mismatchingVersion.dependency,
          fixedVersion
        );
        isFixed = true;
      }
    }

    if (isFixed) {
      fixed.push(mismatchingVersion);
    }
  }

  return {
    fixed,
    notFixed,
  };
}

// This version doesn't throw for when we want to ignore invalid versions that might be present.
export function compareVersionRangesSafe(a: string, b: string): 0 | -1 | 1 {
  try {
    return compareVersionRanges(a, b);
  } catch {
    return 0;
  }
}

// Compare semver version ranges like ^1.0.0, ~2.5.0, 3.0.0, etc.
export function compareVersionRanges(a: string, b: string): 0 | -1 | 1 {
  // Coerce to normalized version without any range prefix.
  const aVersion = semver.coerce(a);
  const bVersion = semver.coerce(b);
  if (!aVersion) {
    throw new Error(`Invalid Version: ${a}`);
  }
  if (!bVersion) {
    throw new Error(`Invalid Version: ${b}`);
  }

  if (semver.eq(aVersion, bVersion)) {
    // Same version, so decide which range is considered higher.
    const aRange = versionRangeToRange(a);
    const bRange = versionRangeToRange(b);
    return compareRanges(aRange, bRange);
  }

  // Greater version considered higher.
  return semver.gt(aVersion, bVersion) ? 1 : -1;
}

const RANGE_PRECEDENCE = ['~', '^']; // Lowest to highest.

// Compare semver ranges like ^, ~, etc.
export function compareRanges(aRange: string, bRange: string): 0 | -1 | 1 {
  const aRangePrecedence = RANGE_PRECEDENCE.indexOf(aRange);
  const bRangePrecedence = RANGE_PRECEDENCE.indexOf(bRange);
  if (aRangePrecedence > bRangePrecedence) {
    return 1;
  } else if (aRangePrecedence < bRangePrecedence) {
    return -1;
  }
  return 0;
}

// Example input: ^1.0.0, output: ^
export function versionRangeToRange(versionRange: string): string {
  const match = versionRange.match(/^\D+/);
  return match ? match[0] : '';
}

export function getLatestVersion(versions: string[]): string {
  const sortedVersions = versions.sort(compareVersionRanges);
  return sortedVersions[sortedVersions.length - 1]; // Latest version will be sorted to end of list.
}

// Example input: ['~', '^'], output: '^'
export function getHighestRangeType(ranges: string[]): string {
  const sorted = ranges.sort(compareRanges);
  return sorted[sorted.length - 1]; // Range with highest precedence will be sorted to end of list.
}
