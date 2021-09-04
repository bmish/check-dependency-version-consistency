import { readFileSync, existsSync } from 'node:fs';
import type { PackageJson } from 'type-fest';
import { getPackageJsonPaths } from './workspace.js';
import semver from 'semver';
import editJsonFile from 'edit-json-file';

export type DependenciesToVersionsSeen = Map<
  string,
  { title: string; version: string }[]
>;

export type MismatchingDependencyVersions = Array<{
  dependency: string;
  versions: {
    version: string;
    count: number;
  }[];
}>;

/**
 * Creates a map of each dependency in the workspace to an array of the packages it is used in.
 *
 * Example of such a map represented as an object:
 *
 * {
 *  'ember-cli': [
 *     { title: '@scope/package1/package.json', version: '~3.18.0' },
 *     { title: '@scope/package2/package.json', version: '~3.18.0' }
 *  ]
 *  'eslint': [
 *     { title: '@scope/package1/package.json', version: '^7.0.0' },
 *     { title: '@scope/package2/package.json', version: '^7.0.0' }
 *  ]
 * }
 */
export function calculateVersionsForEachDependency(
  root: string
): DependenciesToVersionsSeen {
  const dependenciesToVersionsSeen: DependenciesToVersionsSeen = new Map<
    string,
    { title: string; version: string }[]
  >();
  getPackageJsonPaths(root).forEach((packageJsonPath) =>
    recordDependencyVersionsForPackageJson(
      dependenciesToVersionsSeen,
      packageJsonPath,
      root
    )
  );
  return dependenciesToVersionsSeen;
}

function recordDependencyVersionsForPackageJson(
  dependenciesToVersionsSeen: DependenciesToVersionsSeen,
  packageJsonPath: string,
  root: string
) {
  if (!existsSync(packageJsonPath)) {
    // Ignore empty package.
    return;
  }

  const title = packageJsonPath.replace(`${root}/`, '');
  const packageJson: PackageJson = JSON.parse(
    readFileSync(packageJsonPath, 'utf-8')
  );

  if (packageJson.dependencies) {
    for (const [dependency, dependencyVersion] of Object.entries(
      packageJson.dependencies
    )) {
      recordDependencyVersion(
        dependenciesToVersionsSeen,
        dependency,
        title,
        dependencyVersion
      );
    }
  }

  if (packageJson.devDependencies) {
    for (const [dependency, dependencyVersion] of Object.entries(
      packageJson.devDependencies
    )) {
      recordDependencyVersion(
        dependenciesToVersionsSeen,
        dependency,
        title,
        dependencyVersion
      );
    }
  }
}

function recordDependencyVersion(
  dependenciesToVersionsSeen: DependenciesToVersionsSeen,
  dependency: string,
  title: string,
  version: string
) {
  if (!dependenciesToVersionsSeen.has(dependency)) {
    dependenciesToVersionsSeen.set(dependency, []);
  }
  const list = dependenciesToVersionsSeen.get(dependency);
  /* istanbul ignore if */
  if (list) {
    // `list` should always exist at this point, this if statement is just to please TypeScript.
    list.push({ title, version });
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
        ...new Set(versionList.map((obj) => obj.version)),
      ].sort();
      const uniqueVersionsWithCounts = uniqueVersions.map((uniqueVersion) => ({
        version: uniqueVersion,
        count: versionList.filter((obj) => obj.version === uniqueVersion)
          .length,
      }));
      if (uniqueVersions.length > 1) {
        return { dependency, versions: uniqueVersionsWithCounts };
      }

      return undefined;
    })
    .filter((obj) => obj !== undefined) as MismatchingDependencyVersions;
}

export function filterOutIgnoredDependencies(
  mismatchingVersions: MismatchingDependencyVersions,
  ignoredDependencies: string[]
): MismatchingDependencyVersions {
  ignoredDependencies.forEach((ignoreDependency) => {
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
  });
  return mismatchingVersions.filter(
    (mismatchingVersion) =>
      !ignoredDependencies.includes(mismatchingVersion.dependency)
  );
}

export function fixMismatchingVersions(
  root: string,
  mismatchingVersions: MismatchingDependencyVersions
): MismatchingDependencyVersions {
  const packageJsonPaths = getPackageJsonPaths(root);

  // Return any mismatching versions that are still present after attempting fixes.
  return mismatchingVersions
    .map((mismatchingVersion) => {
      const versions = mismatchingVersion.versions.map(
        (versionAndCount) => versionAndCount.version
      );
      let sortedVersions;
      try {
        sortedVersions = versions.sort(compareRanges);
      } catch {
        // Unable to sort so skip this dependency (return it to indicate it was not fixed).
        return mismatchingVersion;
      }
      const fixedVersion = sortedVersions[sortedVersions.length - 1]; // Highest version will be sorted to end of list.

      for (const packageJsonPath of packageJsonPaths) {
        const packageJson: PackageJson = JSON.parse(
          readFileSync(packageJsonPath, 'utf-8')
        );

        if (
          packageJson.devDependencies &&
          packageJson.devDependencies[mismatchingVersion.dependency] &&
          packageJson.devDependencies[mismatchingVersion.dependency] !==
            fixedVersion
        ) {
          const packageJson = editJsonFile(packageJsonPath, { autosave: true });
          packageJson.set(
            `devDependencies.${mismatchingVersion.dependency}`,
            fixedVersion
          );
        }

        if (
          packageJson.dependencies &&
          packageJson.dependencies[mismatchingVersion.dependency] &&
          packageJson.dependencies[mismatchingVersion.dependency] !==
            fixedVersion
        ) {
          const packageJson = editJsonFile(packageJsonPath, { autosave: true });
          packageJson.set(
            `dependencies.${mismatchingVersion.dependency}`,
            fixedVersion
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
