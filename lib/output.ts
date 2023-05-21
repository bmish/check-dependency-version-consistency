import chalk from 'chalk';
import {
  compareVersionRangesSafe,
  getIncreasedLatestVersion,
} from './semver.js';
import { table } from 'table';
import { Dependencies } from './types.js';

/**
 * Returns human-readable tables describing mismatching dependency versions.
 */
export function dependenciesToMismatchSummary(
  dependencies: Dependencies
): string {
  const mismatchingDependencyVersions = Object.entries(dependencies)
    .filter(([, value]) => value.isMismatching)
    .map(([dependency, value]) => ({ dependency, versions: value.versions }));

  if (mismatchingDependencyVersions.length === 0) {
    throw new Error('No mismatching versions to output.');
  }

  const tables = mismatchingDependencyVersions
    .map((object) => {
      const headers = [chalk.bold(object.dependency), 'Usages', 'Packages'];

      const usageCounts = object.versions.map(
        (versionObject) => versionObject.packages.length
      );
      const latestUsageCount = Math.max(...usageCounts);
      const hasMultipleUsageCounts = !usageCounts.every(
        (count) => count === latestUsageCount
      );

      const rows = [...object.versions]
        .sort((a, b) => compareVersionRangesSafe(b.version, a.version))
        .map((versionObject) => {
          const usageCount = versionObject.packages.length;
          const packageNames = versionObject.packages.map(
            (package_) => package_.name
          );
          const packageListSentence =
            usageCount > 3
              ? `${packageNames.slice(0, 3).join(', ')}, and ${
                  usageCount - 3
                } other${usageCount - 3 === 1 ? '' : 's'}`
              : packageNames.join(', ');
          return [
            chalk.redBright(versionObject.version),
            // Bold the usage count if it's the latest, as long as it's not the only usage count present.
            usageCount === latestUsageCount && hasMultipleUsageCounts
              ? chalk.bold(usageCount)
              : usageCount,
            packageListSentence,
          ];
        });
      return table([headers, ...rows]);
    })
    .join('');

  return [
    `Found ${mismatchingDependencyVersions.length} ${
      mismatchingDependencyVersions.length === 1 ? 'dependency' : 'dependencies'
    } with mismatching versions across the workspace. Fix with \`--fix\`.`,
    tables,
  ].join('\n');
}

/**
 * Returns a summary of the mismatching dependency versions that were fixed.
 */
export function dependenciesToFixedSummary(dependencies: Dependencies): string {
  const mismatchingDependencyVersions = Object.entries(dependencies)
    .filter(([, value]) => value.isMismatching)
    .map(([dependency, value]) => ({ dependency, versions: value.versions }));

  if (mismatchingDependencyVersions.length === 0) {
    throw new Error('No fixes to output.');
  }

  const dependenciesAndFixedVersions = mismatchingDependencyVersions
    .flatMap((mismatchingVersion) => {
      let version;
      try {
        version = getIncreasedLatestVersion(
          mismatchingVersion.versions.map((v) => v.version)
        );
      } catch {
        return []; // Ignore this dependency since unable to get the version that we would have fixed it to.
      }
      return {
        dependency: mismatchingVersion.dependency,
        version,
      };
    })
    .sort((a, b) => a.dependency.localeCompare(b.dependency));

  return `Fixed versions for ${dependenciesAndFixedVersions.length} ${
    dependenciesAndFixedVersions.length === 1 ? 'dependency' : 'dependencies'
  }: ${dependenciesAndFixedVersions
    .map((object) => `${object.dependency}@${object.version}`)
    .join(', ')}`;
}
