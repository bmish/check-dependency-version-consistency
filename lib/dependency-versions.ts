import { readFileSync, existsSync } from 'fs';
import type { PackageJson } from 'type-fest';
import { getPackageJsonPaths } from './workspace';

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
