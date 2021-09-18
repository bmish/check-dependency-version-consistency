import semver from 'semver';
import editJsonFile from 'edit-json-file';
import { Package } from './package.js';

export type DependenciesToVersionsSeen = Map<
  string,
  { package: Package; version: string }[]
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
    { package: Package; version: string }[]
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
  package_: Package
) {
  if (!dependenciesToVersionsSeen.has(dependency)) {
    dependenciesToVersionsSeen.set(dependency, []);
  }
  const list = dependenciesToVersionsSeen.get(dependency);
  /* istanbul ignore if */
  if (list) {
    // `list` should always exist at this point, this if statement is just to please TypeScript.
    list.push({ package: package_, version });
  }
}

export function calculateMismatchingVersions(
  dependencyVersions: DependenciesToVersionsSeen
): MismatchingDependencyVersions {
  return [...dependencyVersions.keys()]
    .sort()
    .map((dependency) => {
      const versionList = dependencyVersions.get(dependency);
      /* istanbul ignore if */
      if (!versionList) {
        // `versionList` should always exist at this point, this if statement is just to please TypeScript.
        return undefined;
      }

      const uniqueVersions = [
        ...new Set(versionList.map((object) => object.version)),
      ].sort();

      if (uniqueVersions.length > 1) {
        const uniqueVersionsWithInfo = uniqueVersions.map((uniqueVersion) => {
          const matchingVersions = versionList.filter(
            (object) => object.version === uniqueVersion
          );
          return {
            version: uniqueVersion,
            packages: matchingVersions
              .map((object) => object.package)
              .sort(Package.comparator),
          };
        });
        return { dependency, versions: uniqueVersionsWithInfo };
      }

      return undefined;
    })
    .filter((object) => object !== undefined) as MismatchingDependencyVersions;
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
        `Specified option '--ignore-dep ${ignoreDependency}', but no mismatches detected.`
      );
    }
  }
  return mismatchingVersions.filter(
    (mismatchingVersion) =>
      !ignoredDependencies.includes(mismatchingVersion.dependency) &&
      !ignoredDependencyPatterns.some((ignoreDependencyPattern) =>
        mismatchingVersion.dependency.match(ignoreDependencyPattern)
      )
  );
}

export function fixMismatchingVersions(
  packages: Package[],
  mismatchingVersions: MismatchingDependencyVersions
): MismatchingDependencyVersions {
  // Return any mismatching versions that are still present after attempting fixes.
  return mismatchingVersions
    .map((mismatchingVersion) => {
      const versions = mismatchingVersion.versions.map(
        (object) => object.version
      );
      let sortedVersions;
      try {
        sortedVersions = versions.sort(compareRanges);
      } catch {
        // Unable to sort so skip this dependency (return it to indicate it was not fixed).
        return mismatchingVersion;
      }
      const fixedVersion = sortedVersions[sortedVersions.length - 1]; // Highest version will be sorted to end of list.

      for (const package_ of packages) {
        if (
          package_.packageJson.devDependencies &&
          package_.packageJson.devDependencies[mismatchingVersion.dependency] &&
          package_.packageJson.devDependencies[
            mismatchingVersion.dependency
          ] !== fixedVersion
        ) {
          const packageJsonEditor = editJsonFile(package_.packageJsonPath, {
            autosave: true,
            stringify_eol: package_.packageJsonEndsInNewline, // If a newline at end of file exists, keep it.
          });

          packageJsonEditor.set(
            `devDependencies.${mismatchingVersion.dependency.replace(
              /\./g, // Escape dots.
              '\\.'
            )}`,
            fixedVersion,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore (@types/edit-json-file not available for 1.7)
            { preservePaths: false }
          );
        }

        if (
          package_.packageJson.dependencies &&
          package_.packageJson.dependencies[mismatchingVersion.dependency] &&
          package_.packageJson.dependencies[mismatchingVersion.dependency] !==
            fixedVersion
        ) {
          const packageJsonEditor = editJsonFile(package_.packageJsonPath, {
            autosave: true,
            stringify_eol: package_.packageJsonEndsInNewline, // If a newline at end of file exists, keep it.
          });
          packageJsonEditor.set(
            `dependencies.${mismatchingVersion.dependency.replace(
              /\./g, // Escape dots.
              '\\.'
            )}`,
            fixedVersion,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore (@types/edit-json-file not available for 1.7)
            { preservePaths: false }
          );
        }
      }

      // Fixed successfully.
      return undefined;
    })
    .filter((item) => item !== undefined) as MismatchingDependencyVersions;
}

export function compareRanges(a: string, b: string): 0 | -1 | 1 {
  // Strip range and coerce to normalized version.
  const aVersion = semver.coerce(a.replace(/^[\^~]/, ''));
  const bVersion = semver.coerce(b.replace(/^[\^~]/, ''));
  if (!aVersion) {
    throw new Error(`Invalid Version: ${a}`);
  }
  if (!bVersion) {
    throw new Error(`Invalid Version: ${b}`);
  }

  if (semver.eq(aVersion, bVersion)) {
    // Same version, but wider range considered higher.
    if (a.startsWith('^') && !b.startsWith('^')) {
      return 1;
    } else if (!a.startsWith('^') && b.startsWith('^')) {
      return -1;
    } else if (a.startsWith('~') && !b.startsWith('~')) {
      return 1;
    } else if (!a.startsWith('~') && b.startsWith('~')) {
      return -1;
    }

    // Same version, same range.
    return 0;
  }

  // Greater version considered higher.
  return semver.gt(aVersion, bVersion) ? 1 : -1;
}
