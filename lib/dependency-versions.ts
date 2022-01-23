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
  return [...dependencyVersions.keys()].sort().flatMap((dependency) => {
    const versionList = dependencyVersions.get(dependency);
    /* istanbul ignore if */
    if (!versionList) {
      // `versionList` should always exist at this point, this if statement is just to please TypeScript.
      return [];
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

    return [];
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
  for (const mismatchingVersion of mismatchingVersions) {
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

export function getLatestVersion(versions: string[]): string {
  const sortedVersions = versions.sort(compareRanges);
  return sortedVersions[sortedVersions.length - 1]; // Latest version will be sorted to end of list.
}
