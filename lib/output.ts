import { styleText } from 'node:util';
import { table } from 'table';
import { compareVersionRangesSafe } from './semver.js';
import type { Dependencies } from './types.js';

/** Extracts the mismatching dependencies along with the versions seen of each. */
function getMismatchingVersions(dependencies: Dependencies) {
  return Object.entries(dependencies)
    .filter(([, value]) => value.isMismatching)
    .map(([dependency, value]) => ({
      dependency,
      versions: value.versions,
      fixedVersion: value.fixedVersion,
      isFixable: value.isFixable,
    }));
}

/**
 * Returns human-readable tables describing mismatching dependency versions.
 */
export function dependenciesToMismatchSummary(
  dependencies: Dependencies,
): string {
  const mismatchingDependencyVersions = getMismatchingVersions(dependencies);

  if (mismatchingDependencyVersions.length === 0) {
    throw new Error('No mismatching versions to output.');
  }

  const tables = mismatchingDependencyVersions
    .map((object) => {
      const headers = [
        styleText('bold', object.dependency),
        'Usages',
        'Packages',
      ];

      const usageCounts = object.versions.map(
        (versionObject) => versionObject.packages.length,
      );
      const latestUsageCount = Math.max(...usageCounts);
      const hasMultipleUsageCounts = !usageCounts.every(
        (count) => count === latestUsageCount,
      );

      const rows = [...object.versions]
        .toSorted((a, b) => compareVersionRangesSafe(b.version, a.version))
        .map((versionObject) => {
          const usageCount = versionObject.packages.length;
          const packageNames = versionObject.packages.map(
            (package_) => package_.name,
          );
          const packageListSentence =
            usageCount > 3
              ? `${packageNames.slice(0, 3).join(', ')}, and ${String(
                  usageCount - 3,
                )} other${usageCount - 3 === 1 ? '' : 's'}`
              : packageNames.join(', ');
          return [
            styleText('redBright', versionObject.version),
            // Bold the usage count if it's the latest, as long as it's not the only usage count present.
            usageCount === latestUsageCount && hasMultipleUsageCounts
              ? styleText('bold', String(usageCount))
              : usageCount,
            packageListSentence,
          ];
        });
      return table([headers, ...rows]);
    })
    .join('');

  return [
    `Found ${String(mismatchingDependencyVersions.length)} ${
      mismatchingDependencyVersions.length === 1 ? 'dependency' : 'dependencies'
    } with mismatching versions across the workspace. Fix with \`--fix\`.`,
    tables,
  ].join('\n');
}

/**
 * Returns a summary of the mismatching dependency versions that were fixed.
 * Uses the fix targets already decided during check (does not recompute versions).
 */
export function dependenciesToFixedSummary(dependencies: Dependencies): string {
  const fixedDependencies = getMismatchingVersions(dependencies)
    .flatMap((mismatchingVersion) => {
      if (
        !mismatchingVersion.isFixable ||
        mismatchingVersion.fixedVersion === undefined
      ) {
        return [];
      }
      return {
        dependency: mismatchingVersion.dependency,
        version: mismatchingVersion.fixedVersion,
      };
    })
    .toSorted((a, b) => a.dependency.localeCompare(b.dependency));

  if (fixedDependencies.length === 0) {
    throw new Error('No fixes to output.');
  }

  return `Fixed versions for ${String(fixedDependencies.length)} ${
    fixedDependencies.length === 1 ? 'dependency' : 'dependencies'
  }: ${fixedDependencies
    .map((object) => `${object.dependency}@${object.version}`)
    .join(', ')}`;
}
