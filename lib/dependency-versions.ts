import { readFileSync, existsSync } from 'fs';
import { getPackageJsonPaths } from './workspace';

export type DependenciesToVersionsSeen = Map<
  string,
  { title: string; version: string }[]
>;

export type MismatchingDependencyVersions = Array<{
  dependency: string;
  versions: string[];
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
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

  if (packageJson.dependencies) {
    Object.keys(packageJson.dependencies).forEach((dependency) => {
      recordDependencyVersion(
        dependenciesToVersionsSeen,
        dependency,
        title,
        packageJson.dependencies[dependency]
      );
    });
  }

  if (packageJson.devDependencies) {
    Object.keys(packageJson.devDependencies).forEach((dependency) => {
      recordDependencyVersion(
        dependenciesToVersionsSeen,
        dependency,
        title,
        packageJson.devDependencies[dependency]
      );
    });
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
  dependencyVersions: DependenciesToVersionsSeen,
  ignoreDeps: string[] = []
): MismatchingDependencyVersions {
  return [...dependencyVersions.keys()]
    .sort()
    .map((dependency) => {
      if (ignoreDeps.includes(dependency)) {
        return undefined;
      }

      const versionList = dependencyVersions.get(dependency);
      /* istanbul ignore if */
      if (!versionList) {
        // `versionList` should always exist at this point, this if statement is just to please TypeScript.
        return undefined;
      }

      const uniqueVersions = [
        ...new Set(versionList.map((obj) => obj.version)),
      ].sort();
      if (uniqueVersions.length > 1) {
        return { dependency, versions: uniqueVersions };
      }

      return undefined;
    })
    .filter((obj) => obj !== undefined) as MismatchingDependencyVersions;
}
